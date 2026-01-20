
import React, { useState, useRef } from 'react';
import { HistoryItem } from '../types';

interface ProductInputProps {
  onSubmit: (data: { text: string, image: string, type: 'url' | 'asin' | 'image' | 'smart' }) => void;
  onSelectHistory: (item: HistoryItem) => void;
  error?: string;
  history: HistoryItem[];
}

const ProductInput: React.FC<ProductInputProps> = ({ onSubmit, onSelectHistory, error, history }) => {
  const [textInput, setTextInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let type: 'url' | 'asin' | 'image' | 'smart' = 'smart';
    
    if (textInput && imagePreview) type = 'smart';
    else if (imagePreview) type = 'image';
    else if (textInput.startsWith('http')) type = 'url';
    else type = 'asin';

    onSubmit({ 
      text: textInput.trim(), 
      image: imagePreview || '', 
      type 
    });
  };

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="text-center mb-12">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6 ring-1 ring-blue-100">
          Smart Multi-Modal Studio
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
          Professional Listings <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Powered by Combined Intelligence</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Upload a photo and paste a link for the most accurate AI analysis possible.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left Side: Photo Upload */}
              <div className="p-8 border-r border-gray-100 bg-gray-50/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Primary Product Photo</h3>
                  {imagePreview && (
                    <button onClick={() => setImagePreview(null)} className="text-[10px] font-bold text-red-500 hover:text-red-600">Remove</button>
                  )}
                </div>
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-3xl transition-all cursor-pointer group relative overflow-hidden flex flex-col items-center justify-center min-h-[280px] ${
                    isDragging ? 'border-blue-500 bg-blue-50/50 scale-[0.98]' : 
                    imagePreview ? 'border-blue-200 bg-white' : 'border-gray-200 hover:border-blue-400 hover:bg-white'
                  }`}
                >
                  {imagePreview ? (
                    <img src={imagePreview} className="w-full h-full object-contain p-4" />
                  ) : (
                    <>
                      <div className={`w-14 h-14 rounded-2xl shadow-sm flex items-center justify-center mb-4 transition-all ${isDragging ? 'bg-blue-600 text-white scale-110' : 'bg-white text-blue-600 group-hover:scale-110'}`}>
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                      <p className={`text-gray-900 font-bold ${isDragging ? 'text-blue-600' : ''}`}>
                        {isDragging ? 'Drop Image Now' : 'Drag & Drop Photo'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 font-medium">PNG, JPG up to 10MB</p>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
              </div>

              {/* Right Side: URL/ASIN Input */}
              <div className="p-8 flex flex-col justify-center">
                <div className="mb-8">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Research Source (Optional)</h3>
                  <div className="relative">
                    <input
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Paste Amazon Link or ASIN..."
                      className="w-full text-lg font-bold bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all placeholder:text-gray-300"
                    />
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-white border border-gray-100 rounded-lg text-[10px] font-bold text-gray-500">Auto-Detect ASIN</span>
                      <span className="px-3 py-1 bg-white border border-gray-100 rounded-lg text-[10px] font-bold text-gray-500">Live Web Scrape</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                  <div className="flex items-start">
                    <div className="mt-0.5 mr-3 text-blue-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                    </div>
                    <p className="text-[11px] font-bold text-blue-700 leading-relaxed">
                      {textInput && imagePreview 
                        ? "Enhanced Mode: AI will combine photo analysis with real-time web research for maximum accuracy."
                        : imagePreview 
                        ? "Visual Only: AI will analyze physical features to generate concepts."
                        : "Research Only: AI will scrape the web to understand product specs."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border-t border-gray-100">
              <button
                onClick={handleSubmit}
                disabled={!textInput.trim() && !imagePreview}
                className="w-full bg-gray-900 text-white py-5 rounded-3xl font-black text-xl hover:bg-black transition-all disabled:opacity-30 flex items-center justify-center gap-3 shadow-2xl shadow-gray-200 active:scale-95"
              >
                {textInput && imagePreview && (
                  <svg className="w-5 h-5 text-blue-400 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                )}
                Generate Listing Assets
              </button>
            </div>
          </div>
          {error && <p className="mt-6 text-red-500 font-bold text-sm text-center bg-red-50 py-3 rounded-2xl border border-red-100">{error}</p>}
        </div>

        <div className="bg-gray-50/50 rounded-[2.5rem] p-8 border border-gray-100 flex flex-col h-full">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Recent Work</h3>
          {history.length > 0 ? (
            <div className="space-y-5 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
              {history.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => onSelectHistory(item)}
                  className="flex items-center p-4 bg-white rounded-3xl border border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl overflow-hidden mr-4 shrink-0 border border-gray-50 shadow-inner">
                    {item.referenceImage ? (
                      <img src={item.referenceImage} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-gray-900 truncate mb-1">{item.analysis.category || 'Untitled'}</p>
                    <div className="flex items-center text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                      <span className={`mr-2 ${item.type === 'smart' ? 'text-blue-500' : ''}`}>{item.type}</span>
                      <span>• {new Date(item.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl">
              <p className="text-xs font-black uppercase tracking-widest">No history</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductInput;
