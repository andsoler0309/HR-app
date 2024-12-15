'use client'
import { useAuthStore } from '@/store/auth'

export function Navigation() {
  const { profile, signOut } = useAuthStore()

  return (
    <nav>
      {/* Your existing navigation code */}
      <div className="flex items-center">
        <span className="mr-4">{profile?.full_name}</span>
        <button onClick={signOut}>Sign out</button>
      </div>
    </nav>
  )
}