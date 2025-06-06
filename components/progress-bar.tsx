"use client"

import type React from "react"

interface ProgressBarProps {
  currentTime: number
  duration: number
  onSeek: (time: number) => void
}

export function ProgressBar({ currentTime, duration, onSeek }: ProgressBarProps) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const width = rect.width
    const newTime = (clickX / width) * duration
    onSeek(newTime)
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="w-full space-y-2">
      <div className="relative w-full h-2 bg-white/20 rounded-full cursor-pointer group" onClick={handleClick}>
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full transition-all duration-150 group-hover:h-3 group-hover:-translate-y-0.5"
          style={{ width: `${progressPercentage}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-150"
          style={{ left: `calc(${progressPercentage}% - 8px)` }}
        />
      </div>
      <div className="flex justify-between text-sm text-white/60">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  )
}
