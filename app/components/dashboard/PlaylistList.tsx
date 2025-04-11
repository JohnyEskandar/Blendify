'use client'

import { useState } from 'react'
import Image from 'next/image'

export function PlaylistList({ playlists }: { playlists: any[] }) {
  const [query, setQuery] = useState('')

  const filtered = playlists.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  )

  if (playlists.length === 0) {
    return <p className="text-[var(--secondary)]">You don't have any playlists yet.</p>
  }

  return (
    <section>
      <input
        type="text"
        placeholder="Search playlists..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-4 py-2 rounded-md bg-[var(--spotify-dark-gray)] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] mb-6"
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-[var(--secondary)] mt-4">
          No playlists match your search.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filtered.map((pl) => (
            <a
              key={pl.id}
              href={pl.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-[var(--spotify-dark-gray)] p-3 hover:bg-[var(--spotify-black)] shadow-sm transition-all duration-200"
            >
              {pl.images?.[0]?.url && (
                <Image
                  src={pl.images[0].url}
                  alt={pl.name}
                  width={300}
                  height={300}
                  className="rounded-md w-full aspect-square object-cover"
                />
              )}
              <div className="mt-3">
                <h3 className="text-sm font-semibold truncate">{pl.name}</h3>
                <p className="text-xs text-[var(--secondary)]">
                  {pl.tracks.total} {pl.tracks.total === 1 ? 'track' : 'tracks'}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  )
}
