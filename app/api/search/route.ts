import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q')
  const accessToken = req.nextUrl.searchParams.get('accessToken')

  if (!query || !accessToken) {
    return NextResponse.json({ error: 'Missing query or token' }, { status: 400 })
  }

  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=12`

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!res.ok) {
    const error = await res.json()
    console.error('Spotify API error:', {
      status: res.status,
      statusText: res.statusText,
      error,
    })
    return NextResponse.json({ error }, { status: res.status })
  }

  const data = await res.json()
  return NextResponse.json({ tracks: data.tracks.items })
}
