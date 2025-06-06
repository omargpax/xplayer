"use client"

import { Play, Music2 } from "lucide-react"

interface SongListItemProps {
  id: string
  title: string
  number: string
  isCurrentSong?: boolean
  onPlay: () => void
}

export function SongListItem({ id, title, number, isCurrentSong, onPlay }: SongListItemProps) {
  return (
    <div
      className={`group flex items-center justify-between rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
        isCurrentSong
          ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-400/30"
          : "bg-white/5 backdrop-blur-sm hover:bg-white/10 border border-white/10"
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
            isCurrentSong
              ? "bg-gradient-to-br from-purple-400 to-pink-500"
              : "bg-gradient-to-br from-gray-600 to-gray-700 group-hover:from-purple-500 group-hover:to-pink-500"
          }`}
        >
          <Music2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className={`text-sm font-medium transition-colors ${isCurrentSong ? "text-purple-300" : "text-white/60"}`}>
            {number}
          </p>
          <p className={`font-semibold transition-colors ${isCurrentSong ? "text-white" : "text-white/90"}`}>{title}</p>
        </div>
      </div>
      <button
        onClick={onPlay}
        className={`p-3 rounded-full transition-all duration-300 hover:scale-110 ${
          isCurrentSong ? "bg-white/20 hover:bg-white/30" : "bg-white/10 hover:bg-white/20 group-hover:bg-purple-500/20"
        }`}
      >
        <Play className="w-5 h-5 text-white fill-current" />
      </button>
    </div>
  )
}
