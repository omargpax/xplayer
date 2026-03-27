"use client";

import { useEffect, useRef, useState } from "react";
import { Lock } from "lucide-react";

interface PetMascotProps {
  isPlaying: boolean;
}

const FPS = 8;
const FRAME_INTERVAL = 1000 / FPS;

const PETS = [
  {
    id: "cat",
    label: "Cat",
    emoji: "🐱",
    dancingMax: 35,
    dancingPath: (n: number) =>
      `/assets/cat/dancing/frame_${n.toString().padStart(3, "0")}.png`,
    idlePath: "/assets/cat/meditar.png",
    available: true,
  },
  {
    id: "bear",
    label: "Bear",
    emoji: "🐻",
    dancingMax: 35,
    dancingPath: (n: number) =>
      `/assets/bear/dancing/frame_${n.toString().padStart(3, "0")}.png`,
    idlePath: "/assets/bear/meditar.png",
    available: false,
  },
  {
    id: "frog",
    label: "Frog",
    emoji: "🐸",
    dancingMax: 35,
    dancingPath: (n: number) =>
      `/assets/frog/dancing/frame_${n.toString().padStart(3, "0")}.png`,
    idlePath: "/assets/frog/meditar.png",
    available: false,
  },
];

export default function PetMascot({ isPlaying }: PetMascotProps) {
  const [petIndex, setPetIndex] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);

  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const frameRef = useRef<number>(0);

  const pet = PETS[petIndex];

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);

    if (!isPlaying) {
      setCurrentFrame(-1);
      lastTimeRef.current = 0;
      return;
    }

    frameRef.current = 0;
    lastTimeRef.current = 0;

    const loop = (timestamp: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
      const elapsed = timestamp - lastTimeRef.current;

      if (elapsed >= FRAME_INTERVAL) {
        lastTimeRef.current = timestamp - (elapsed % FRAME_INTERVAL);
        frameRef.current = (frameRef.current + 1) % (pet.dancingMax + 1);
        setCurrentFrame(frameRef.current);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, pet]);

  const handleSelectPet = (i: number) => {
    if (!PETS[i].available) return;
    cancelAnimationFrame(rafRef.current);
    frameRef.current = 0;
    lastTimeRef.current = 0;
    setCurrentFrame(isPlaying ? 0 : -1);
    setPetIndex(i);
  };

  return (
    <div className="pet-root">
      <style>{`
        .pet-root {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }
        .pet-wrapper {
          width: 280px;
          height: 280px;
          position: relative;
        }
        .pet-frame {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          visibility: hidden;
          pointer-events: none;
        }
        .pet-frame.active {
          visibility: visible;
        }
        .pet-bar {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .pet-bar-label {
          font-size: 10px;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          margin-right: 4px;
          font-family: 'DM Mono', monospace;
        }
        .pet-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 4px 12px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.45);
          font-size: 12px;
          font-family: 'DM Mono', monospace;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s, color 0.15s, border-color 0.15s, transform 0.1s;
          letter-spacing: 0.3px;
        }
        .pet-btn:hover:not(.disabled) {
          background: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.8);
        }
        .pet-btn:active:not(.disabled) {
          transform: scale(0.93);
        }
        .pet-btn.active {
          background: linear-gradient(135deg, rgba(255,107,157,0.25), rgba(196,77,255,0.25));
          border-color: rgba(196,77,255,0.5);
          color: #fff;
        }
        .pet-btn.disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>

      {/* Sprite */}
      <div className="pet-wrapper">
        <img
          src={pet.idlePath}
          alt={`${pet.label} idle`}
          className={`pet-frame ${currentFrame === -1 ? "active" : ""}`}
        />
        {Array.from({ length: pet.dancingMax + 1 }, (_, i) => (
          <img
            key={`${pet.id}-${i}`}
            src={pet.dancingPath(i)}
            alt=""
            aria-hidden="true"
            className={`pet-frame ${currentFrame === i ? "active" : ""}`}
          />
        ))}
      </div>

      {/* Pet selector */}
      <div className="pet-bar">
        <span className="pet-bar-label">Pet</span>
        {PETS.map((p, i) => (
          <button
            key={p.id}
            className={`pet-btn ${petIndex === i ? "active" : ""} ${!p.available ? "disabled" : ""}`}
            onClick={() => handleSelectPet(i)}
            title={!p.available ? "Coming soon" : p.label}
          >
            {p.emoji} {p.label}
            {!p.available && (
              <Lock size={10} strokeWidth={2.5} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
