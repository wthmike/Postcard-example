import React, { useRef } from 'react';
import { Plus, RefreshCcw } from 'lucide-react';
import { UIProps } from '../types';

interface ExtendedUIProps extends UIProps {
  onUploadFront: (file: File) => void;
  onUploadBack: (file: File) => void;
  visible: boolean;
}

const UI: React.FC<ExtendedUIProps> = ({ 
  currentSlideIndex, 
  slides, 
  onNext, 
  onPrev, 
  onSelect,
  onUploadFront,
  onUploadBack,
  visible
}) => {
  const currentSlide = slides[currentSlideIndex];
  
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, callback: (file: File) => void) => {
    if (e.target.files && e.target.files[0]) {
      callback(e.target.files[0]);
    }
  };

  return (
    <div className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-700 ease-out ${visible ? 'opacity-100 delay-300' : 'opacity-0 delay-0'}`}>
      
      {/* --- SWISS EDITORIAL GRID LAYOUT --- */}
      <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-between">
        
        {/* ROW 1: TOP HEADER */}
        <div className="flex justify-between items-start">
          
          {/* TOP LEFT: Static Title */}
          <div className="flex flex-col gap-1 pointer-events-auto">
            <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-[#212121]/40 uppercase">
              Format
            </span>
            <div className="text-4xl md:text-6xl text-[#212121] uppercase tracking-tighter leading-none">
              <span className="font-semibold block md:inline">A5 </span>
              <span className="font-extrabold italic block md:inline">Postcard</span>
            </div>
          </div>

          {/* TOP RIGHT: Upload Controls */}
          <div className="flex flex-col items-end gap-4 pointer-events-auto">
             <span className="text-[10px] md:text-xs font-semibold tracking-[0.1em] text-[#212121]/60 uppercase mb-2">
               See how your artwork would look here
             </span>
             
             <button 
                onClick={() => frontInputRef.current?.click()}
                className="group flex items-center gap-3 text-right hover:opacity-100 opacity-60 transition-opacity"
             >
                <span className="text-xs md:text-sm font-medium tracking-widest text-[#212121] uppercase group-hover:underline underline-offset-4 decoration-[#212121]/30">
                  Front Design
                </span>
                <div className="w-6 h-6 rounded-full border border-[#212121]/10 flex items-center justify-center group-hover:bg-[#212121] group-hover:text-white transition-colors">
                  <Plus size={12} />
                </div>
                <input ref={frontInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, onUploadFront)} />
             </button>

             <button 
                onClick={() => backInputRef.current?.click()}
                className="group flex items-center gap-3 text-right hover:opacity-100 opacity-60 transition-opacity"
             >
                <span className="text-xs md:text-sm font-medium tracking-widest text-[#212121] uppercase group-hover:underline underline-offset-4 decoration-[#212121]/30">
                  Back Design
                </span>
                <div className="w-6 h-6 rounded-full border border-[#212121]/10 flex items-center justify-center group-hover:bg-[#212121] group-hover:text-white transition-colors">
                  <Plus size={12} />
                </div>
                <input ref={backInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, onUploadBack)} />
             </button>
          </div>

        </div>

        {/* ROW 2: BOTTOM FOOTER */}
        <div className="flex justify-between items-end">
          
          {/* BOTTOM LEFT: Description */}
          <div className="max-w-xs md:max-w-md pointer-events-auto">
             <h2 className="text-xl md:text-2xl text-[#212121] font-semibold mb-2 tracking-wide">
               {currentSlide.title}
             </h2>
             <p className="text-xs md:text-sm text-[#212121]/60 leading-relaxed font-light border-l border-[#212121]/10 pl-4">
               {currentSlide.description}
             </p>
          </div>

          {/* BOTTOM RIGHT: Flip Toggle */}
          <div className="pointer-events-auto">
            <button 
              onClick={onNext}
              className="group flex items-center gap-3 hover:opacity-100 opacity-60 transition-opacity"
            >
              <span className="text-xs font-bold tracking-[0.2em] text-[#212121] uppercase">Flip Card</span>
              <RefreshCcw size={16} className="text-[#212121] group-hover:rotate-180 transition-transform duration-700 ease-out" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UI;