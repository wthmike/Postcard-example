import * as THREE from 'three';

export interface SlideData {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  color: string; // The base color of the object
  accentColor: string; // For text highlights
  metalness: number;
  roughness: number;
  rotation: [number, number, number]; // Target rotation for the 3D model
}

export interface UIProps {
  currentSlideIndex: number;
  slides: SlideData[];
  onNext: () => void;
  onPrev: () => void;
  onSelect: (index: number) => void;
}
