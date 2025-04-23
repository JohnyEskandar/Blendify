// app/api/audio-features/[trackId]/route.ts

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { getAudioFeatures } from '@/lib/spotify'

export async function GET(
  req: NextRequest,
  { params }: { params: { trackId: string } }
) {
  const url = new URL(req.url)
  const token = (await cookies()).get('access_token')?.value ??
    url.searchParams.get('accessToken')

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const features = await getAudioFeatures(params.trackId, token)
    return NextResponse.json(features)
  } catch (err: any) {
    console.error('❌ /api/audio-features error:', err)
    return NextResponse.json(
      { error: err.message || 'Unknown error' },
      { status: 500 }
    )
  }
}
