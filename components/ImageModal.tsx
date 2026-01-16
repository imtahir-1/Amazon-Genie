
import React from 'react';

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  title: string;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, imageUrl, onClose, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 animate-in fade-in duration-300">
      <div 
        className="absolute inset-0 bg-black/95 backdrop-blur-xl" 
        onClick={onClose}
      />
      
      <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center z-10 group">
        <div className="absolute top-0 right-0 -mt-12 md:-mr-12">
          <button 
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 w-full flex items-center justify-center bg-[#F8F9FC]">
          <img 
            src={imageUrl} 
            alt={title} 
            className="max-w-full max-h-[80vh] object-contain"
          />
        </div>

        <div className="mt-6 text-center">
          <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
          <p className="text-white/60 text-sm">Professional Amazon Listing Asset • 8K Render</p>
          
          <div className="mt-6 flex gap-4 justify-center">
             <a 
              href={imageUrl} 
              download={`${title.toLowerCase().replace(/\s+/g, '-')}.png`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Asset
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
