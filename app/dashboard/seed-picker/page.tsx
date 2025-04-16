// app/dashboard/seed-picker/page.tsx
import SeedPickerClient from './seedPickerClient'
import { cookies } from 'next/headers'

export default async function SeedPickerPage() {
  const accessToken = (await cookies()).get('access_token')?.value

  if (!accessToken) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">Not Logged In</h1>
        <a href="/login" className="text-blue-500 underline">Go to Login</a>
      </main>
    )
  }

  return <SeedPickerClient accessToken={accessToken} />
}
