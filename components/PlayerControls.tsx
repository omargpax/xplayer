"use client";

import { useEffect, useRef, useState } from "react";

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration?: number;     // seconds
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
  progress: number;     // 0-100
  currentTime: number;  // seconds
  duration: number;     // seconds
  onSeek: (pct: number) => void;
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
}: PlayerControlsProps) {
  const current = tracks[currentIndex];
  const [dragging, setDragging] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = barRef.current!.getBoundingClientRect();
    const pct = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    onSeek(pct * 100);
  };

  if (tracks.length === 0) return null;

  return (
    <div className="player-wrap">
      <style>{`
        .player-wrap {
          width: 100%;
          max-width: 560px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* Now playing card */
        .now-playing {
          display: flex;
          align-items: center;
          gap: 14px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 14px 16px;
          backdrop-filter: blur(12px);
        }
        .track-thumb {
          width: 52px; height: 52px;
          border-radius: 10px;
          object-fit: cover;
          flex-shrink: 0;
          background: rgba(255,255,255,0.1);
        }
        .track-thumb-placeholder {
          width: 52px; height: 52px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(255,107,157,0.3), rgba(196,77,255,0.3));
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; flex-shrink: 0;
        }
        .track-info { flex: 1; min-width: 0; }
        .track-title {
          font-size: 15px; font-weight: 700;
          color: #fff;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .track-artist {
          font-size: 12px; color: rgba(255,255,255,0.5);
          margin-top: 2px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .source-badge {
          font-size: 10px; font-weight: 600;
          padding: 2px 8px; border-radius: 20px;
          margin-top: 5px; display: inline-block;
          letter-spacing: 0.5px;
        }
        .source-youtube { background: rgba(255,70,70,0.2); color: #ff7070; }
        .source-spotify { background: rgba(30,215,96,0.2); color: #1ed760; }

        /* Progress bar */
        .progress-area {
          display: flex; flex-direction: column; gap: 6px;
        }
        .progress-bar {
          height: 4px; border-radius: 4px;
          background: rgba(255,255,255,0.1);
          cursor: pointer; position: relative;
          transition: height 0.15s;
        }
        .progress-bar:hover { height: 6px; }
        .progress-fill {
          height: 100%; border-radius: 4px;
          background: linear-gradient(90deg, #ff6b9d, #c44dff);
          pointer-events: none;
          position: relative;
          transition: width 0.15s linear;
        }
        .progress-thumb {
          position: absolute; right: -5px; top: 50%;
          width: 10px; height: 10px; border-radius: 50%;
          background: #fff; transform: translateY(-50%);
          box-shadow: 0 0 6px rgba(0,0,0,0.4);
        }
        .time-row {
          display: flex; justify-content: space-between;
          font-size: 11px; color: rgba(255,255,255,0.4);
          font-family: 'DM Mono', monospace;
        }

        /* Controls */
        .controls-row {
          display: flex; align-items: center; justify-content: center; gap: 14px;
        }
        .ctrl-btn {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 50%; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.7);
          transition: background 0.15s, transform 0.15s, color 0.15s;
        }
        .ctrl-btn:hover { background: rgba(255,255,255,0.15); color: #fff; }
        .ctrl-btn:active { transform: scale(0.92); }
        .ctrl-sm { width: 40px; height: 40px; font-size: 16px; }
        .ctrl-main {
          width: 56px; height: 56px; font-size: 22px;
          background: linear-gradient(135deg, #ff6b9d, #c44dff) !important;
          border-color: transparent !important;
          color: white !important;
          box-shadow: 0 6px 24px rgba(196,77,255,0.4);
        }
        .ctrl-main:hover { transform: scale(1.06) !important; box-shadow: 0 8px 32px rgba(196,77,255,0.6); }

        /* Queue */
        .queue-header {
          display: flex; align-items: center; justify-content: space-between;
          color: rgba(255,255,255,0.5); font-size: 12px;
          letter-spacing: 0.8px; text-transform: uppercase; font-weight: 600;
        }
        .queue-count {
          background: rgba(255,255,255,0.08);
          padding: 2px 8px; border-radius: 10px; font-size: 11px;
        }
        .queue-list {
          display: flex; flex-direction: column; gap: 4px;
          max-height: 220px; overflow-y: auto;
          scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent;
        }
        .queue-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 10px;
          cursor: pointer; transition: background 0.15s;
          border: 1px solid transparent;
        }
        .queue-item:hover { background: rgba(255,255,255,0.06); }
        .queue-item.active {
          background: rgba(255,107,157,0.1);
          border-color: rgba(255,107,157,0.2);
        }
        .q-num { font-size: 11px; color: rgba(255,255,255,0.3); width: 20px; flex-shrink: 0; font-family: monospace; }
        .q-num.playing { color: #ff6b9d; }
        .q-title { flex: 1; font-size: 13px; color: rgba(255,255,255,0.8); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .q-title.active { color: #fff; font-weight: 600; }
        .q-dur { font-size: 11px; color: rgba(255,255,255,0.3); font-family: monospace; flex-shrink: 0; }

        /* Playing indicator */
        .playing-bars {
          display: flex; align-items: flex-end; gap: 2px; height: 14px;
        }
        .playing-bars span {
          width: 3px; background: #ff6b9d; border-radius: 2px;
          animation: barPulse 0.6s ease-in-out infinite alternate;
        }
        .playing-bars span:nth-child(2) { animation-delay: 0.2s; }
        .playing-bars span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes barPulse {
          from { height: 4px; } to { height: 14px; }
        }
      `}</style>

      {/* Now playing */}
      {current && (
        <div className="now-playing">
          {current.thumbnail
            ? <img className="track-thumb" src={current.thumbnail} alt={current.title}/>
            : <div className="track-thumb-placeholder">🎵</div>
          }
          <div className="track-info">
            <div className="track-title">{current.title}</div>
            <div className="track-artist">{current.artist}</div>
            <span className={`source-badge source-${current.source}`}>
              {current.source === "youtube" ? "▶ YouTube" : "♫ Spotify"}
            </span>
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="progress-area">
        <div className="progress-bar" ref={barRef} onClick={handleBarClick}>
          <div className="progress-fill" style={{ width: `${progress}%` }}>
            <div className="progress-thumb"/>
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
          ⏮
        </button>
        <button className="ctrl-btn ctrl-main" onClick={onPlayPause} title={isPlaying ? "Pause" : "Play"}>
          {isPlaying ? "⏸" : "▶"}
        </button>
        <button className="ctrl-btn ctrl-sm" onClick={onNext} title="Next">
          ⏭
        </button>
      </div>

      {/* Queue */}
	{tracks.length > 0 && ( // Cambiado de > 1 a > 0
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
		      <span/><span/><span/>
		    </div>
		  ) : (
		    <span className={`q-num ${i === currentIndex ? "playing" : ""}`}>
		      {i === currentIndex ? "♪" : `${i + 1}`}
		    </span>
		  )}
		  <span className={`q-title ${i === currentIndex ? "active" : ""}`}>{t.title}</span>
		  <span className="q-dur">{fmt(t.duration ?? 0)}</span>
		</div>
	      ))}
	    </div>
	  </>
	)}
    </div>
  );
}
