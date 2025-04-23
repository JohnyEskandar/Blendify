// app/api/create-playlist/route.ts

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import {
  getUserProfile,
  createPlaylist,
  addTracksToPlaylist,
} from '@/lib/spotify'

export async function POST(req: NextRequest) {
  const url = new URL(req.url)
  const token = (await cookies()).get('access_token')?.value ??
    url.searchParams.get('accessToken')

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { name, seedId, trackUris, includeSeed } = (await req.json()) as {
    name: string
    seedId: string
    trackUris: string[]
    includeSeed?: boolean
  }

  if (!name || !trackUris) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  try {
    const user = await getUserProfile(token)
    const playlist = await createPlaylist(user.id, name, token)

    const uris = includeSeed
      ? [`spotify:track:${seedId}`, ...trackUris]
      : trackUris

    await addTracksToPlaylist(playlist.id, uris, token)
    return NextResponse.json({ external_url: playlist.external_urls.spotify })
  } catch (err: any) {
    console.error('❌ /api/create-playlist error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
