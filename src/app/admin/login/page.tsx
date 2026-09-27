'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginWithPassword } from './actions'
import { ArrowLeft, Lock, ShieldCheck, KeyRound } from 'lucide-react'
import Link from 'next/link'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    const formData = new FormData()
    formData.append('password', password)

    const result = await loginWithPassword(formData)

    if (result?.error) {
      setStatus('error')
      setErrorMessage(result.error)
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-background text-primary flex flex-col selection:bg-primary/20">
      <header className="p-6">
        <Link 
          href="/" 
          className="inline-flex items-center text-secondary hover:text-primary transition-colors text-sm font-medium tracking-wide"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to World
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 -mt-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-background-elevated border border-primary/10 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center mb-4 text-primary">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight">
                Admin Headquarters
              </h1>
              <p className="text-secondary text-sm mt-2">
                Authorized personnel only. Enter master access key to unlock.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label 
                  htmlFor="admin-key" 
                  className="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2"
                >
                  Master Access Key
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-key"
                    type="password"
                    required
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-background border border-primary/15 rounded-xl focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/30 text-primary placeholder-secondary/40 transition-all text-sm font-mono"
                  />
                </div>
              </div>

              {status === 'error' && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-medium text-center">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading' || !password}
                className="w-full bg-primary text-background font-semibold py-3 px-4 rounded-xl hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                {status === 'loading' ? (
                  <>
                    <span className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin"></span>
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Unlock Dashboard</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-primary/10 text-center text-xs text-secondary/60">
              Encrypted session verification active
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
