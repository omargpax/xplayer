"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Music, Heart, Download } from 'lucide-react';

// ... (interfaces y función fmt se mantienen igual)
export interface Track {
  id: string;
  title: string;
  artist: string;
  duration?: number;
  thumbnail?: string;
  url: string;
  source: "youtube" | "spotify";
}

interface PlayerControlsProps {
  tracks: Track[];
  currentIndex: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSelectTrack: (index: number) => void;
  progress: number;
  currentTime: number;
  duration: number;
  onSeek: (pct: number) => void;
  favorites: Track[];
  onToggleFavorite: (track: Track) => void;
}

function fmt(s: number) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function PlayerControls({
  tracks,
  currentIndex,
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  onSelectTrack,
  progress,
  currentTime,
  duration,
  onSeek,
  favorites,
  onToggleFavorite,
}: PlayerControlsProps) {
  const current = tracks[currentIndex];
  const barRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const isFav = current ? favorites.some((f) => f.id === current.id) : false;

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = barRef.current!.getBoundingClientRect();
    const pct = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    onSeek(pct * 100);
  };

  // --- FUNCIÓN DE DESCARGA CORREGIDA ---
  const handleDownload = async () => {
    if (!current || downloading) return;
    setDownloading(true);
    setDownloadError("");

    try {
      // Llamamos a NUESTRO propio endpoint de Next.js
      const res = await fetch(
        `/api/download?url=${encodeURIComponent(current.url)}&title=${encodeURIComponent(current.title)}`
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error en la descarga");
      }

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${current.title}.mp3`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);

    } catch (err: any) {
      setDownloadError(err.message);
      setTimeout(() => setDownloadError(""), 5000);
    } finally {
      setDownloading(false);
    }
  };

  // He eliminado la función handleDownload antigua que usaba /api/download 
  // para evitar confusiones y errores de timeout.

  if (tracks.length === 0) return null;

  return (
    <div className="player-wrap">
      <style>{`
        /* ... tus estilos se mantienen igual ... */
        .player-wrap { width: 100%; max-width: 560px; display: flex; flex-direction: column; gap: 16px; }
        .now-playing { display: flex; align-items: center; gap: 14px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 14px 16px; backdrop-filter: blur(12px); position: relative; }
        .track-thumb { width: 52px; height: 52px; border-radius: 10px; object-fit: cover; flex-shrink: 0; background: rgba(255,255,255,0.1); }
        .track-thumb-placeholder { width: 52px; height: 52px; border-radius: 10px; background: linear-gradient(135deg, rgba(255,107,157,0.3), rgba(196,77,255,0.3)); display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
        .track-info { flex: 1; min-width: 0; }
        .track-title { font-size: 15px; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .track-artist { font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .source-badge { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 20px; margin-top: 5px; display: inline-block; letter-spacing: 0.5px; }
        .source-youtube { background: rgba(255,70,70,0.2); color: #ff7070; }
        .source-spotify { background: rgba(30,215,96,0.2); color: #1ed760; }
        .track-actions { display: flex; flex-direction: column; align-items: center; gap: 8px; flex-shrink: 0; }
        .action-btn { background: none; border: none; cursor: pointer; padding: 5px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: transform 0.15s, color 0.15s, background 0.15s; color: rgba(255,255,255,0.35); }
        .action-btn:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.8); transform: scale(1.1); }
        .action-btn:active { transform: scale(0.92); }
        .action-btn.fav-active { color: #ff6b9d; animation: heartPop 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .action-btn.downloading { color: #c44dff; cursor: wait; animation: spinPulse 1s ease-in-out infinite; }
        @keyframes heartPop { 0% { transform: scale(1); } 50% { transform: scale(1.4); } 100% { transform: scale(1); } }
        @keyframes spinPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .dl-error { position: absolute; bottom: -28px; right: 12px; font-size: 11px; color: #ff8099; background: rgba(20,10,20,0.9); padding: 3px 8px; border-radius: 6px; white-space: nowrap; animation: fadeIn 0.2s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        .progress-area { display: flex; flex-direction: column; gap: 6px; }
        .progress-bar { height: 4px; border-radius: 4px; background: rgba(255,255,255,0.1); cursor: pointer; position: relative; transition: height 0.15s; }
        .progress-bar:hover { height: 6px; }
        .progress-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, #ff6b9d, #c44dff); pointer-events: none; position: relative; transition: width 0.15s linear; }
        .progress-thumb { position: absolute; right: -5px; top: 50%; width: 10px; height: 10px; border-radius: 50%; background: #fff; transform: translateY(-50%); box-shadow: 0 0 6px rgba(0,0,0,0.4); }
        .time-row { display: flex; justify-content: space-between; font-size: 11px; color: rgba(255,255,255,0.4); font-family: 'DM Mono', monospace; }
        .controls-row { display: flex; align-items: center; justify-content: center; gap: 14px; }
        .ctrl-btn { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.7); transition: background 0.15s, transform 0.15s, color 0.15s; }
        .ctrl-btn:hover { background: rgba(255,255,255,0.15); color: #fff; }
        .ctrl-btn:active { transform: scale(0.92); }
        .ctrl-sm { width: 40px; height: 40px; }
        .ctrl-main { width: 56px; height: 56px; background: linear-gradient(135deg, #ff6b9d, #c44dff) !important; border-color: transparent !important; color: white !important; box-shadow: 0 6px 24px rgba(196,77,255,0.4); }
        .ctrl-main:hover { transform: scale(1.06) !important; box-shadow: 0 8px 32px rgba(196,77,255,0.6); }
        .queue-header { display: flex; align-items: center; justify-content: space-between; color: rgba(255,255,255,0.5); font-size: 12px; letter-spacing: 0.8px; text-transform: uppercase; font-weight: 600; }
        .queue-count { background: rgba(255,255,255,0.08); padding: 2px 8px; border-radius: 10px; font-size: 11px; }
        .queue-list { display: flex; flex-direction: column; gap: 4px; max-height: 220px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent; }
        .queue-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 10px; cursor: pointer; transition: background 0.15s; border: 1px solid transparent; }
        .queue-item:hover { background: rgba(255,255,255,0.06); }
        .queue-item.active { background: rgba(255,107,157,0.1); border-color: rgba(255,107,157,0.2); }
        .q-num { font-size: 11px; color: rgba(255,255,255,0.3); width: 20px; flex-shrink: 0; font-family: monospace; display: flex; align-items: center; }
        .q-num.playing { color: #ff6b9d; }
        .q-title { flex: 1; font-size: 13px; color: rgba(255,255,255,0.8); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .q-title.active { color: #fff; font-weight: 600; }
        .q-dur { font-size: 11px; color: rgba(255,255,255,0.3); font-family: monospace; flex-shrink: 0; }
        .q-fav { color: #ff6b9d; flex-shrink: 0; }
        .playing-bars { display: flex; align-items: flex-end; gap: 2px; height: 14px; }
        .playing-bars span { width: 3px; background: #ff6b9d; border-radius: 2px; animation: barPulse 0.6s ease-in-out infinite alternate; }
        .playing-bars span:nth-child(2) { animation-delay: 0.2s; }
        .playing-bars span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes barPulse { from { height: 4px; } to { height: 14px; } }
      `}</style>

      {/* Now playing */}
      {current && (
        <div className="now-playing">
          {current.thumbnail
            ? <img className="track-thumb" src={current.thumbnail} alt={current.title} />
            : <div className="track-thumb-placeholder"><Music size={22} /></div>
          }
          <div className="track-info">
            <div className="track-title">{current.title}</div>
            <div className="track-artist">{current.artist}</div>
            <span className={`source-badge source-${current.source}`}>
              {current.source === "youtube" ? "▶ YouTube" : "♫ Spotify"}
            </span>
          </div>

          <div className="track-actions">
            <button
              className={`action-btn ${isFav ? "fav-active" : ""}`}
              onClick={() => onToggleFavorite(current)}
              title={isFav ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart size={17} fill={isFav ? "#ff6b9d" : "none"} />
            </button>

            <button
              className={`action-btn ${downloading ? "downloading" : ""}`}
              onClick={handleDownload} // Cambiado a handleDownload
              disabled={downloading}>
              <Download size={17} />
            </button>
          </div>

          {downloadError && <div className="dl-error">⚠ {downloadError}</div>}
        </div>
      )}

      {/* Progress */}
      <div className="progress-area">
        <div className="progress-bar" ref={barRef} onClick={handleBarClick}>
          <div className="progress-fill" style={{ width: `${progress}%` }}>
            <div className="progress-thumb" />
          </div>
        </div>
        <div className="time-row">
          <span>{fmt(currentTime)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-row">
        <button className="ctrl-btn ctrl-sm" onClick={onPrev} title="Previous">
          <SkipBack size={16} />
        </button>
        <button className="ctrl-btn ctrl-main" onClick={onPlayPause} title={isPlaying ? "Pause" : "Play"}>
          {isPlaying ? <Pause size={22} /> : <Play size={22} />}
        </button>
        <button className="ctrl-btn ctrl-sm" onClick={onNext} title="Next">
          <SkipForward size={16} />
        </button>
      </div>

      {/* Queue */}
      {tracks.length > 0 && (
        <>
          <div className="queue-header">
            <span>Queue</span>
            <span className="queue-count">{tracks.length} tracks</span>
          </div>
          <div className="queue-list">
            {tracks.map((t, i) => (
              <div
                key={`${t.id}-${i}`}
                className={`queue-item ${i === currentIndex ? "active" : ""}`}
                onClick={() => onSelectTrack(i)}
              >
                {i === currentIndex && isPlaying ? (
                  <div className="playing-bars">
                    <span /><span /><span />
                  </div>
                ) : (
                  <span className={`q-num ${i === currentIndex ? "playing" : ""}`}>
                    {i === currentIndex ? <Music size={11} /> : `${i + 1}`}
                  </span>
                )}
                <span className={`q-title ${i === currentIndex ? "active" : ""}`}>{t.title}</span>
                {favorites.some((f) => f.id === t.id) && (
                  <Heart size={10} className="q-fav" fill="#ff6b9d" />
                )}
                <span className="q-dur">{fmt(t.duration ?? 0)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
