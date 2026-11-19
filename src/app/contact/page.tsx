import { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowLeft,
  Mail,
  Flag,
  CreditCard,
  ShieldAlert,
  Lock,
  MessageSquare,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'How to reach the Words of the World team — content reports, payment and broadcast help, takedowns, privacy requests, and feedback.',
}

const EMAIL = 'wordsoftheworld.lol@gmail.com'

function mailto(subject: string) {
  return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`
}

export default function ContactPage() {
  return (
    <div className="min-h-[100dvh] bg-background text-primary relative flex flex-col pt-16 px-6 pb-24 overflow-x-hidden">

      <div className="max-w-3xl mx-auto w-full relative z-10 space-y-12">

        {/* Navigation Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-background-elevated border border-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
            <ArrowLeft size={16} />
          </div>
          <span className="text-sm font-bold tracking-widest uppercase">Back to Billboard</span>
        </Link>

        {/* Header */}
        <header className="space-y-4 border-b border-primary/10 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
            <Mail size={14} />
            <span>Support</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif tracking-tight font-bold">
            Contact Us
          </h1>
          <p className="text-secondary text-base md:text-lg leading-relaxed">
            No accounts, no ticket system — just email. Pick the topic that fits and write to us;
            including your Message ID (shown on your post page and in your receipt email) helps
            us find your broadcast fast.
          </p>
          <a
            href={mailto('[Support] ')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-background text-sm font-bold hover:opacity-90 active:scale-95 transition-all"
          >
            <Mail size={16} />
            {EMAIL}
          </a>
        </header>

        {/* FASTEST PATHS */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-primary/10">
            <MessageSquare className="text-primary" size={20} />
            <h2 className="text-xl font-bold tracking-tight">The Fastest Path for Each Issue</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-lg bg-background-elevated/40 border border-primary/10 space-y-2">
              <div className="font-bold text-sm text-primary flex items-center gap-2">
                <Flag size={16} className="text-rose-500" />
                A message breaks the rules
              </div>
              <p className="text-xs text-secondary leading-relaxed">
                Don&apos;t email — tap the <strong>Report</strong> button on the message itself. It sends an
                expedited alert straight to our 24/7 moderation team, with the message attached.
              </p>
              <Link href="/" className="text-xs font-bold text-primary underline">Go to the billboard →</Link>
            </div>

            <div className="p-5 rounded-lg bg-background-elevated/40 border border-primary/10 space-y-2">
              <div className="font-bold text-sm text-primary flex items-center gap-2">
                <CreditCard size={16} className="text-emerald-500" />
                Payment or broadcast problem
              </div>
              <p className="text-xs text-secondary leading-relaxed">
                Charged but not live, a slot mix-up, a bump token that doesn&apos;t work — email us with
                your Message ID and the payment ID from your receipt.
              </p>
              <a href={mailto('[Payment Help] ')} className="text-xs font-bold text-primary underline">Email payment help →</a>
            </div>

            <div className="p-5 rounded-lg bg-background-elevated/40 border border-primary/10 space-y-2">
              <div className="font-bold text-sm text-primary flex items-center gap-2">
                <ShieldAlert size={16} className="text-amber-500" />
                Takedown or legal request
              </div>
              <p className="text-xs text-secondary leading-relaxed">
                For content that infringes your rights or urgent legal matters, email us with the
                Message ID and details. Takedown requests are processed 24/7, as described in the{' '}
                <Link href="/content-policy" className="underline font-medium text-primary">Content Policy</Link>.
              </p>
              <a href={mailto('[URGENT Takedown] ')} className="text-xs font-bold text-primary underline">Email a takedown request →</a>
            </div>

            <div className="p-5 rounded-lg bg-background-elevated/40 border border-primary/10 space-y-2">
              <div className="font-bold text-sm text-primary flex items-center gap-2">
                <Lock size={16} className="text-violet-500" />
                Privacy request
              </div>
              <p className="text-xs text-secondary leading-relaxed">
                Questions about the device cookie, a reminder email, or removing your message — see the{' '}
                <Link href="/privacy" className="underline font-medium text-primary">Privacy Policy</Link>,
                then email us and we&apos;ll sort it out.
              </p>
              <a href={mailto('[Privacy Request] ')} className="text-xs font-bold text-primary underline">Email a privacy request →</a>
            </div>
          </div>

          <div className="p-5 rounded-lg bg-background-elevated/40 border border-primary/10 space-y-2">
            <div className="font-bold text-sm text-primary">Everything else</div>
            <p className="text-xs text-secondary leading-relaxed">
              Feedback, ideas, press, partnerships, or just to say hello —{' '}
              <a href={mailto('[Hello] ')} className="text-primary font-mono font-bold underline">{EMAIL}</a>.
              We read everything; replies may take a few days when the queue is busy.
            </p>
          </div>
        </section>

        {/* Footer Navigation */}
        <div className="pt-6 border-t border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-secondary">
            © 2026 Words of the World. All rights reserved.
          </span>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/" className="hover:text-primary transition-colors">Billboard</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/content-policy" className="hover:text-primary transition-colors">Content Policy</Link>
            <Link href="/create" className="hover:text-primary transition-colors">Leave Message</Link>
          </div>
        </div>

      </div>
    </div>
  )
}
