// app/dashboard/seed-picker/SeedPickerClient.tsx
'use client'

import React, { useState } from 'react'

type Track = {
  id: string
  uri: string
  name: string
  artists: { name: string }[]
  album: { images: { url: string }[] }
}

type AudioFeatures = {
  danceability: number
  energy: number
  valence: number
  tempo: number
  key: number
  mode: number
}

export default function SeedPickerClient({
  accessToken,
}: {
  accessToken: string
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Track[]>([])
  const [selected, setSelected] = useState<Track | null>(null)
  const [features, setFeatures] = useState<AudioFeatures | null>(null)
  const [recommendations, setRecommendations] = useState<Track[]>([])
  const [playlistName, setPlaylistName] = useState('')
  const [limit, setLimit] = useState<number>(15)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 1) Search for tracks
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setError(''); setLoading(true)

    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&accessToken=${accessToken}`
      )
      if (!res.ok) throw new Error('Search failed')
      const data = await res.json()
      setResults(data.tracks)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 2) Select one as the seed: fetch features + recs
  const handleSelect = async (track: Track) => {
    setSelected(track)
    setFeatures(null)
    setRecommendations([])
    setError(''); setLoading(true)

    try {
    //  ⚡️ Genre-based recommendations
    const res = await fetch(
      `/api/genre-recommendations?seed=${track.id}&limit=${limit}`,
      { credentials: 'include' }
    );
    if (!res.ok) {
      const body = await res.json().catch(() => ({} as any));
      throw new Error(body.error || 'Failed to load recommendations');
    }
    const data: { tracks: Track[] } = await res.json();
    setRecommendations(data.tracks);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // 3) Create the playlist
  const handleCreatePlaylist = async () => {
    if (!selected) return
    setError('')
    setLoading(true)
  
    // Use the user’s name if provided, otherwise default
    const name = playlistName.trim()
      ? playlistName.trim()
      : `Blendify - ${selected.name} Mix`
  
    try {
      const res = await fetch(`/api/create-playlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,                   // ← custom or default
          seedId: selected.id,
          trackUris: recommendations.map((t) => t.uri),
          includeSeed: true,
        }),
      })
      if (!res.ok) throw new Error('Playlist creation failed')
      const data = await res.json()
      window.open(data.external_url, '_blank')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-3xl mx-auto space-y-6 py-6">
      <h1 className="text-3xl font-bold">🎶 Seed-Song Playlist Generator</h1>
      <div className="flex items-center gap-2 mb-4">
        <label className="text-sm text-[var(--secondary)]"># Tracks:</label>
        <input type="number" min={1} max={100} value={limit} onChange={(e) => setLimit(Number(e.target.value))}
        className="w-20 px-4 py-2 rounded bg-[var(--spotify-dark-gray)] text-white"/>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          className="flex-grow px-4 py-2 rounded bg-[var(--spotify-dark-gray)] text-white"
          placeholder="Search for a seed song..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 rounded bg-[var(--spotify-green)] text-black font-semibold"
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>
      {error && <p className="text-red-400">{error}</p>}

      {/* Results grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {results.map((t) => (
          <div
            key={t.id}
            className="cursor-pointer"
            onClick={() => handleSelect(t)}
          >
            <img
              src={t.album.images[0]?.url}
              alt={t.name}
              className="w-full h-32 object-cover rounded"
            />
            <p className="mt-2 text-sm font-medium truncate">
              {t.name}
            </p>
            <p className="text-xs text-[var(--secondary)] truncate">
              {t.artists.map((a) => a.name).join(', ')}
            </p>
          </div>
        ))}
      </div>

      {/* Audio Features */}
      {selected && features && (
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Seed Audio Features</h2>
          <ul className="grid grid-cols-2 gap-4">
            <li>Danceability: {features.danceability}</li>
            <li>Energy: {features.energy}</li>
            <li>Valence: {features.valence}</li>
            <li>Tempo: {features.tempo}</li>
            <li>Key: {features.key}</li>
            <li>Mode: {features.mode}</li>
          </ul>
        </section>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Recommended Tracks</h2>
          {/* ← New playlist name input */}
          <input
            type="text"
            placeholder="Enter playlist name (or leave blank for default)"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            className="w-full px-4 py-2 rounded bg-[var(--spotify-dark-gray)] text-white"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {recommendations.map((t) => (
              <div key={t.id}>
                <img
                  src={t.album.images[0]?.url}
                  alt={t.name}
                  className="w-full h-32 object-cover rounded"
                />
                <p className="mt-2 text-sm truncate">{t.name}</p>
              </div>
            ))}
          </div>
          <button
            onClick={handleCreatePlaylist}
            disabled={loading}
            className="mt-2 px-6 py-3 bg-[var(--spotify-green)] text-black rounded font-semibold hover:opacity-90"
          >
            {loading ? 'Creating…' : 'Create Playlist'}
          </button>
        </section>
      )}
    </main>
  )
}