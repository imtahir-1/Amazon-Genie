
import React, { useState, useEffect } from 'react';
import { GeminiService } from './services/geminiService';
import { AppState, ListingImage, HistoryItem, User } from './types';
import Header from './components/Header';
import Login from './components/Login';
import ProductInput from './components/ProductInput';
import AnalysisView from './components/AnalysisView';
import CreativeDisplay from './components/CreativeDisplay';
import ImageModal from './components/ImageModal';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    // Attempt to recover session
    const savedUser = localStorage.getItem('listing_genius_session');
    const user = savedUser ? JSON.parse(savedUser) : undefined;
    
    // Attempt to recover history for ALL users (we filter by current user later)
    const savedHistory = localStorage.getItem('listing_genius_history_v3');
    const allHistory = savedHistory ? JSON.parse(savedHistory) : [];
    
    return {
      step: user ? 'input' : 'login',
      user: user,
      images: [],
      history: allHistory,
      hasApiKey: true,
    };
  });
  
  const [loadingMilestone, setLoadingMilestone] = useState<string>('');
  const [viewingImage, setViewingImage] = useState<{ url: string, title: string } | null>(null);

  // Sync Global History
  useEffect(() => {
    localStorage.setItem('listing_genius_history_v3', JSON.stringify(state.history));
  }, [state.history]);

  // Sync Current Projects if active
  useEffect(() => {
    if (state.activeHistoryId && state.step === 'results' && state.user) {
      const idx = state.history.findIndex(h => h.id === state.activeHistoryId);
      if (idx !== -1) {
        const current = state.history[idx];
        if (JSON.stringify(current.images) !== JSON.stringify(state.images)) {
          setState(prev => {
            const newHist = [...prev.history];
            newHist[idx] = { ...newHist[idx], images: prev.images };
            return { ...prev, history: newHist };
          });
        }
      }
    }
  }, [state.images, state.activeHistoryId, state.step, state.user, state.history]);

  const handleLogin = (user: User) => {
    localStorage.setItem('listing_genius_session', JSON.stringify(user));
    setState(prev => ({ ...prev, user, step: 'input' }));
  };

  const handleLogout = () => {
    localStorage.removeItem('listing_genius_session');
    setState(prev => ({ ...prev, user: undefined, step: 'login', activeHistoryId: undefined, images: [] }));
  };

  const handleStartAnalysis = async (data: { text: string, image: string, type: 'url' | 'asin' | 'image' | 'smart' }) => {
    if (!state.user) return;

    setState(prev => ({ 
      ...prev, 
      step: 'analyzing', 
      error: undefined, 
      inputSource: { type: data.type, value: data.text || data.image },
      referenceImage: data.image || undefined 
    }));
    
    try {
      setLoadingMilestone('Connecting to Google Search...');
      const analysis = await GeminiService.analyzeProduct({ text: data.text, image: data.image });
      
      setLoadingMilestone('Synthesizing Visual Briefs...');
      const briefs = await GeminiService.generateListingBriefs(analysis);
      
      if (!briefs || briefs.length === 0) throw new Error("AI could not generate briefs.");

      const finalReference = data.image || (analysis.extractedImageUrls && analysis.extractedImageUrls[0]) || undefined;
      
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        userId: state.user.id,
        timestamp: Date.now(),
        input: data.text || 'Manual Visual Input',
        type: data.type,
        analysis,
        referenceImage: finalReference,
        images: briefs.map(b => ({ ...b, versions: [] }))
      };

      setState(prev => ({
        ...prev,
        step: 'results',
        activeHistoryId: newHistoryItem.id,
        analysis,
        images: newHistoryItem.images,
        referenceImage: finalReference,
        history: [newHistoryItem, ...prev.history]
      }));
    } catch (err: any) {
      console.error(err);
      setState(prev => ({ ...prev, step: 'input', error: err.message || "Engine Error. Please retry." }));
    } finally {
      setLoadingMilestone('');
    }
  };

  const handleLoadFromHistory = (item: HistoryItem) => {
    setState(prev => ({
      ...prev,
      step: 'results',
      activeHistoryId: item.id,
      analysis: item.analysis,
      images: item.images,
      referenceImage: item.referenceImage,
      inputSource: { type: item.type, value: item.input }
    }));
  };

  const updateImageField = (id: string, field: keyof ListingImage, value: string) => {
    setState(prev => ({
      ...prev,
      images: prev.images.map(img => img.id === id ? { ...img, [field]: value } : img)
    }));
  };

  const handleGenerateImage = async (index: number) => {
    const image = state.images[index];
    if (!image || !state.analysis) return;

    setState(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? { ...img, isLoading: true } : img)
    }));

    try {
      const ref = state.referenceImage?.startsWith('data:') ? state.referenceImage : undefined;
      const url = await GeminiService.generateImage(image, ref, state.analysis.visualDescription);
      
      setState(prev => ({
        ...prev,
        images: prev.images.map((img, i) => i === index ? { 
          ...img, 
          generatedImageUrl: url, 
          versions: [...(img.versions || []), url],
          isLoading: false 
        } : img)
      }));
    } catch (err: any) {
      console.error(err);
      setState(prev => ({
        ...prev,
        images: prev.images.map((img, i) => i === index ? { ...img, isLoading: false } : img),
        error: "Image Engine Timeout. Please try again."
      }));
    }
  };

  const handleEditImage = async (index: number, editPrompt: string) => {
    const image = state.images[index];
    if (!image || !image.generatedImageUrl) return;

    setState(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? { ...img, isLoading: true } : img)
    }));

    try {
      const url = await GeminiService.editImage(image.generatedImageUrl, editPrompt);
      setState(prev => ({
        ...prev,
        images: prev.images.map((img, i) => i === index ? { 
          ...img, 
          generatedImageUrl: url, 
          versions: [...(img.versions || []), url],
          isLoading: false 
        } : img)
      }));
    } catch (err) {
      console.error(err);
      setState(prev => ({
        ...prev,
        images: prev.images.map((img, i) => i === index ? { ...img, isLoading: false } : img)
      }));
    }
  };

  const handleSwitchVersion = (index: number, versionUrl: string) => {
    setState(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? { ...img, generatedImageUrl: versionUrl } : img)
    }));
  };

  const handleUpdateReference = (newRef: string) => {
    setState(prev => ({ ...prev, referenceImage: newRef }));
  };

  // Filter history for current user
  const userHistory = state.history.filter(h => h.userId === state.user?.id);

  return (
    <div className="min-h-screen bg-[#FDFDFF] pb-20 selection:bg-blue-100">
      <Header 
        user={state.user} 
        onReset={() => setState(prev => ({ ...prev, step: 'input', activeHistoryId: undefined, images: [] }))} 
        onLogout={handleLogout}
        onExport={() => alert('Exporting all assets...')} 
      />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {state.step === 'login' && <Login onLogin={handleLogin} />}

        {state.step === 'input' && state.user && (
          <ProductInput 
            onSubmit={handleStartAnalysis} 
            history={userHistory} 
            onSelectHistory={handleLoadFromHistory} 
            error={state.error} 
          />
        )}
        
        {state.step === 'analyzing' && (
          <div className="py-32 flex flex-col items-center animate-in fade-in duration-700">
            <div className="relative mb-12">
              <div className="w-24 h-24 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-blue-50 rounded-full animate-pulse"></div>
              </div>
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">E-commerce Intelligence</h2>
            <p className="text-blue-600 font-black uppercase tracking-widest text-[10px] mb-8">{loadingMilestone}</p>
            <p className="text-gray-500 font-medium max-w-sm text-center leading-relaxed">
              We are merging multimodal vision with real-time web grounding to map your product strategy.
            </p>
          </div>
        )}
        
        {state.step === 'results' && state.analysis && (
          <div className="space-y-12 animate-in fade-in zoom-in-95 duration-500">
            <AnalysisView analysis={state.analysis} />
            <CreativeDisplay 
              images={state.images} 
              referenceImage={state.referenceImage}
              onUpdateReference={handleUpdateReference}
              onGenerateImage={handleGenerateImage} 
              onEditImage={handleEditImage}
              onUpdateField={updateImageField}
              onSwitchVersion={handleSwitchVersion}
              onViewImage={(url, title) => setViewingImage({ url, title })}
            />
          </div>
        )}
      </main>
      
      <ImageModal 
        isOpen={!!viewingImage} 
        imageUrl={viewingImage?.url || ''} 
        title={viewingImage?.title || ''} 
        onClose={() => setViewingImage(null)} 
      />
    </div>
  );
};

export default App;
