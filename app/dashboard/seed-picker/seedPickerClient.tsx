// app/dashboard/seed-picker/SeedPickerClient.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TrackSearch from '@/app/components/seed-picker/TrackSearch'

export default function SeedPickerClient({ accessToken }: { accessToken: string }) {
  const router = useRouter()
  const [trackId, setTrackId] = useState('')
  const [error, setError] = useState('')

  const extractTrackId = (input: string) => {
    try {
      if (input.includes('spotify.com/track')) {
        const parts = input.split('/')
        return parts[parts.length - 1].split('?')[0]
      }
      return input.trim()
    } catch {
      return ''
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const id = extractTrackId(trackId)

    if (!id || id.length !== 22) {
      setError('Please enter a valid Spotify track ID or URL.')
      return
    }

    setError('')
    router.push(`/dashboard/seed-picker/generate?trackId=${id}`)
  }

  return (
    <main className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🎧 Create a Playlist</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-[var(--secondary)]">
          Enter a Track ID or Spotify URL:
        </label>
        <input
          type="text"
          placeholder="e.g. https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp"
          className="w-full bg-[var(--spotify-dark-gray)] text-white px-4 py-2 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          value={trackId}
          onChange={(e) => setTrackId(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit">Generate Playlist</button>
      </form>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-2">Or search for a track instead:</h2>
        <TrackSearch accessToken={accessToken} />
      </div>
    </main>
  )
}
