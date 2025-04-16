  'use client'

  import { useState } from 'react'

  type Track = {
    id: string
    name: string
    artists: { name: string }[]
    album: { images: { url: string }[] }
    external_urls: { spotify: string }
  }

  export default function TrackSearch({ accessToken }: { accessToken: string }) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<Track[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSearch = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!query.trim()) return

      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&accessToken=${accessToken}`)

        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData?.error?.message || 'Spotify API error')
        }

        const data = await res.json()
        setResults(data.tracks)
      } catch (err: any) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    return (
      <div className="max-w-4xl mx-auto p-4">
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Search for a song..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-grow border border-gray-300 rounded px-4 py-2"
          />
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {results.map((track) => (
            <a
              key={track.id}
              href={track.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white rounded shadow hover:shadow-lg transition"
            >
              <img
                src={track.album.images[0]?.url}
                alt={track.name}
                className="w-full h-48 object-cover rounded-t"
              />
              <div className="p-2">
                <h3 className="text-sm font-semibold truncate">{track.name}</h3>
                <p className="text-xs text-gray-600">
                  {track.artists.map((a) => a.name).join(', ')}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    )
  }
