'use client'

import { useUser } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const user = useUser()
  const router = useRouter()

  if (!user) {
    router.push('/register')
    return <p>Redirecting to register...</p>
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to MEDIC Foundation Volunteer Portal</h1>
      <p className="mb-6">Manage your profile, sessions, and activities here.</p>
      <div className="space-x-4">
        <button onClick={() => router.push('/profile')} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          My Profile
        </button>
        <button onClick={() => router.push('/changeavailability')} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Manage Sessions
        </button>
        <button onClick={() => router.push('/conversationideas')} className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
          Conversation Ideas
        </button>
      </div>
    </div>
  )
}
