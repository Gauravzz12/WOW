import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { verifyAdminSessionToken, ADMIN_COOKIE_CONFIG } from '@/lib/adminAuth'
import { logoutAdmin } from '@/app/admin/login/actions'
import { ShieldCheck, LogOut, ExternalLink } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const token = cookieStore.get(ADMIN_COOKIE_CONFIG.name)?.value
  const isValid = await verifyAdminSessionToken(token)

  if (!isValid) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-background text-primary selection:bg-primary/20">
      <header className="border-b border-primary/10 p-4 bg-background-elevated/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-lg font-serif font-bold tracking-wider uppercase">
                Admin Headquarters
              </h1>
              <div className="text-[10px] text-green-600 font-mono tracking-widest uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Authorized Admin Session
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-secondary hover:text-primary transition-colors py-1.5 px-3 rounded-lg border border-primary/10 hover:bg-background-muted"
            >
              <span>View Public World</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <form action={logoutAdmin}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 text-xs text-secondary hover:text-red-500 transition-colors py-1.5 px-3 rounded-lg border border-primary/10 hover:border-red-500/20 hover:bg-red-500/5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  )
}
