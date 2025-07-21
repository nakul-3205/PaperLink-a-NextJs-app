'use client'

import { useUser, UserButton } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

export default function ProfilePage() {
  const { user, isLoaded } = useUser()
  const [docCount, setDocCount] = useState<number>(0)

  useEffect(() => {
    const fetchDocCount = async () => {
      const res = await fetch('/api/documents')
      const data = await res.json()
      setDocCount(data.length)
    }

    fetchDocCount()
  }, [])

  if (!isLoaded) return <p className="p-8">Loading profile...</p>

  return (
    <div className="min-h-screen px-8 py-10 bg-white">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>

      <div className="flex items-center gap-6">
        <img
          src={user.imageUrl}
          alt="Profile"
          className="w-20 h-20 rounded-full object-cover border"
        />
        <div>
          <p className="text-xl font-semibold">{user.fullName || 'Unnamed User'}</p>
          <p className="text-gray-600">{user.primaryEmailAddress?.emailAddress}</p>
          <p className="text-sm text-gray-500 mt-1">
            Joined: {new Date(user.createdAt).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-500">Total Docs: {docCount}</p>
        </div>
      </div>

      <div className="mt-8">
        <UserButton afterSignOutUrl="/sign-in" />
      </div>
    </div>
  )
}
