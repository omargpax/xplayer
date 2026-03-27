"use client";

import { useEffect, useState, useRef } from "react";

interface CatMascotProps {
  isPlaying: boolean;
}

export default function CatMascot({ isPlaying }: CatMascotProps) {
  const DANCING_MAX = 35; 
  const FRAME_RATE = 90; // Velocidad suave
  
  const [frameIndex, setFrameIndex] = useState(0);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  const formatFrame = (n: number) => `frame_${n.toString().padStart(3, '0')}.png`;

  // --- Precarga de imágenes ---
  useEffect(() => {
    // Esto descarga las imágenes en el fondo para que no parpadeen
    for (let i = 0; i <= DANCING_MAX; i++) {
      const img = new Image();
      img.src = `/assets/cat/dancing/${formatFrame(i)}`;
    }
  }, []);

  // --- Lógica de Animación ---
  useEffect(() => {
    if (!isPlaying) {
      setFrameIndex(0);
      return;
    }

    const nextFrame = () => {
      setFrameIndex((prev) => (prev >= DANCING_MAX ? 0 : prev + 1));
    };

    animationRef.current = setTimeout(nextFrame, FRAME_RATE);

    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, [isPlaying, frameIndex]);

  return (
    <div className="cat-wrapper">
      <style>{`
        .cat-wrapper {
          width: 280px;
          height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.4s ease-in-out;
        }
        .cat-sprite {
          width: 100%;
          height: auto;
          display: block;
          /* Previene tirones visuales */
          image-rendering: -webkit-optimize-contrast; 
        }
      `}</style>
      
      <img 
        src={isPlaying ? `/assets/cat/dancing/${formatFrame(frameIndex)}` : "/assets/cat/meditar.png"} 
        alt="Cat Mascot" 
        className="cat-sprite"
      />
    </div>
  );
}
