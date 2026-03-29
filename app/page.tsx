"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Music } from 'lucide-react';
import CatMascot from "@/components/CatMascot";
import UrlInput from "@/components/UrlInput";
import PlayerControls, { Track } from "@/components/PlayerControls";

// ─── Detect URL type ─────────────────────────────────────────────────────────
function detectSource(url: string): "youtube" | "spotify" | "unknown" {
  if (/open\.spotify\.com/i.test(url)) return "spotify";
  if (/youtube\.com|youtu\.be/i.test(url)) return "youtube";
  return "unknown";
}

// ─── YouTube iframe embed player hook ────────────────────────────────────────
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function XPlayPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loadedUrl, setLoadedUrl] = useState("");

  const playerRef = useRef<any>(null);
  const ytContainerRef = useRef<HTMLDivElement>(null);
  const progressInterval = useRef<any>(null);
  const [ytReady, setYtReady] = useState(false);

  // Solución al Stale Closure: Guardar una referencia fresca de los tracks
  const tracksRef = useRef<Track[]>([]);
  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  // ── Load YouTube IFrame API ────────────────────────────────────────────────
  useEffect(() => {
    if (window.YT && window.YT.Player) { setYtReady(true); return; }
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.body.appendChild(script);
    window.onYouTubeIframeAPIReady = () => setYtReady(true);
  }, []);

  // ── Create/destroy YT player ───────────────────────────────────────────────
  const createPlayer = useCallback((videoId: string) => {
    if (!ytReady || !ytContainerRef.current) return;
    
    // Limpiar intervalo de tiempo anterior para no causar fugas
    clearInterval(progressInterval.current);

    if (playerRef.current) {
      try { playerRef.current.destroy(); } catch { }
    }
    
    playerRef.current = new window.YT.Player(ytContainerRef.current, {
      height: "0",
      width: "0",
      videoId,
      playerVars: { autoplay: 1, controls: 0 },
      events: {
        onReady: (e: any) => {
          e.target.playVideo();
          setIsPlaying(true);
          startProgressTimer();
        },
        onStateChange: (e: any) => {
          // 0 = ended, 1 = playing, 2 = paused
          if (e.data === window.YT.PlayerState.ENDED) {
            // Usamos la referencia actualizada para que sepa exactamente a qué índice ir
            setCurrentIndex((prev) => {
              const currentTracks = tracksRef.current;
              if (currentTracks.length === 0) return prev;
              return (prev + 1) % currentTracks.length;
            });
          }
          if (e.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            setDuration(e.target.getDuration());
          }
          if (e.data === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false);
          }
        },
      },
    });
  }, [ytReady]);
  
  // ── Efecto maestro que arranca la canción si el índice cambia ──────────────
  useEffect(() => {
    if (ytReady && tracks.length > 0 && tracks[currentIndex]) {
      createPlayer(tracks[currentIndex].id);
    }
  }, [currentIndex, ytReady, tracks, createPlayer]);
  
  const startProgressTimer = () => {
    clearInterval(progressInterval.current);
    progressInterval.current = setInterval(() => {
      if (!playerRef.current?.getCurrentTime) return;
      try {
        const cur = playerRef.current.getCurrentTime();
        const dur = playerRef.current.getDuration();
        setCurrentTime(cur);
        setDuration(dur);
        setProgress(dur > 0 ? (cur / dur) * 100 : 0);
      } catch { }
    }, 500);
  };

  // ── Load playlist ──────────────────────────────────────────────────────────
  const handleLoadUrl = async (url: string) => {
    setIsLoading(true);
    setError("");
    setTracks([]);
    setIsPlaying(false);

    const source = detectSource(url);

    if (source === "spotify") {
      setError(
        "Spotify playlists require an API token. Paste a YouTube playlist URL, or add your Spotify Client ID to .env.local"
      );
      setIsLoading(false);
      return;
    }

    if (source === "youtube") {
      try {
        const res = await fetch(`/api/playlist/youtube?url=${encodeURIComponent(url)}`);

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          console.error("Respuesta no es JSON:", text);
          throw new Error("El servidor no respondió con JSON. Revisa la consola.");
        }

        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Failed to load playlist");
          setIsLoading(false);
          return;
        }
        if (!data.tracks?.length) {
          setError("No playable tracks found in this playlist");
          setIsLoading(false);
          return;
        }
        
        // Al actualizar esto, el `useEffect` maestro creará el reproductor automáticamente
        setTracks(data.tracks);
        setCurrentIndex(0);
        setLoadedUrl(url);
        
      } catch (err: any) {
        setError(err.message ?? "Network error");
      }
    }

    setIsLoading(false);
  };

  // ── Playback controls ──────────────────────────────────────────────────────
  const handlePlayPause = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => {
      if (tracks.length === 0) return prev;
      return (prev + 1) % tracks.length;
    });
  }, [tracks.length]);

  const handlePrev = () => {
    if (currentTime > 3 && playerRef.current) {
      playerRef.current.seekTo(0);
      return;
    }
    setCurrentIndex((prev) => {
      if (tracks.length === 0) return prev;
      return (prev - 1 + tracks.length) % tracks.length;
    });
  };

  const handleSelectTrack = (index: number) => {
    setCurrentIndex(index);
    // Ya no necesitas llamar a createPlayer aquí, el useEffect se encarga.
  };

  const handleSeek = (pct: number) => {
    if (!playerRef.current || !duration) return;
    const time = (pct / 100) * duration;
    playerRef.current.seekTo(time, true);
    setCurrentTime(time);
    setProgress(pct);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(progressInterval.current);
      try { playerRef.current?.destroy(); } catch { }
    };
  }, []);

  const current = tracks[currentIndex];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Syne', sans-serif;
          background: #0d0d14;
          color: #fff;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .bg {
          position: fixed; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 70% 60% at 20% 30%, rgba(196,77,255,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 70%, rgba(255,107,157,0.15) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 50% 10%, rgba(100,180,255,0.1) 0%, transparent 60%),
            #0d0d14;
        }
    
          a {font-weight:semibold;color:violet;}
          a:hover{color:cyan;}
    
        /* Noise overlay */
        .bg::after {
          content: "";
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.04;
          pointer-events: none;
        }

        .app {
          position: relative; z-index: 1;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* Header */
        .header {
          display: flex; align-items: center; gap: 10px;
          padding: 20px 32px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .logo {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #ff6b9d, #c44dff);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
        }
        .logo-text {
          font-size: 20px; font-weight: 800; letter-spacing: -0.5px;
        }
        .logo-sub {
          font-size: 11px; color: rgba(255,255,255,0.4);
          font-family: 'DM Mono', monospace;
          letter-spacing: 1px; text-transform: uppercase;
        }
        .header-right {
          margin-left: auto;
          display: flex; align-items: center; gap: 8px;
        }
        .status-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: ${isPlaying ? "#1ed760" : "rgba(255,255,255,0.2)"};
          transition: background 0.3s;
          ${isPlaying ? "box-shadow: 0 0 8px #1ed760;" : ""}
        }
        .status-label {
          font-size: 11px; color: rgba(255,255,255,0.4);
          font-family: 'DM Mono', monospace; letter-spacing: 0.5px;
        }

        /* Main layout */
        .main {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          align-items: start;
          padding: 40px 32px;
          max-width: 1100px;
          margin: 0 auto;
          width: 100%;
        }

        /* Left — mascot */
        .mascot-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 24px;
          padding: 20px;
          position: sticky;
          top: 60px;
        }
        .mascot-stage {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .mascot-label {
          font-size: 12px;
          color: rgba(255,255,255,0.35);
          letter-spacing: 1.5px;
          text-transform: uppercase;
          font-family: 'DM Mono', monospace;
        }
        .aura {
          position: relative;
          display: flex; align-items: center; justify-content: center;
        }
        .aura::before {
          content: "";
          position: absolute;
          width: 260px; height: 260px;
          border-radius: 50%;
          background: ${isPlaying
          ? "radial-gradient(circle, rgba(196,77,255,0.2) 0%, transparent 70%)"
          : "radial-gradient(circle, rgba(100,100,150,0.1) 0%, transparent 70%)"};
          transition: background 0.8s ease;
          animation: ${isPlaying ? "auraPulse 1.2s ease-in-out infinite alternate" : "none"};
        }
        @keyframes auraPulse {
          from { transform: scale(0.9); opacity: 0.7; }
          to   { transform: scale(1.1); opacity: 1; }
        }

        .current-track-label {
          text-align: center;
          max-width: 300px;
        }
        .current-track-label .ct-title {
          font-size: 17px; font-weight: 700;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .current-track-label .ct-artist {
          font-size: 12px; color: rgba(255,255,255,0.45); margin-top: 4px;
        }

        /* Right — controls */
        .controls-col {
          display: flex;
          flex-direction: column;
          gap: 28px;
          padding: 20px;
        }

        /* Command input area */
        .cmd-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .cmd-label {
          font-size: 11px; font-weight: 600;
          color: rgba(255,255,255,0.3);
          letter-spacing: 1.2px; text-transform: uppercase;
          font-family: 'DM Mono', monospace;
        }

        /* Error */
        .error-banner {
          padding: 12px 16px;
          background: rgba(255,80,80,0.1);
          border: 1px solid rgba(255,80,80,0.2);
          border-radius: 12px;
          font-size: 13px;
          color: #ff8099;
          line-height: 1.5;
        }

        /* Empty state */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 24px;
          padding: 60px 20px;
          text-align: center;
        }
        .empty-state h2 {
          font-size: 28px; font-weight: 800;
          background: linear-gradient(135deg, #ff6b9d, #c44dff, #88ccff);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          line-height: 1.2;
        }
        .empty-state p {
          font-size: 14px; color: rgba(255,255,255,0.4);
          max-width: 380px; line-height: 1.6;
        }
        .cmd-examples {
          display: flex; flex-direction: column; gap: 6px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 14px 18px;
          text-align: left;
          width: 100%; max-width: 400px;
        }
        .cmd-example {
          font-size: 12px;
          font-family: 'DM Mono', monospace;
          color: rgba(255,255,255,0.5);
          display: flex; gap: 8px;
        }
        .cmd-example .cmd { color: #c44dff; }
        .cmd-example .arg { color: #ff6b9d; }

        /* Mobile */
        @media (max-width: 768px) {
          .main {
            grid-template-columns: 1fr;
            padding: 20px 16px;
          }
          .mascot-col { position: static; }
        }
      `}</style>

      {/* Hidden YT player */}
      <div ref={ytContainerRef} style={{ position: "fixed", opacity: 0, pointerEvents: "none", top: "-9999px" }} />

      <div className="bg" />
      <div className="app">
        {/* Header */}
        <header className="header">
          <div className="logo"><Music size={24} /></div>
          <div>
            <div className="logo-text">XPlay</div>
            <div className="logo-sub">Music Player</div>
          </div>
          <div className="header-right">
            <div className="status-dot" />
            <span className="status-label">
              {isPlaying ? "Now Playing" : tracks.length > 0 ? "Paused" : "Idle"}
            </span>
          </div>
        </header>

        {/* Main */}
        <main className="main">
          {/* Left — Mascot */}
          <div className="mascot-col">
            <div className="mascot-stage">
              <div className="aura">
                <CatMascot isPlaying={isPlaying} />
              </div>
              <span className="mascot-label">
                {isPlaying ? <span style={{display: 'inline-flex', alignItems: 'center', gap: '4px'}}><Music size={16} /> Vibing...</span> : tracks.length > 0 ? "Paused..." : "Waiting for music..."}
              </span>
              {current && (
                <div className="current-track-label">
                  <div className="ct-title">{current.title}</div>
                  <div className="ct-artist">{current.artist}</div>
                </div>
              )}
            </div>
          </div>

          {/* Right — Controls */}
          <div className="controls-col">
            <div className="cmd-section">
              <div className="cmd-label">▸ Load Playlist</div>
              <UrlInput onLoad={handleLoadUrl} isLoading={isLoading} />
            </div>

            {error && <div className="error-banner">⚠ {error}</div>}

            {tracks.length === 0 && !error && (
              <div className="cmd-examples">
                <div className="cmd-example">
                  <span className="arg">youtube.com/playlist?list=...</span>
                </div>
                <div className="cmd-example">
                  <span className="arg">youtube.com/watch?v=...</span>
                </div>
                <div className="cmd-example">
                  <span className="arg">Spotify coming soon - bcause no money</span>
                </div>
                <div className="cmd-example">
                  <span className="cmd">credits: <a href="https://www.freepik.com/author/catalyststuff" className="text-bold hover:text-cyan">@catalyststuff</a> - vector pet</span>
                </div>
              </div>
            )}

            {tracks.length > 0 && (
              <PlayerControls
                tracks={tracks}
                currentIndex={currentIndex}
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
                onNext={handleNext}
                onPrev={handlePrev}
                onSelectTrack={handleSelectTrack}
                progress={progress}
                currentTime={currentTime}
                duration={duration}
                onSeek={handleSeek}
              />
            )}
          </div>
        </main>
      </div>
    </>
  );
}
