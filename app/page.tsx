"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Play, Pause, SkipBack, SkipForward, Music, ArrowLeft, Volume2, Heart } from "lucide-react"
import { SearchBox } from "../components/search-box"
import { SongListItem } from "../components/song-list-item"
import { ProgressBar } from "../components/progress-bar"

// Sample song data
const sampleSongs = [
  { id: "1", title: "Ethereal Dreams", number: "#N12", duration: 240 },
  { id: "2", title: "Cosmic Journey", number: "#N13", duration: 195 },
  { id: "3", title: "Neon Nights", number: "#N14", duration: 210 },
  { id: "4", title: "Digital Sunset", number: "#N15", duration: 185 },
  { id: "5", title: "Velvet Skies", number: "#N16", duration: 225 },
]

export default function Page() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showPlayer, setShowPlayer] = useState(false)
  const [currentSong, setCurrentSong] = useState(sampleSongs[0])
  const [filteredSongs, setFilteredSongs] = useState(sampleSongs)
  const [volume, setVolume] = useState(0.7)
  const [isLiked, setIsLiked] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => {
      setCurrentTime(audio.currentTime)
    }

    const updateDuration = () => {
      setDuration(audio.duration)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    const handleLoadedData = () => {
      setDuration(audio.duration)
    }

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateDuration)
    audio.addEventListener("loadeddata", handleLoadedData)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("canplaythrough", updateDuration)

    // Set initial volume
    audio.volume = volume

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateDuration)
      audio.removeEventListener("loadeddata", handleLoadedData)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("canplaythrough", updateDuration)
    }
  }, [volume])

  const togglePlayPause = async () => {
    const audio = audioRef.current
    if (!audio) return

    try {
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
      } else {
        await audio.play()
        setIsPlaying(true)
      }
    } catch (error) {
      console.error("Error playing audio:", error)
    }
  }

  const handleSeek = (time: number) => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = time
    setCurrentTime(time)
  }

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredSongs(sampleSongs)
      return
    }

    const filtered = sampleSongs.filter(
      (song) =>
        song.title.toLowerCase().includes(query.toLowerCase()) ||
        song.number.toLowerCase().includes(query.toLowerCase()),
    )
    setFilteredSongs(filtered)
  }

  const playSong = async (song: (typeof sampleSongs)[0]) => {
    const audio = audioRef.current
    if (!audio) return

    setCurrentSong(song)
    setShowPlayer(true)
    setCurrentTime(0)
    setIsPlaying(false)

    // Reset audio
    audio.currentTime = 0

    try {
      await audio.play()
      setIsPlaying(true)
    } catch (error) {
      console.error("Error playing audio:", error)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  return (
    <div className="flex flex-col text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-400/20 via-transparent to-transparent"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>

      <audio ref={audioRef} src="/audio/song.mp3" preload="metadata" />

      <div className="relative z-10 flex flex-col h-full p-4 md:p-8">
        {/* Header with Logo and Search */}
        <div className="flex items-center justify-between mb-8 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                XPlay
              </span>
              <p className="text-xs text-white/60">Music Player</p>
            </div>
          </div>

          {/* Search Box */}
          <SearchBox onSearch={handleSearch} placeholder="Buscar por título, letra o número" />
        </div>

        {showPlayer ? (
          /* Player View */
          <div className="flex-1 flex flex-col">
            {/* Back Button */}
            <button
              onClick={() => setShowPlayer(false)}
              className="flex items-center gap-2 mb-8 hover:text-purple-300 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Back to library
            </button>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto text-center space-y-8">
              {/* Album Art */}
              <div className="w-64 h-64 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl shadow-2xl flex items-center justify-center mb-8 animate-pulse">
                <Music className="w-24 h-24 text-white/80" />
              </div>

              {/* Title Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    {currentSong.title}
                  </h1>
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                      isLiked ? "text-red-400" : "text-white/60 hover:text-red-400"
                    }`}
                  >
                    <Heart className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`} />
                  </button>
                </div>
                <p className="text-xl text-purple-300 font-medium">{currentSong.number}</p>
              </div>

              {/* Section Indicator */}
              <div className="py-4">
                <span className="px-6 py-2 bg-white/10 backdrop-blur-md rounded-full text-lg font-light border border-white/20">
                  coro
                </span>
              </div>

              {/* Content Text */}
              <div className="space-y-6 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto text-white/80">
                <p>
                  It is a long established fact that a reader will be distracted by the readable content of a page when
                  looking at its layout.
                </p>
                <p>
                  The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as
                  opposed to using 'Content here, content here', making it look like readable English.
                </p>
              </div>

              {/* Audio Controls */}
              <div className="pt-8 space-y-8 w-full max-w-2xl">
                {/* Progress Bar */}
                <ProgressBar currentTime={currentTime} duration={duration} onSeek={handleSeek} />

                {/* Control Buttons */}
                <div className="flex items-center justify-center gap-6">
                  <button
                    className="w-14 h-14 flex items-center justify-center hover:bg-white/10 rounded-full transition-all duration-300 hover:scale-110"
                    disabled
                  >
                    <SkipBack className="w-6 h-6 fill-current text-white/60" />
                  </button>

                  <button
                    onClick={togglePlayPause}
                    className="w-20 h-20 flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 rounded-full transition-all duration-300 hover:scale-110 shadow-2xl"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 fill-current" />
                    ) : (
                      <Play className="w-8 h-8 fill-current ml-1" />
                    )}
                  </button>

                  <button
                    className="w-14 h-14 flex items-center justify-center hover:bg-white/10 rounded-full transition-all duration-300 hover:scale-110"
                    disabled
                  >
                    <SkipForward className="w-6 h-6 fill-current text-white/60" />
                  </button>
                </div>

                {/* Volume Control */}
                <div className="flex items-center justify-center gap-4 pt-4">
                  <Volume2 className="w-5 h-5 text-white/60" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-32 h-2 bg-white/20 rounded-full appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Song List View */
          <div className="flex-1 flex flex-col items-center">
            <div className="w-full max-w-3xl">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    Your Library
                  </h2>
                  <span className="text-sm text-white/60">{filteredSongs.length} songs</span>
                </div>
                <div className="space-y-3">
                  {filteredSongs.map((song) => (
                    <SongListItem
                      key={song.id}
                      id={song.id}
                      title={song.title}
                      number={song.number}
                      isCurrentSong={currentSong.id === song.id}
                      onPlay={() => playSong(song)}
                    />
                  ))}
                  {filteredSongs.length === 0 && (
                    <div className="text-center py-12">
                      <Music className="w-12 h-12 text-white/30 mx-auto mb-4" />
                      <p className="text-white/60">No songs found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(45deg, #a855f7, #ec4899);
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(45deg, #a855f7, #ec4899);
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  )
}
