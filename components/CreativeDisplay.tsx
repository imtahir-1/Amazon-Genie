
import React, { useRef, useState } from 'react';
import { ListingImage } from '../types';
import BriefCard from './BriefCard';

interface CreativeDisplayProps {
  images: ListingImage[];
  referenceImage?: string;
  onUpdateReference: (newRef: string) => void;
  onGenerateImage: (index: number) => void;
  onEditImage: (index: number, prompt: string) => void;
  onViewImage: (url: string, title: string) => void;
  onUpdateField: (id: string, field: keyof ListingImage, value: string) => void;
  onSwitchVersion: (index: number, url: string) => void;
}

const CreativeDisplay: React.FC<CreativeDisplayProps> = ({ 
  images, 
  referenceImage, 
  onUpdateReference, 
  onGenerateImage, 
  onEditImage,
  onViewImage,
  onUpdateField,
  onSwitchVersion
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateReference(reader.result as string);
      };
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
    <div className="space-y-12">
      <section className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full md:w-48 h-48 rounded-2xl border-2 border-dashed transition-all flex items-center justify-center overflow-hidden relative group shrink-0 cursor-pointer ${
              isDragging ? 'border-blue-500 bg-blue-50 scale-105' : 
              referenceImage ? 'border-gray-200 bg-gray-50' : 'border-gray-200 bg-gray-50 hover:border-blue-400'
            }`}
          >
            {referenceImage ? (
              <>
                <img src={referenceImage} alt="Reference" className="w-full h-full object-contain p-2" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-bold px-3 py-1 bg-white/20 rounded-lg">Update Reference</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-gray-400 group-hover:text-blue-600 transition-colors">
                <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-bold uppercase tracking-widest">{isDragging ? 'Drop Image' : 'Add Photo'}</span>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-black text-gray-900 mb-2">Base Product DNA</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              This reference image ensures your product remains identical across all generated versions. You can drag and drop a new image here at any time to retarget the visual style.
            </p>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-black transition-all"
              >
                {referenceImage ? "Update Reference Image" : "Upload Reference Photo"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Image Brief Stack</h2>
            <p className="text-gray-500 mt-1">Refine strategy or headlines before generating. Every version is saved for later retrieval.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {images.map((image, index) => (
            <BriefCard 
              key={image.id} 
              image={image} 
              onGenerate={() => onGenerateImage(index)} 
              onEdit={(prompt) => onEditImage(index, prompt)}
              onUpdateField={(field, value) => onUpdateField(image.id, field, value)}
              onSwitchVersion={(url) => onSwitchVersion(index, url)}
              onView={() => image.generatedImageUrl && onViewImage(image.generatedImageUrl, image.title)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreativeDisplay;
