'use client'

export default function SignOutButton() {
  const handleSignOut = () => {
    window.location.href = '/api/auth/signout'
  }

  return (
    <button onClick={handleSignOut}>
      Sign Out
    </button>
  )
}
