"use client";

import React, { useRef, useEffect, Suspense } from 'react';
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import * as THREE from "three";

interface STLViewerProps {
  url: string;
  width?: number;
  height?: number;
  className?: string;
}

function Model({ url }: { url: string }) {
  const geometry = useLoader(STLLoader, url);
  const meshRef = useRef<THREE.Mesh>(null);

  // Center and fit model
  useEffect(() => {
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    if (box) {
      const center = new THREE.Vector3();
      box.getCenter(center);
      geometry.center();
      
      // Scale to fit
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxAxis = Math.max(size.x, size.y, size.z);
      const scale = 40 / maxAxis;
      if (meshRef.current) {
        meshRef.current.scale.setScalar(scale);
      }
    }
  }, [geometry]);

  return (
    <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial 
        color="#FFD700" 
        metalness={0.8} 
        roughness={0.2}
        emissive="#FFA500"
        emissiveIntensity={0.1}
      />
    </mesh>
  );
}

function Ground() {
  return (
    <mesh receiveShadow rotation-x={-Math.PI / 2} position={[0, -30, 0]}>
      <planeGeometry args={[400, 400]} />
      <meshStandardMaterial 
        color="#DAA520" 
        metalness={0.1} 
        roughness={0.8}
      />
    </mesh>
  );
}

function Loader() {
  return (
    <mesh>
      <sphereGeometry args={[2, 32, 32]} />
      <meshStandardMaterial color="#aaa" />
    </mesh>
  );
}

const STLViewer: React.FC<STLViewerProps> = ({ 
  url, 
  width = 300, 
  height = 200, 
  className = "" 
}) => {
  return (
    <div 
      className={`border rounded-lg overflow-hidden ${className}`}
      style={{ width, height }}
    >
      <Canvas
        shadows
        camera={{ position: [0, 0, 120], fov: 45 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.6} color="#FFF8DC" />
        <directionalLight
          position={[40, 60, 60]}
          intensity={2.0}
          color="#FFD700"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0005}
          shadow-normalBias={0.01}
          shadow-camera-near={1}
          shadow-camera-far={300}
          shadow-camera-left={-80}
          shadow-camera-right={80}
          shadow-camera-top={80}
          shadow-camera-bottom={-80}
        />
        <directionalLight
          position={[-40, -60, -60]}
          intensity={1.0}
          color="#FFA500"
        />
        <PerspectiveCamera makeDefault position={[0, 0, 120]} />
        <OrbitControls 
          enableDamping 
          dampingFactor={0.1}
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          autoRotate={true}
          autoRotateSpeed={2.0}
        />
        <Suspense fallback={<Loader />}>
          <Model url={url} />
        </Suspense>
        <Ground />
      </Canvas>
    </div>
  );
};

export default STLViewer; 