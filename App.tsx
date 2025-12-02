import React, { useState, useCallback } from 'react';
import Scene from './components/Scene';
import UI from './components/UI';
import { SLIDES } from './constants';

const App: React.FC = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  
  // State for custom user uploads (Blob URLs)
  const [customFront, setCustomFront] = useState<string | null>(null);
  const [customBack, setCustomBack] = useState<string | null>(null);

  const handleNext = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  const handleSelect = useCallback((index: number) => {
    setCurrentSlideIndex(index);
  }, []);

  const handleUploadFront = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setCustomFront(url);
  }, []);

  const handleUploadBack = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setCustomBack(url);
  }, []);

  return (
    <div 
      className="fixed inset-0 w-full h-full bg-white overflow-hidden selection:bg-black selection:text-white"
      onPointerLeave={() => {
        setHovered(false);
        setCurrentSlideIndex(0); // Always reset to Front view when leaving
      }}
    >
      {/* Background 3D Scene */}
      <div className="absolute inset-0 z-0 transition-colors duration-1000 ease-in-out">
        <Scene 
          currentSlideData={SLIDES[currentSlideIndex]} 
          customFront={customFront}
          customBack={customBack}
          hovered={hovered}
          onPostcardHover={() => setHovered(true)}
        />
      </div>

      {/* Foreground UI Overlay */}
      <UI 
        currentSlideIndex={currentSlideIndex}
        slides={SLIDES}
        onNext={handleNext}
        onPrev={handlePrev}
        onSelect={handleSelect}
        onUploadFront={handleUploadFront}
        onUploadBack={handleUploadBack}
        visible={hovered}
      />
    </div>
  );
};

export default App;