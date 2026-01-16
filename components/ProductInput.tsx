
import React, { useState, useRef } from 'react';
import { HistoryItem } from '../types';

interface ProductInputProps {
  onSubmit: (input: string, type: 'url' | 'asin' | 'image') => void;
  onSelectHistory: (item: HistoryItem) => void;
  error?: string;
  history: HistoryItem[];
}

const ProductInput: React.FC<ProductInputProps> = ({ onSubmit, onSelectHistory, error, history }) => {
  const [input, setInput] = useState('');
  const [inputType, setInputType] = useState<'url' | 'asin' | 'image'>('image');
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputType === 'image' && preview) {
      onSubmit(preview, 'image');
    } else if (input.trim()) {
      onSubmit(input, inputType);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="text-center mb-12">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6 ring-1 ring-blue-100">
          AI-Powered Creative Studio
        </div>
        
        <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
          High-Conversion Listings <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Generated Instantly</span>
        </h1>
        
        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Professional infographics and lifestyle assets for pro sellers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white p-2 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden">
            <div className="flex p-1 bg-gray-50 rounded-2xl mb-2">
              <button
                onClick={() => setInputType('image')}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${inputType === 'image' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Upload Photo
              </button>
              <button
                onClick={() => setInputType('url')}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${inputType === 'url' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
              >
                URL
              </button>
              <button
                onClick={() => setInputType('asin')}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${inputType === 'asin' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
              >
                ASIN
              </button>
            </div>

            <div className="p-4">
              {inputType === 'image' ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl transition-all cursor-pointer group relative overflow-hidden flex flex-col items-center justify-center ${
                    preview ? 'border-blue-200 aspect-video' : 'border-gray-200 aspect-video hover:border-blue-400 hover:bg-blue-50/30'
                  }`}
                >
                  {preview ? (
                    <>
                      <img src={preview} alt="Preview" className="w-full h-full object-contain p-4" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm font-bold">Change Image</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-900 font-bold">Upload product photo</p>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
              ) : (
                <div className="py-12 px-4 text-center">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={inputType === 'url' ? 'Paste Amazon URL...' : 'Enter ASIN Code...'}
                    className="w-full text-2xl font-bold bg-transparent outline-none placeholder:text-gray-200 text-center"
                  />
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={inputType === 'image' ? !preview : !input.trim()}
                className="w-full mt-6 bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition-all disabled:opacity-30 flex items-center justify-center"
              >
                Generate Creative Stack
              </button>
            </div>
          </div>
          {error && <p className="mt-4 text-red-500 font-bold text-sm text-center">{error}</p>}
        </div>

        <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Recently Generated</h3>
          {history.length > 0 ? (
            <div className="space-y-4">
              {history.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => onSelectHistory(item)}
                  className="flex items-center p-3 bg-white rounded-2xl border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden mr-4 shrink-0 border border-gray-50">
                    {item.referenceImage ? (
                      <img src={item.referenceImage} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-gray-900 truncate">{item.analysis.category}</p>
                    <p className="text-[10px] text-gray-500 font-medium">
                      {new Date(item.timestamp).toLocaleDateString()} • {item.images.filter(img => img.generatedImageUrl).length}/8 Ready
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p className="text-xs font-bold uppercase tracking-widest">No history yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductInput;
