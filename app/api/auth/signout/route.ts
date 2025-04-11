import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const loginUrl = new URL('/login', request.url)
  const response = NextResponse.redirect(loginUrl)

  // Expire the cookies
  response.cookies.set('access_token', '', { maxAge: 0 })
  response.cookies.set('refresh_token', '', { maxAge: 0 })

  return response
}
