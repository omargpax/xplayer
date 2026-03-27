"use client";

import { useState } from "react";

interface UrlInputProps {
  onLoad: (url: string) => void;
  isLoading: boolean;
}

export default function UrlInput({ onLoad, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const validateUrl = (value: string): boolean => {
    const spotifyPlaylist = /open\.spotify\.com\/(playlist|album|artist)/i;
    const youtubePlaylist = /youtube\.com\/(playlist|watch)|youtu\.be\//i;
    return spotifyPlaylist.test(value) || youtubePlaylist.test(value);
  };

  const handleSubmit = () => {
    setError("");
    if (!url.trim()) {
      setError("Paste a Spotify or YouTube URL 🎵");
      return;
    }
    if (!validateUrl(url)) {
      setError("Only Spotify playlists/albums or YouTube playlists work here");
      return;
    }
    onLoad(url.trim());
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  const examples = [
    { label: "Youtube Playlist", icon: "▶", url: "https://youtube.com/playlist?list=..." },
    { label: "Youtube song", icon: "♫", url: "youtube.com/watch?v=..." },
  ];

  return (
    <div className="url-input-container">
      <style>{`
        .url-input-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
          max-width: 560px;
        }
        .url-row {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .url-field {
          flex: 1;
          background: rgba(255,255,255,0.07);
          border: 1.5px solid rgba(255,255,255,0.15);
          border-radius: 12px;
          padding: 12px 16px;
          color: #fff;
          font-size: 14px;
          font-family: 'DM Mono', 'Fira Code', monospace;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          backdrop-filter: blur(8px);
        }
        .url-field::placeholder { color: rgba(255,255,255,0.3); }
        .url-field:focus {
          border-color: rgba(255,255,255,0.45);
          background: rgba(255,255,255,0.1);
        }
        .load-btn {
          padding: 12px 22px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #ff6b9d, #c44dff);
          color: white;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: transform 0.15s, opacity 0.15s, box-shadow 0.2s;
          white-space: nowrap;
          box-shadow: 0 4px 20px rgba(196,77,255,0.35);
        }
        .load-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(196,77,255,0.5);
        }
        .load-btn:active:not(:disabled) { transform: translateY(0); }
        .load-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .error-msg {
          font-size: 12px;
          color: #ff8099;
          padding: 0 4px;
          animation: fadeIn 0.2s ease;
        }
        .url-hints {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .hint-chip {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          border-radius: 20px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          font-size: 11px;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0.3px;
        }
        .hint-icon { font-size: 13px; opacity: 0.7; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

        /* Spinner */
        .spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          display: inline-block;
          animation: spin 0.7s linear infinite;
          margin-right: 6px;
          vertical-align: middle;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="url-row">
        <input
          className="url-field"
          type="url"
          placeholder="youtube.com/playlist?list=..."
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(""); }}
          onKeyDown={handleKey}
          disabled={isLoading}
        />
        <button className="load-btn" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? <><span className="spinner"/>Loading</> : "▶ Load"}
        </button>
      </div>

      {error && <div className="error-msg">⚠ {error}</div>}

      <div className="url-hints">
        {examples.map((ex) => (
          <div key={ex.label} className="hint-chip">
            <span className="hint-icon">{ex.icon}</span>
            {ex.label}
          </div>
        ))}
        <div className="hint-chip">No login required</div>
      </div>
    </div>
  );
}
