"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Music, Heart, Play, ListMusic } from 'lucide-react';
import ControlPet from "@/components/ControlPet";
import UrlInput from "@/components/UrlInput";
import PlayerControls, { Track } from "@/components/PlayerControls";

function detectSource(url: string): "youtube" | "spotify" | "unknown" {
  if (/open\.spotify\.com/i.test(url)) return "spotify";
  if (/youtube\.com|youtu\.be/i.test(url)) return "youtube";
  return "unknown";
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const FAVORITES_KEY = "xplay_favorites";

function loadFavoritesFromStorage(): Track[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveFavoritesToStorage(favs: Track[]) {
  try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs)); } catch { }
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
  const [favorites, setFavorites] = useState<Track[]>([]);

  const playerRef = useRef<any>(null);
  const ytContainerRef = useRef<HTMLDivElement>(null);
  const progressInterval = useRef<any>(null);
  const [ytReady, setYtReady] = useState(false);
  const tracksRef = useRef<Track[]>([]);

  useEffect(() => { tracksRef.current = tracks; }, [tracks]);
  useEffect(() => { setFavorites(loadFavoritesFromStorage()); }, []);

  // ── Favorites ──────────────────────────────────────────────────────────────
  const handleToggleFavorite = (track: Track) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.id === track.id);
      const next = exists ? prev.filter((f) => f.id !== track.id) : [track, ...prev];
      saveFavoritesToStorage(next);
      return next;
    });
  };

  // Play favorites as a playlist
  const handlePlayFavorites = () => {
    if (favorites.length === 0) return;
    setTracks(favorites);
    setCurrentIndex(0);
  };

  // ── YouTube IFrame API ─────────────────────────────────────────────────────
  useEffect(() => {
    if (window.YT && window.YT.Player) { setYtReady(true); return; }
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.body.appendChild(script);
    window.onYouTubeIframeAPIReady = () => setYtReady(true);
  }, []);

  const createPlayer = useCallback((videoId: string) => {
    if (!ytReady || !ytContainerRef.current) return;
    clearInterval(progressInterval.current);
    if (playerRef.current) { try { playerRef.current.destroy(); } catch { } }
    playerRef.current = new window.YT.Player(ytContainerRef.current, {
      height: "0", width: "0", videoId,
      playerVars: { autoplay: 1, controls: 0 },
      events: {
        onReady: (e: any) => { e.target.playVideo(); setIsPlaying(true); startProgressTimer(); },
        onStateChange: (e: any) => {
          if (e.data === window.YT.PlayerState.ENDED) {
            setCurrentIndex((prev) => {
              const t = tracksRef.current;
              return t.length === 0 ? prev : (prev + 1) % t.length;
            });
          }
          if (e.data === window.YT.PlayerState.PLAYING) { setIsPlaying(true); setDuration(e.target.getDuration()); }
          if (e.data === window.YT.PlayerState.PAUSED) { setIsPlaying(false); }
        },
      },
    });
  }, [ytReady]);

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
        setCurrentTime(cur); setDuration(dur);
        setProgress(dur > 0 ? (cur / dur) * 100 : 0);
      } catch { }
    }, 500);
  };

  // ── Load playlist ──────────────────────────────────────────────────────────
  const handleLoadUrl = async (url: string) => {
    setIsLoading(true); setError(""); setTracks([]); setIsPlaying(false);
    const source = detectSource(url);
    if (source === "spotify") {
      setError("Spotify playlists require an API token. Paste a YouTube URL.");
      setIsLoading(false); return;
    }
    if (source === "youtube") {
      try {
        const res = await fetch(`/api/playlist/youtube?url=${encodeURIComponent(url)}`);
        const contentType = res.headers.get("content-type");
        if (!contentType?.includes("application/json")) throw new Error("Server didn't respond with JSON.");
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? "Failed to load playlist"); setIsLoading(false); return; }
        if (!data.tracks?.length) { setError("No playable tracks found"); setIsLoading(false); return; }
        setTracks(data.tracks); setCurrentIndex(0);
      } catch (err: any) { setError(err.message ?? "Network error"); }
    }
    setIsLoading(false);
  };

  // ── Playback controls ──────────────────────────────────────────────────────
  const handlePlayPause = () => {
    if (!playerRef.current) return;
    isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
  };
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => tracks.length === 0 ? prev : (prev + 1) % tracks.length);
  }, [tracks.length]);
  const handlePrev = () => {
    if (currentTime > 3 && playerRef.current) { playerRef.current.seekTo(0); return; }
    setCurrentIndex((prev) => tracks.length === 0 ? prev : (prev - 1 + tracks.length) % tracks.length);
  };
  const handleSelectTrack = (index: number) => setCurrentIndex(index);
  const handleSeek = (pct: number) => {
    if (!playerRef.current || !duration) return;
    const time = (pct / 100) * duration;
    playerRef.current.seekTo(time, true); setCurrentTime(time); setProgress(pct);
  };

  useEffect(() => {
    return () => { clearInterval(progressInterval.current); try { playerRef.current?.destroy(); } catch { } };
  }, []);

  const current = tracks[currentIndex];

  // Are we currently playing favorites playlist?
  const isPlayingFavorites = tracks.length > 0 && tracks.every((t) => favorites.some((f) => f.id === t.id));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Syne', sans-serif; background: #0d0d14; color: #fff; min-height: 100vh; overflow-x: hidden; }

        .bg {
          position: fixed; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 70% 60% at 20% 30%, rgba(196,77,255,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 70%, rgba(255,107,157,0.15) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 50% 10%, rgba(100,180,255,0.1) 0%, transparent 60%),
            #0d0d14;
        }
        .bg::after {
          content: ""; position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.04; pointer-events: none;
        }

        .app { position: relative; z-index: 1; min-height: 100vh; display: flex; flex-direction: column; }

        .header { display: flex; align-items: center; gap: 10px; padding: 20px 32px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .logo { width: 36px; height: 36px; background: linear-gradient(135deg, #ff6b9d, #c44dff); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .logo-text { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
        .logo-sub { font-size: 11px; color: rgba(255,255,255,0.4); font-family: 'DM Mono', monospace; letter-spacing: 1px; text-transform: uppercase; }
        .header-right { margin-left: auto; display: flex; align-items: center; gap: 8px; }
        .status-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: ${isPlaying ? "#1ed760" : "rgba(255,255,255,0.2)"};
          transition: background 0.3s;
          ${isPlaying ? "box-shadow: 0 0 8px #1ed760;" : ""}
        }
        .status-label { font-size: 11px; color: rgba(255,255,255,0.4); font-family: 'DM Mono', monospace; letter-spacing: 0.5px; }

        .main { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 0; align-items: start; padding: 40px 32px; max-width: 1100px; margin: 0 auto; width: 100%; }

        .mascot-col { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; padding: 20px; position: sticky; top: 60px; }
        .mascot-stage { display: flex; flex-direction: column; align-items: center; gap: 16px; }
        .mascot-label { font-size: 12px; color: rgba(255,255,255,0.35); letter-spacing: 1.5px; text-transform: uppercase; font-family: 'DM Mono', monospace; }
        .aura { position: relative; display: flex; align-items: center; justify-content: center; }
        .aura::before {
          content: ""; position: absolute; width: 260px; height: 260px; border-radius: 50%;
          background: ${isPlaying ? "radial-gradient(circle, rgba(196,77,255,0.2) 0%, transparent 70%)" : "radial-gradient(circle, rgba(100,100,150,0.1) 0%, transparent 70%)"};
          transition: background 0.8s ease;
          animation: ${isPlaying ? "auraPulse 1.2s ease-in-out infinite alternate" : "none"};
        }
        @keyframes auraPulse { from { transform: scale(0.9); opacity: 0.7; } to { transform: scale(1.1); opacity: 1; } }
        .current-track-label { text-align: center; max-width: 300px; }
        .current-track-label .ct-title { font-size: 17px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .current-track-label .ct-artist { font-size: 12px; color: rgba(255,255,255,0.45); margin-top: 4px; }

        .controls-col { display: flex; flex-direction: column; gap: 20px; padding: 20px; }
        .cmd-section { display: flex; flex-direction: column; gap: 8px; }
        .cmd-label { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.3); letter-spacing: 1.2px; text-transform: uppercase; font-family: 'DM Mono', monospace; }
        .error-banner { padding: 12px 16px; background: rgba(255,80,80,0.1); border: 1px solid rgba(255,80,80,0.2); border-radius: 12px; font-size: 13px; color: #ff8099; line-height: 1.5; }
        .cmd-examples { display: flex; flex-direction: column; gap: 6px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 14px 18px; }
        .cmd-example { font-size: 12px; font-family: 'DM Mono', monospace; color: rgba(255,255,255,0.5); display: flex; gap: 8px; }
        .cmd-example .cmd { color: #c44dff; }
        .cmd-example .arg { color: #ff6b9d; }

        /* ── Favorites Card ── */
        .fav-card {
          background: rgba(255,107,157,0.06);
          border: 1px solid rgba(255,107,157,0.15);
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: border-color 0.2s, background 0.2s;
        }
        .fav-card:hover { border-color: rgba(255,107,157,0.3); background: rgba(255,107,157,0.09); }
        .fav-card.active {
          border-color: rgba(255,107,157,0.5);
          background: rgba(255,107,157,0.12);
        }

        /* Stacked thumbnails */
        .fav-thumbs {
          position: relative;
          width: 52px; height: 52px;
          flex-shrink: 0;
        }
        .fav-thumb-img {
          position: absolute;
          width: 36px; height: 36px;
          border-radius: 8px;
          object-fit: cover;
          border: 2px solid #0d0d14;
        }
        .fav-thumb-img:nth-child(1) { top: 0; left: 0; z-index: 3; }
        .fav-thumb-img:nth-child(2) { top: 8px; left: 8px; z-index: 2; }
        .fav-thumb-img:nth-child(3) { top: 16px; left: 16px; z-index: 1; }
        .fav-thumb-placeholder {
          width: 52px; height: 52px; border-radius: 12px; flex-shrink: 0;
          background: linear-gradient(135deg, rgba(255,107,157,0.25), rgba(196,77,255,0.25));
          display: flex; align-items: center; justify-content: center;
        }

        .fav-info { flex: 1; min-width: 0; }
        .fav-card-title { font-size: 15px; font-weight: 700; color: #fff; }
        .fav-card-sub {
          font-size: 12px; color: rgba(255,255,255,0.4);
          margin-top: 3px; font-family: 'DM Mono', monospace;
        }
        .fav-card-sub span { color: #ff6b9d; font-weight: 600; }

        .fav-play-btn {
          width: 42px; height: 42px; border-radius: 50%; border: none; cursor: pointer; flex-shrink: 0;
          background: linear-gradient(135deg, #ff6b9d, #c44dff);
          display: flex; align-items: center; justify-content: center;
          color: white; box-shadow: 0 4px 16px rgba(255,107,157,0.35);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .fav-play-btn:hover { transform: scale(1.08); box-shadow: 0 6px 22px rgba(255,107,157,0.5); }
        .fav-play-btn:active { transform: scale(0.95); }
        .fav-play-btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }

        /* Empty favorites */
        .fav-empty-card {
          background: rgba(255,255,255,0.03);
          border: 1px dashed rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 16px 20px;
          display: flex; align-items: center; gap: 12px;
          color: rgba(255,255,255,0.25);
          font-size: 13px;
        }

        @media (max-width: 768px) {
          .main { grid-template-columns: 1fr; padding: 20px 16px; }
          .mascot-col { position: static; }
        }
      `}</style>

      <div ref={ytContainerRef} style={{ position: "fixed", opacity: 0, pointerEvents: "none", top: "-9999px" }} />
      <div className="bg" />

      <div className="app">
        <header className="header">
          <div className="logo"><Music size={24} /></div>
          <div>
            <div className="select-none logo-text">XPlay</div>
            <div className="logo-sub">Music Player</div>
          </div>
          <div className="header-right">
            <div className="status-dot" />
            <span className="select-none status-label">
              {isPlaying ? "Now Playing" : tracks.length > 0 ? "Paused" : "Idle"}
            </span>
          </div>
        </header>

        <main className="main">
          {/* Left — Mascot */}
          <div className="mascot-col">
            <div className="mascot-stage">
              <div className="aura">
                <ControlPet isPlaying={isPlaying} />
              </div>
              <span className="mascot-label">
                {isPlaying
                  ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Music size={16} /> · Vibing ·</span>
                  : tracks.length > 0 ? "· Paused ·" : "· Waiting for music ·"}
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
                  <span className="text-gray-400">¡Hey! you can use these examples:</span>
                </div>
                <div className="cmd-example"><span className="arg">youtube.com/playlist?list=...</span></div>
                <div className="cmd-example"><span className="arg">youtube.com/watch?v=...</span></div>
                <div className="cmd-example"><span className="cmd">Spotify coming soon - bcause no money</span></div>
              </div>
            )}

            {/* ── Favorites Card ── */}
            {favorites.length === 0 ? (
              <div className="fav-empty-card">
                <Heart size={16} />
                No favorites yet — hit ♥ on any track to save it here
              </div>
            ) : (
              <div className={`fav-card ${isPlayingFavorites ? "active" : ""}`}>
                {/* Stacked thumbnails */}
                <div className="fav-thumbs">
                  {favorites.slice(0, 3).map((f, i) =>
                    f.thumbnail
                      ? <img key={f.id} className="fav-thumb-img" src={f.thumbnail} alt={f.title} />
                      : null
                  )}
                  {!favorites.some(f => f.thumbnail) && (
                    <div className="fav-thumb-placeholder"><Heart size={20} color="#ff6b9d" fill="#ff6b9d" /></div>
                  )}
                </div>

                <div className="fav-info">
                  <div className="fav-card-title">Your likes</div>
                  <div className="fav-card-sub">
                    <span>{favorites.length}</span> saved {favorites.length === 1 ? "song" : "songs"}
                  </div>
                </div>

                <button
                  className="fav-play-btn"
                  onClick={handlePlayFavorites}
                  title="Play favorites"
                >
                  {isPlayingFavorites && isPlaying
                    ? <ListMusic size={18} />
                    : <Play size={18} fill="white" />
                  }
                </button>
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
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            )}
          </div>
        </main>
      </div>
    </>
  );
}
