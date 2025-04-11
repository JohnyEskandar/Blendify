import { getUserProfile, getUserPlaylists } from '@/lib/spotify'
import { PlaylistList } from '@/app/components/dashboard/PlaylistList'
import { cookies } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import SignOutButton from '@/app/components/shared/SignOutButton'

export default async function Dashboard() {
  const accessToken = (await cookies()).get('access_token')?.value

  if (!accessToken) {
    return (
      <main>
        <h1 className="text-2xl font-bold">Not Logged In</h1>
        <a href="/login">Go to Login</a>
      </main>
    )
  }

  const user = await getUserProfile(accessToken)
  const playlists = await getUserPlaylists(accessToken)

  const userOwned = playlists.items
    .filter((p: any) => p.owner.id === user.id)
    .filter((p: any) => p.tracks.total > 0)
    .sort((a: any, b: any) => b.tracks.total - a.tracks.total)

  return (
    <main className="min-h-screen w-full">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold">Welcome, {user.display_name}</h1>
          <p className="text-sm text-[var(--secondary)] mt-2">
            You have {userOwned.length} playlists created.
          </p>
        </div>

        <div className="flex flex-col items-center md:flex-row gap-4 md:gap-6 mt-4 md:mt-0">
          {user.images?.[0]?.url && (
            <div className="w-24 h-24 relative">
              <Image
                src={user.images[0].url}
                alt="User avatar"
                fill
                className="rounded-full object-cover"
              />
            </div>
          )}

          <div className="flex gap-3">
            <Link
              href="/dashboard/seed-picker"
              className="bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-gray-200 transition"
            >
              Create Playlist →
            </Link>

            <SignOutButton />
          </div>
        </div>
      </div>

      <div className="bg-[var(--spotify-dark-gray)] rounded-xl p-6 shadow-inner">
        <h2 className="text-xl font-semibold mb-4">Your Playlists</h2>
        <PlaylistList playlists={userOwned} />
      </div>
    </main>
  )
}
