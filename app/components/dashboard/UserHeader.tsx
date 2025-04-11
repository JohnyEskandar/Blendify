import Image from 'next/image'

interface UserHeaderProps {
  user: {
    display_name: string
    images?: { url: string }[]
  }
  playlistCount: number
}

export default function UserHeader({ user, playlistCount }: UserHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold">Welcome, {user.display_name}</h1>
        <p className="text-gray-400 text-sm mt-2">
          You have {playlistCount} playlists created.
        </p>
      </div>

      {user.images?.[0]?.url && (
        <div className="w-32 h-32 relative">
          <Image
            src={user.images[0].url}
            alt="User avatar"
            fill
            className="rounded-full object-cover"
          />
        </div>
      )}
    </div>
  )
}
