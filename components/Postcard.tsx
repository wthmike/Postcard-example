import React, { useRef, useMemo } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { SlideData } from '../types';

interface PostcardProps {
  data: SlideData;
  customFront: string | null;
  customBack: string | null;
  hovered: boolean;
  onHover: () => void;
}

const DEFAULT_FRONT = 'https://cdn.prod.website-files.com/67938aa1b31a177d7bdc1016/692a135de2572136e6ff1b4e_Black%20Friday%20UK.jpg';
const DEFAULT_BACK = 'https://cdn.prod.website-files.com/67938aa1b31a177d7bdc1016/692a135dca21f23e1bdc3afd_Black%20Friday%20UK2.jpg';

const CENTER_Y = -0.2; 

// --- EASING FUNCTIONS ---
const easeOutQuint = (x: number): number => {
  return 1 - Math.pow(1 - x, 5);
};

const Postcard: React.FC<PostcardProps> = ({ data, customFront, customBack, hovered, onHover }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Load textures
  const textureUrls = useMemo(() => [
    customFront || DEFAULT_FRONT,
    customBack || DEFAULT_BACK
  ], [customFront, customBack]);

  const [frontMap, backMap] = useTexture(textureUrls);
  
  // Color correction
  frontMap.colorSpace = THREE.SRGBColorSpace;
  backMap.colorSpace = THREE.SRGBColorSpace;
  
  // Animation State
  const prevIdRef = useRef(data.id);
  const transitionStartTime = useRef(0);
  const currentBaseY = useRef(CENTER_Y); 
  const smoothedMouse = useRef(new THREE.Vector2(0, 0));
  
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;
    
    // Detect slide change
    if (prevIdRef.current !== data.id) {
      transitionStartTime.current = time;
      prevIdRef.current = data.id;
    }

    // --- 1. BASE POSITION ---
    const targetBaseY = CENTER_Y;
    currentBaseY.current = THREE.MathUtils.lerp(currentBaseY.current, targetBaseY, 5.0 * delta);
    
    // --- 2. TRANSITION ANIMATION ---
    const elapsed = time - transitionStartTime.current;
    const duration = 1.8; 
    const progress = Math.min(elapsed / duration, 1);
    
    const posEase = easeOutQuint(progress);
    const rotEase = easeOutQuint(progress);

    // Target Rotation
    const baseRot = data.rotation; 
    const moveType = data.id % 2; 

    const landsOnBack = moveType === 1;
    const targetRotY = baseRot[1] + (landsOnBack ? Math.PI : 0);

    const pos = new THREE.Vector3(0, currentBaseY.current, 0);
    const rot = new THREE.Euler(baseRot[0], targetRotY, baseRot[2]);

    switch (moveType) {
        case 0: // FRONT
            pos.x = THREE.MathUtils.lerp(15, 0, posEase);
            pos.z = THREE.MathUtils.lerp(10, 0, posEase); 
            rot.y = THREE.MathUtils.lerp(targetRotY - Math.PI * 0.8, targetRotY, rotEase);
            rot.x = THREE.MathUtils.lerp(baseRot[0] + 0.5, baseRot[0], rotEase); 
            break;

        case 1: // BACK
            pos.y = THREE.MathUtils.lerp(currentBaseY.current - 10, currentBaseY.current, posEase);
            pos.z = THREE.MathUtils.lerp(8, 0, posEase); 
            rot.x = THREE.MathUtils.lerp(baseRot[0] - Math.PI * 2, baseRot[0], rotEase);
            rot.z = THREE.MathUtils.lerp(baseRot[2] - 0.5, baseRot[2], rotEase);
            break;
    }

    // --- 3. CONTINUOUS ADDITIVE ANIMATION ---
    const slowTime = time * 0.4;
    rot.y += Math.sin(slowTime * 0.5) * 0.3; // Continuous Sway
    rot.x += Math.sin(slowTime * 0.7) * 0.1;
    rot.z += Math.cos(slowTime * 0.6) * 0.05;
    pos.y += Math.sin(time * 0.8) * 0.2; 

    // Mouse Parallax (Continuous)
    const targetMouse = hovered ? state.pointer : new THREE.Vector2(0, 0);
    smoothedMouse.current.lerp(targetMouse, delta * 3.0);
    const mouse = smoothedMouse.current;

    pos.x += mouse.x * 0.5;
    pos.y += mouse.y * 0.5;
    
    rot.x -= mouse.y * 0.2; 
    rot.y += mouse.x * 0.2; 

    // Apply Final Transforms
    meshRef.current.position.copy(pos);
    meshRef.current.rotation.copy(rot);

    // --- 4. MATERIAL REACTIVITY ---
    // Increased envMapIntensity for light blue environment so it doesn't look dead
    const targetEnvMapIntensity = hovered ? 0.3 : 0.4;
    const targetRoughness = hovered ? 0.7 : 0.6; 
    const matLerp = 3.0 * delta;

    const mats = meshRef.current.material as THREE.MeshStandardMaterial[];
    if (mats && mats.length) {
      mats.forEach((mat) => {
        mat.envMapIntensity = THREE.MathUtils.lerp(mat.envMapIntensity, targetEnvMapIntensity, matLerp);
      });
      if(mats[4]) mats[4].roughness = THREE.MathUtils.lerp(mats[4].roughness, targetRoughness, matLerp);
      if(mats[5]) mats[5].roughness = THREE.MathUtils.lerp(mats[5].roughness, targetRoughness, matLerp);
    }
  });

  return (
    <group>
      <mesh 
        ref={meshRef} 
        castShadow 
        receiveShadow
        onPointerEnter={(e) => {
          e.stopPropagation();
          onHover();
        }}
      >
        <boxGeometry args={[6.0, 4.0, 0.06]} />
        
        {/* Edges - Clean White Paper */}
        <meshStandardMaterial attach="material-0" color="#fcfcfc" roughness={0.7} />
        <meshStandardMaterial attach="material-1" color="#fcfcfc" roughness={0.7} />
        <meshStandardMaterial attach="material-2" color="#fcfcfc" roughness={0.7} />
        <meshStandardMaterial attach="material-3" color="#fcfcfc" roughness={0.7} />
        
        {/* Front */}
        <meshStandardMaterial 
          attach="material-4" 
          map={frontMap} 
          roughness={0.7} 
          metalness={0.0} 
          envMapIntensity={0.4} 
        />
        
        {/* Back */}
        <meshStandardMaterial 
          attach="material-5" 
          map={backMap} 
          roughness={0.7} 
          metalness={0.0} 
          envMapIntensity={0.4} 
        />
      </mesh>
    </group>
  );
};

export default Postcard;