import { NextRequest, NextResponse } from 'next/server'
import { getTokens, getUserProfile } from '@/lib/spotify'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.redirect(new URL('/login', req.url))

  const tokens = await getTokens(code)
  const profile = await getUserProfile(tokens.access_token)

  const res = NextResponse.redirect(new URL('/dashboard', req.url))
  res.cookies.set('access_token', tokens.access_token, { httpOnly: true, path: '/' })
  res.cookies.set('refresh_token', tokens.refresh_token, { httpOnly: true, path: '/' })

  return res
}
