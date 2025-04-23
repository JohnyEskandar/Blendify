// app/api/recommendations/route.ts

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { getRecommendationsFromSeed } from '@/lib/spotify'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const token = (await cookies()).get('access_token')?.value ??
    url.searchParams.get('accessToken')

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const seed = url.searchParams.get('seed_tracks')
  const limit = parseInt(url.searchParams.get('limit') || '15', 10)
  if (!seed) {
    return NextResponse.json({ error: 'Missing seed_tracks param' }, { status: 400 })
  }

  try {
    const data = await getRecommendationsFromSeed(seed, token, limit)
    return NextResponse.json({ tracks: data.tracks })
  } catch (err: any) {
    console.error('❌ /api/recommendations error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
