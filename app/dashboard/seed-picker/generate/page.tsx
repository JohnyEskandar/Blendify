import { cookies } from 'next/headers'
import {
  getUserProfile,
  getRecommendationsFromSeed,
  createPlaylist,
  addTracksToPlaylist
} from '@/lib/spotify'
import { scoreTransition } from '@/utils/segmentMatcher'
import { notFound } from 'next/navigation'

interface Props {
  searchParams: { trackId?: string }
}

export default async function GeneratePage({ searchParams }: Props) {
  const accessToken = (await cookies()).get('access_token')?.value
  if (!accessToken) return notFound()

  const seedTrackId = searchParams.trackId
  if (!seedTrackId) {
    return (
      <main>
        <h1 className="text-xl font-bold">No track ID provided.</h1>
        <p>Please go back and enter a Spotify track ID.</p>
      </main>
    )
  }

  const user = await getUserProfile(accessToken)
  const seedTrack = { id: seedTrackId }
  const recommendations = await getRecommendationsFromSeed(seedTrackId, accessToken)

  // Score each recommendation based on transition
  const scoredTracks = await Promise.all(
    recommendations.tracks.map(async (track: any) => {
      const score = await scoreTransition(seedTrack, track, accessToken)
      return { ...track, score }
    })
  )

  const sorted = scoredTracks
    .sort((a, b) => b.score - a.score)
    .slice(0, 15)

  const uris = [seedTrackId, ...sorted.map((t) => t.uri)]

  const playlist = await createPlaylist(
    user.id,
    `Blendify - Smooth Mix 🎧`,
    accessToken
  )

  await addTracksToPlaylist(playlist.id, uris, accessToken)

  return (
    <main className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">✅ Playlist Created</h1>
      <p className="mb-2">
        We used your seed track (<code>{seedTrackId}</code>) and matched it with the smoothest transitions from recommended tracks.
      </p>
      <p className="mb-6">
        Playlist: <strong>{playlist.name}</strong> with {uris.length} tracks.
      </p>

      <a
        href={playlist.external_urls.spotify}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block"
      >
        <button>Open in Spotify</button>
      </a>
    </main>
  )
}