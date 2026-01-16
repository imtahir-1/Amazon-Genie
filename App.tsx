
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
      hasApiKey: false,
    };
  });
  
  const [viewingImage, setViewingImage] = useState<{ url: string, title: string } | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setState(prev => ({ ...prev, hasApiKey: hasKey }));
    };
    checkKey();
  }, []);

  // Sync state to local storage whenever history changes
  useEffect(() => {
    localStorage.setItem('listing_genius_history_v2', JSON.stringify(state.history));
  }, [state.history]);

  // Sync current work back to history array automatically
  useEffect(() => {
    if (state.activeHistoryId && state.step === 'results') {
      setState(prev => {
        const historyIndex = prev.history.findIndex(h => h.id === prev.activeHistoryId);
        if (historyIndex === -1) return prev;

        const updatedHistory = [...prev.history];
        updatedHistory[historyIndex] = {
          ...updatedHistory[historyIndex],
          images: prev.images,
          analysis: prev.analysis!,
          referenceImage: prev.referenceImage
        };

        return { ...prev, history: updatedHistory };
      });
    }
  }, [state.images, state.analysis, state.referenceImage, state.activeHistoryId, state.step]);

  const handleOpenKey = async () => {
    // @ts-ignore
    await window.aistudio.openSelectKey();
    setState(prev => ({ ...prev, hasApiKey: true }));
  };

  const handleStartAnalysis = async (input: string, type: 'url' | 'asin' | 'image') => {
    setState(prev => ({ 
      ...prev, 
      step: 'analyzing', 
      error: undefined, 
      inputSource: { type, value: input },
      referenceImage: type === 'image' ? input : undefined 
    }));
    
    try {
      const analysis = await GeminiService.analyzeProduct(input, type);
      const briefs = await GeminiService.generateListingBriefs(analysis);
      const finalReference = type === 'image' ? input : (analysis.extractedImageUrls?.[0]);
      
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        input,
        type,
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
        history: [newHistoryItem, ...prev.history].slice(0, 20)
      }));
    } catch (err: any) {
      console.error("Analysis Error:", err);
      setState(prev => ({ 
        ...prev, 
        step: 'input', 
        error: "Analysis failed. Please try a different product or verify your API key." 
      }));
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
    if (!state.hasApiKey) await handleOpenKey();

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
          versions: [...img.versions, url],
          isLoading: false 
        } : img)
      }));
    } catch (err: any) {
      console.error(err);
      setState(prev => ({
        ...prev,
        images: prev.images.map((img, i) => i === index ? { ...img, isLoading: false } : img),
        error: "Generation failed."
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
          versions: [...img.versions, url],
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
    <div className="min-h-screen bg-[#FDFDFF] pb-20">
      <Header onReset={() => setState(prev => ({ ...prev, step: 'input', activeHistoryId: undefined }))} onExport={() => alert('Exporting...')} />
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
          <div className="py-32 flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-8"></div>
            <h2 className="text-3xl font-black">AI is Researching...</h2>
            <p className="text-gray-500">Extracting specs and researching competitors...</p>
          </div>
        )}
        
        {state.step === 'results' && state.analysis && (
          <div className="space-y-12">
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
