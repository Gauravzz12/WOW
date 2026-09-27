'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { User, LogOut } from 'lucide-react'
import { logout } from '@/app/login/actions'
import { ThemeToggle } from './ThemeToggle'

export function UserMenu() {
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  if (user) {
    return (
      <div className="flex flex-col gap-3 mt-8 pt-8 border-t border-background-elevated">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary/70">
            <User size={16} />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{user.email}</p>
          </div>
          <form action={logout}>
            <button 
              type="submit"
              className="text-secondary hover:text-primary transition-colors"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </form>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard" className="flex-1 text-center py-2 bg-background-elevated border border-primary/10 rounded-lg text-sm font-medium hover:bg-primary/5 transition-all">
            My Messages
          </Link>
          <div className="border border-primary/10 rounded-lg flex items-center justify-center px-1">
            <ThemeToggle />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-8 pt-8 border-t border-background-elevated flex gap-2">
      <Link href="/login" className="flex-1">
        <button className="w-full py-2 bg-transparent border border-primary/20 text-primary rounded-lg text-sm font-medium hover:bg-primary/5 transition-all">
          Sign In
        </button>
      </Link>
      <div className="border border-primary/20 rounded-lg flex items-center justify-center px-1">
        <ThemeToggle />
      </div>
    </div>
  )
}
