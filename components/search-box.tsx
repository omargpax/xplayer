"use client"

import type React from "react"

import { Search, X } from "lucide-react"
import { useState } from "react"

interface SearchBoxProps {
  onSearch: (query: string) => void
  placeholder?: string
}

export function SearchBox({ onSearch, placeholder = "Search by title, lyrics or number" }: SearchBoxProps) {
  const [query, setQuery] = useState("")
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  const clearSearch = () => {
    setQuery("")
    onSearch("")
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <div className={`relative transition-all duration-300 ${isFocused ? "scale-102" : ""}`}>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            onSearch(e.target.value)
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full py-3 px-5 pr-16 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/15 transition-all duration-300"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          )}
          <button type="submit" className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
            <Search className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </form>
  )
}
