
import React, { useState, useEffect } from 'react';
import { GeminiService } from './services/geminiService';
import { AppState, ListingImage, HistoryItem } from './types';
import Header from './components/Header';
import ProductInput from './components/ProductInput';
import AnalysisView from './components/AnalysisView';
import CreativeDisplay from './components/CreativeDisplay';
import ImageModal from './components/ImageModal';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('listing_genius_history_v2');
    return {
      step: 'input',
      images: [],
      history: saved ? JSON.parse(saved) : [],
      hasApiKey: true,
    };
  });
  
  const [loadingMilestone, setLoadingMilestone] = useState<string>('');
  const [viewingImage, setViewingImage] = useState<{ url: string, title: string } | null>(null);

  useEffect(() => {
    localStorage.setItem('listing_genius_history_v2', JSON.stringify(state.history));
  }, [state.history]);

  const handleStartAnalysis = async (data: { text: string, image: string, type: 'url' | 'asin' | 'image' | 'smart' }) => {
    setState(prev => ({ 
      ...prev, 
      step: 'analyzing', 
      error: undefined, 
      inputSource: { type: data.type, value: data.text || data.image },
      referenceImage: data.image || undefined 
    }));
    
    try {
      setLoadingMilestone('Gathering Web Intelligence...');
      const analysis = await GeminiService.analyzeProduct({ text: data.text, image: data.image });
      
      setLoadingMilestone('Building Visual Strategy...');
      const briefs = await GeminiService.generateListingBriefs(analysis);
      
      if (!briefs || briefs.length === 0) {
        throw new Error("Strategy engine failed to output briefs.");
      }

      const finalReference = data.image || (analysis.extractedImageUrls && analysis.extractedImageUrls[0]) || undefined;
      
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        input: data.text || 'Visual Input',
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
        history: [newHistoryItem, ...prev.history].slice(0, 50)
      }));
    } catch (err: any) {
      console.error("Critical Failure:", err);
      setState(prev => ({ 
        ...prev, 
        step: 'input', 
        error: err.message || "Something went wrong. Please check your inputs and try again." 
      }));
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
        error: "Asset generation timed out. Please try again."
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

  return (
    <div className="min-h-screen bg-[#FDFDFF] pb-20 selection:bg-blue-100">
      <Header onReset={() => setState(prev => ({ ...prev, step: 'input', activeHistoryId: undefined }))} onExport={() => alert('Exporting all assets...')} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {state.step === 'input' && (
          <ProductInput 
            onSubmit={handleStartAnalysis} 
            history={state.history} 
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
            <h2 className="text-4xl font-black text-gray-900 mb-2">Deep Intelligence Scan</h2>
            <p className="text-blue-600 font-black uppercase tracking-widest text-xs mb-8">{loadingMilestone}</p>
            <p className="text-gray-500 font-medium max-w-sm text-center leading-relaxed">
              We are combining web grounding with multi-modal vision to build your high-conversion assets.
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
