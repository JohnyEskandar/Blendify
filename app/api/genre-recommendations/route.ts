// app/api/genre-recommendations/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import {
  getSpotifyTrack,
  getArtistById,
  searchTracksByGenre,
  getArtistTopTracks,         // ← new import
} from '@/lib/spotify';

export async function GET(req: NextRequest) {
  const token = (await cookies()).get('access_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const url = new URL(req.url);
  const seed = url.searchParams.get('seed');
  const limit = parseInt(url.searchParams.get('limit') || '15', 10);
  if (!seed) {
    return NextResponse.json({ error: 'Missing seed param' }, { status: 400 });
  }

  // 1) fetch the seed track and collect its artist IDs
  const seedTrack: any = await getSpotifyTrack(seed, token);
  const artistIds = seedTrack.artists.map((a: any) => a.id);

  // 2) gather genres from each artist
  const genreSet = new Set<string>();
  for (const artistId of artistIds) {
    const artist: any = await getArtistById(artistId, token);
    artist.genres.forEach((g: string) => genreSet.add(g));
  }

  let recommendations: any[] = [];

  if (genreSet.size > 0) {
    // 3a) for each genre, search and dedupe
    const seen = new Map<string, any>();
    const perGenre = Math.ceil(limit / genreSet.size) + 2;
    for (const genre of genreSet) {
      const tracks = await searchTracksByGenre(genre, token, perGenre);
      for (const t of tracks) {
        if (t.id !== seed && !seen.has(t.id)) {
          seen.set(t.id, t);
        }
      }
    }
    recommendations = Array.from(seen.values()).slice(0, limit);
  } else {
    // 3b) fallback: use each artist's top tracks
    const seen = new Map<string, any>();
    for (const artistId of artistIds) {
      const tracks = await getArtistTopTracks(artistId, token);
      for (const t of tracks) {
        if (t.id !== seed && !seen.has(t.id)) {
          seen.set(t.id, t);
        }
      }
    }
    recommendations = Array.from(seen.values()).slice(0, limit);
  }

  return NextResponse.json({ tracks: recommendations });
}
