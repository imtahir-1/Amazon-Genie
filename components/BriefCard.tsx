
import React, { useState } from 'react';
import { ListingImage, ImageType } from '../types';

interface BriefCardProps {
  image: ListingImage;
  onGenerate: () => void;
  onEdit: (prompt: string) => void;
  onView: () => void;
  onUpdateField: (field: keyof ListingImage, value: string) => void;
  onSwitchVersion: (url: string) => void;
}

const BriefCard: React.FC<BriefCardProps> = ({ image, onGenerate, onEdit, onView, onUpdateField, onSwitchVersion }) => {
  const [editPrompt, setEditPrompt] = useState('');
  const [showEditInput, setShowEditInput] = useState(false);
  const [isEditingBrief, setIsEditingBrief] = useState(false);
  const [showVersions, setShowVersions] = useState(false);

  const versions = Array.isArray(image.versions) ? image.versions : [];
  const currentVersionIndex = image.generatedImageUrl ? versions.indexOf(image.generatedImageUrl) : -1;

  const getTypeStyles = (type: string) => {
    if (!type) return 'bg-gray-500 text-white';
    if (type.includes('Main')) return 'bg-orange-500 text-white';
    if (type.includes('Lifestyle')) return 'bg-purple-600 text-white';
    if (type.includes('Infographic')) return 'bg-blue-600 text-white';
    return 'bg-emerald-600 text-white';
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editPrompt.trim()) {
      onEdit(editPrompt);
      setEditPrompt('');
      setShowEditInput(false);
    }
  };

  const quickRefines = [
    "Add a retro filter",
    "Remove the person in the background",
    "Studio lighting",
    "Change to white background",
    "Add natural sunlight"
  ];

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full overflow-hidden group">
      <div className="aspect-square bg-[#F8F9FC] relative overflow-hidden flex items-center justify-center">
        {image.generatedImageUrl ? (
          <>
            <img 
              src={image.generatedImageUrl} 
              alt={image.title} 
              className="w-full h-full object-cover" 
            />
            {!image.isLoading && !showEditInput && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center backdrop-blur-sm gap-2">
                <div className="flex gap-2">
                  <button onClick={onView} className="bg-white text-gray-900 px-4 py-2 rounded-xl font-bold text-xs">Full View</button>
                  <button onClick={() => setShowEditInput(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs">AI Refine</button>
                </div>
                <div className="flex gap-2">
                  <button onClick={onGenerate} className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl font-bold text-xs border border-white/20">Regenerate</button>
                  {versions.length > 1 && (
                    <button onClick={() => setShowVersions(!showVersions)} className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl font-bold text-xs border border-white/20">
                      v{currentVersionIndex + 1} of {versions.length}
                    </button>
                  )}
                </div>
              </div>
            )}

            {showVersions && !image.isLoading && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-xl z-30 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Generation History</h4>
                  <button onClick={() => setShowVersions(false)} className="text-gray-400 hover:text-gray-900">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3 overflow-y-auto max-h-[80%] p-1">
                  {versions.map((url, i) => (
                    <button 
                      key={i} 
                      onClick={() => { onSwitchVersion(url); setShowVersions(false); }}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${image.generatedImageUrl === url ? 'border-blue-500 scale-95' : 'border-transparent opacity-70 hover:opacity-100'}`}
                    >
                      <img src={url} className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] font-bold py-0.5 text-center">v{i+1}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showEditInput && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 z-20">
                <form onSubmit={handleEditSubmit} className="w-full space-y-3">
                  <h4 className="text-white text-xs font-black uppercase tracking-widest mb-2 text-center">Nano Banana Magic Edit</h4>
                  <input
                    autoFocus
                    type="text"
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="e.g. Add a retro filter..."
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm outline-none"
                  />
                  <div className="flex flex-wrap gap-2 justify-center py-2">
                    {quickRefines.map(tag => (
                      <button key={tag} type="button" onClick={() => setEditPrompt(tag)} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded-md text-[9px] text-white/70 border border-white/5 transition-colors">
                        {tag}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-xs font-bold">Apply</button>
                    <button type="button" onClick={() => setShowEditInput(false)} className="px-4 bg-white/10 text-white py-2 rounded-xl text-xs font-bold">Cancel</button>
                  </div>
                </form>
              </div>
            )}
          </>
        ) : (
          <div className="p-10 text-center w-full">
            {image.isLoading ? (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Generating Visual...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-50 rounded-full mx-auto flex items-center justify-center text-blue-400">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <button onClick={onGenerate} className="bg-gray-900 text-white px-8 py-3 rounded-2xl text-sm font-black shadow-xl hover:bg-black transition-all uppercase tracking-widest">
                  Generate Image
                </button>
              </div>
            )}
          </div>
        )}

        <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg z-10 ${getTypeStyles(image.type)}`}>
          {image.type || 'Asset'}
        </div>
      </div>

      <div className="p-8 flex-1 flex flex-col relative">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-gray-900 text-lg leading-tight">{image.title || 'Brief'}</h3>
          <button 
            onClick={() => setIsEditingBrief(!isEditingBrief)}
            className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full transition-all ${isEditingBrief ? 'bg-green-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
          >
            {isEditingBrief ? 'Save' : 'Edit'}
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Headline & Selling Hook</h4>
            {isEditingBrief ? (
              <div className="space-y-2">
                <input value={image.headline || ''} onChange={(e) => onUpdateField('headline', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-900 outline-none" placeholder="Headline" />
                <textarea value={image.subCopy || ''} onChange={(e) => onUpdateField('subCopy', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 outline-none" rows={2} placeholder="Benefits" />
              </div>
            ) : (
              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <p className="text-gray-900 font-bold leading-snug mb-1">{image.headline || 'No Headline'}</p>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">{image.subCopy || 'No strategy defined'}</p>
              </div>
            )}
          </div>
          <div>
            <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Strategy</h4>
            <p className="text-xs text-gray-500 font-medium italic border-l-2 border-blue-200 pl-3">{image.creativeBrief || 'Standard commerce optimization'}</p>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
              {image.generatedImageUrl ? 'Ready' : 'Pending'}
            </span>
            {versions.length > 1 && <span className="text-[9px] font-bold text-blue-400">{versions.length} versions</span>}
          </div>
          {image.generatedImageUrl && (
            <div className="flex gap-2">
              <button onClick={onView} className="text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              </button>
              <a href={image.generatedImageUrl} download={`asset.png`} className="text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BriefCard;
