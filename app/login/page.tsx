'use client'

export default function LoginPage() {
  const handleLogin = () => {
    const scope = [
      'user-read-private',
      'playlist-read-private',
      'playlist-modify-public',
      'playlist-modify-private'
    ].join(' ')

    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

    if (!clientId || !baseUrl) {
      console.error('Missing Spotify env variables')
      return
    }

    const authUrl = new URL('https://accounts.spotify.com/authorize')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('redirect_uri', `${baseUrl}/api/auth/callback`)
    authUrl.searchParams.set('scope', scope)

    window.location.href = authUrl.toString()
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-4">
      <h1 className="text-4xl font-bold mb-8 tracking-tight text-green-500">Welcome to Blendify 🎧</h1>
      <p className="text-sm text-gray-400 mb-6 text-center max-w-md">
        Login with your Spotify account to generate seamless playlists with intelligent transitions.
      </p>
      <button
        onClick={handleLogin}
        className="px-6 py-3 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-full shadow-lg transition"
      >
        Login with Spotify
      </button>
    </main>
  )
}