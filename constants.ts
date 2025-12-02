import { SlideData } from './types';

export const SLIDES: SlideData[] = [
  {
    id: 0,
    title: "Front Design",
    subtitle: "Hero Image",
    description: "The primary visual canvas, designed to arrest attention and communicate your brand's core identity.",
    color: "#ffffff",
    accentColor: "#000000",
    metalness: 0.1,
    roughness: 0.2,
    rotation: [0, -0.1, 0] // Subtle left angle
  },
  {
    id: 1,
    title: "Reverse Side",
    subtitle: "Details",
    description: "A functional space for correspondence, typography, and essential details, balanced for readability.",
    color: "#ffffff",
    accentColor: "#000000",
    metalness: 0.1,
    roughness: 0.25,
    rotation: [0, 0.1, 0] // Subtle right angle
  }
];