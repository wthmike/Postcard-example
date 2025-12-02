import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame, ThreeElements } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import Postcard from './Postcard';
import { SlideData } from '../types';

// Augment global JSX namespace to include Three.js elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      planeGeometry: any;
      shaderMaterial: any;
      ambientLight: any;
      spotLight: any;
      pointLight: any;
    }
  }
}

// Augment React JSX namespace to include Three.js elements (fixes 'Property does not exist' errors)
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      planeGeometry: any;
      shaderMaterial: any;
      ambientLight: any;
      spotLight: any;
      pointLight: any;
    }
  }
}

interface SceneProps {
  currentSlideData: SlideData;
  customFront: string | null;
  customBack: string | null;
  hovered: boolean;
}

// --- CUSTOM SHADER BACKGROUND ---
const GradientBackground: React.FC<{ hovered: boolean }> = ({ hovered }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const uniforms = useMemo(() => ({
    uColorA: { value: new THREE.Color('#ffffff') }, // Center color
    uColorB: { value: new THREE.Color('#f5f5f7') }, // Edge color
  }), []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    const lerpSpeed = 2.0 * delta;

    // TARGET COLORS
    // Clean Mode: Pure White Center -> Very subtle Off-White Edge
    const cleanCenter = new THREE.Color('#ffffff');
    const cleanEdge = new THREE.Color('#f2f2f2');
    
    // Hover Mode: Soft Blue Center -> Requested #C8E5F9 Edge
    const hoverCenter = new THREE.Color('#e6f4ff'); // Lighter center for depth
    const hoverEdge = new THREE.Color('#C8E5F9');   // The requested blue

    const targetCenter = hovered ? hoverCenter : cleanCenter;
    const targetEdge = hovered ? hoverEdge : cleanEdge;

    // Interpolate Uniforms
    uniforms.uColorA.value.lerp(targetCenter, lerpSpeed);
    uniforms.uColorB.value.lerp(targetEdge, lerpSpeed);
    
    // Cleanup scene background to ensure our mesh is visible
    state.scene.background = null;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -50]} scale={[150, 100, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 uColorA;
          uniform vec3 uColorB;
          varying vec2 vUv;
          void main() {
            float dist = distance(vUv, vec2(0.5));
            vec3 color = mix(uColorA, uColorB, smoothstep(0.0, 0.8, dist));
            gl_FragColor = vec4(color, 1.0);
          }
        `}
        depthWrite={false}
      />
    </mesh>
  );
};

// Sub-component to handle lighting transitions
const CinematicLights: React.FC<{ hovered: boolean }> = ({ hovered }) => {
  const keyRef = useRef<THREE.SpotLight>(null);
  const rimLeftRef = useRef<THREE.SpotLight>(null);
  const rimRightRef = useRef<THREE.SpotLight>(null);
  const fillRef = useRef<THREE.PointLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const lerpSpeed = 2.0 * delta;

    // --- TARGET CONFIGURATION ---
    
    // 1. CLEAN MODE (White BG)
    const cleanState = {
      key: 45,       
      rimLeft: 8,    
      rimRight: 0, 
      fill: 30,      
      ambient: 0.5,
      rimLeftColor: '#ffffff',
      rimRightColor: '#ffffff'
    };

    // 2. HOVER MODE (Blue BG #C8E5F9) - Daylight Studio
    const hoverState = {
      key: 65,        // Slightly punchier
      rimLeft: 40,    // Soft highlights
      rimRight: 40,   
      fill: 50,       // High fill for airy feel
      ambient: 0.7,   // Bright ambient for pastel look
      rimLeftColor: '#ffffff',
      rimRightColor: '#fff0e0' // Warm accent
    };

    const target = hovered ? hoverState : cleanState;

    // Intensity Transitions
    if (keyRef.current) keyRef.current.intensity = THREE.MathUtils.lerp(keyRef.current.intensity, target.key, lerpSpeed);
    if (rimLeftRef.current) {
        rimLeftRef.current.intensity = THREE.MathUtils.lerp(rimLeftRef.current.intensity, target.rimLeft, lerpSpeed);
        rimLeftRef.current.color.lerp(new THREE.Color(target.rimLeftColor), lerpSpeed);
    }
    if (rimRightRef.current) {
        rimRightRef.current.intensity = THREE.MathUtils.lerp(rimRightRef.current.intensity, target.rimRight, lerpSpeed);
        rimRightRef.current.color.lerp(new THREE.Color(target.rimRightColor), lerpSpeed);
    }
    if (fillRef.current) fillRef.current.intensity = THREE.MathUtils.lerp(fillRef.current.intensity, target.fill, lerpSpeed);
    if (ambientRef.current) ambientRef.current.intensity = THREE.MathUtils.lerp(ambientRef.current.intensity, target.ambient, lerpSpeed);

    // --- DYNAMIC MOVEMENT ---
    if (hovered) {
        if (rimLeftRef.current) {
            rimLeftRef.current.position.x = -12 + Math.sin(time * 0.1) * 1.5; 
            rimLeftRef.current.position.z = -3 + Math.cos(time * 0.15) * 0.5;
        }
        if (rimRightRef.current) {
            rimRightRef.current.position.x = 10 + Math.cos(time * 0.12) * 1.5;
            rimRightRef.current.position.y = 2 + Math.sin(time * 0.1) * 0.5;
        }
    } else {
        if (rimLeftRef.current) {
             rimLeftRef.current.position.lerp(new THREE.Vector3(-12, 5, -2), lerpSpeed);
        }
        if (rimRightRef.current) {
             rimRightRef.current.position.lerp(new THREE.Vector3(10, -5, -2), lerpSpeed);
        }
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} />
      
      <spotLight
        ref={keyRef}
        position={[6, 8, 12]} 
        angle={0.3} 
        penumbra={0.5}
        color="#ffffff" 
        castShadow
        shadow-bias={-0.0001}
        shadow-mapSize={[2048, 2048]}
      />
      
      <spotLight 
        ref={rimLeftRef}
        position={[-12, 5, -2]} 
        angle={0.6} 
        penumbra={0.4} 
        castShadow
      />

      <spotLight 
        ref={rimRightRef}
        position={[10, -5, -2]} 
        angle={0.5} 
        penumbra={0.6} 
        castShadow
      />

      <pointLight 
        ref={fillRef}
        position={[0, 2, 8]} 
        color="#ffffff" 
      />
    </>
  );
};

const Scene: React.FC<SceneProps> = ({ currentSlideData, customFront, customBack, hovered }) => {
  return (
    <Canvas
      shadows
      dpr={[1, 2]} 
      camera={{ position: [0, 0, 14], fov: 32 }} 
      gl={{ 
        antialias: true, 
        toneMapping: 3, // Cineon
        toneMappingExposure: 0.75 
      }}
    >
      <GradientBackground hovered={hovered} />
      
      <CinematicLights hovered={hovered} />

      <Suspense fallback={null}>
        <Environment preset="studio" blur={0.8} intensity={0.2} />

        <Postcard 
          data={currentSlideData} 
          customFront={customFront}
          customBack={customBack}
          hovered={hovered}
        />
      </Suspense>

      <ContactShadows
        position={[0, -3.5, 0]} 
        resolution={1024}
        scale={40}
        blur={1.4}
        opacity={hovered ? 0.6 : 0.9} // Shadows visible in both states, lighter on hover
        far={20}
        color="#001a33" // Slight blue tint to shadow
      />
    </Canvas>
  );
};

export default Scene;