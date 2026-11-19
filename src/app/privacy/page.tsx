import { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowLeft,
  Lock,
  Eye,
  Cookie,
  CreditCard,
  BarChart3,
  Database,
  Mail,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'What Words of the World collects, why, and the choices you have — no accounts, no card data, one device cookie.',
}

export default function PrivacyPage() {
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
            <Lock size={14} />
            <span>Privacy</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif tracking-tight font-bold">
            Privacy Policy
          </h1>
          <p className="text-secondary text-base md:text-lg leading-relaxed">
            Last Updated: November 2026 • Effective Immediately
          </p>
          <p className="text-secondary text-sm leading-relaxed">
            Words of the World has no accounts and no sign-up. You can broadcast completely
            anonymously. This page explains the small amount of information the service does
            handle, and why.
          </p>
        </header>

        {/* SECTION 1: WHAT YOU GIVE US */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-primary/10">
            <Eye className="text-primary" size={20} />
            <h2 className="text-xl font-bold tracking-tight">1. What You Give Us</h2>
          </div>
          <div className="text-sm text-secondary leading-relaxed space-y-3">
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-background-elevated/40 border border-primary/10 space-y-1">
                <span className="font-bold text-primary block text-sm">Your message — public by design</span>
                <span className="text-xs leading-relaxed block">Your broadcast text, chosen display name or brand name/link, decorations, comments, and reactions are published on a public billboard. They stay visible in the archive and leaderboard after the broadcast ends. Do not put private information in a message.</span>
              </div>
              <div className="p-4 rounded-xl bg-background-elevated/40 border border-primary/10 space-y-1">
                <span className="font-bold text-primary block text-sm">Reminder email — only if you ask</span>
                <span className="text-xs leading-relaxed block">If you opt in to a broadcast reminder, we store the email address with your message and use it only to send that reminder. Sponsors may also add a public dedication name and note, which are shown with the broadcast.</span>
              </div>
              <div className="p-4 rounded-xl bg-background-elevated/40 border border-primary/10 space-y-1">
                <span className="font-bold text-primary block text-sm">Reports</span>
                <span className="text-xs leading-relaxed block">If you report a message, the message ID, the reason, and any note you write are emailed to our moderation team so they can review it.</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: DEVICE ID */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-primary/10">
            <Cookie className="text-primary" size={20} />
            <h2 className="text-xl font-bold tracking-tight">2. The Device Cookie</h2>
          </div>
          <div className="text-sm text-secondary leading-relaxed space-y-3">
            <p>
              Because there are no accounts, the site keeps one anonymous device identifier in a
              cookie (<span className="font-mono text-xs">wow_device_id</span>). It is a random ID —
              it does not contain your name or any personal details — and it is how the site:
            </p>
            <div className="p-4 rounded-lg bg-background/80 border border-primary/10 space-y-2 text-xs leading-relaxed">
              <p>• Remembers which messages you have reacted to, and lets you remove your own comments.</p>
              <p>• Applies the free-broadcast limits (per device and per email) and comment rate limits fairly.</p>
              <p>• Remembers which messages you have already reported, so duplicate reports are not sent again (a second, short-lived cookie).</p>
            </div>
            <p>
              The device cookie lasts up to 10 years so your reactions and limits survive between
              visits. You can delete it in your browser at any time; the site will simply treat you
              as a new device. A separate, short-lived storage entry keeps an unfinished message
              draft in your browser tab so a refresh does not lose it — it never leaves your device.
            </p>
          </div>
        </section>

        {/* SECTION 3: PAYMENTS */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-primary/10">
            <CreditCard className="text-primary" size={20} />
            <h2 className="text-xl font-bold tracking-tight">3. Payments</h2>
          </div>
          <div className="text-sm text-secondary leading-relaxed space-y-3">
            <p>
              Payments are handled entirely by Dodo Payments on their own checkout pages. Your card
              number goes to Dodo, never to us, and we do not store it. We keep a payment record —
              amount, currency, status, and the payment ID — linked to your message, for accounting,
              fraud prevention, and handling disputes. Dodo&apos;s own privacy policy covers the
              details they process at checkout, such as your billing country and email.
            </p>
          </div>
        </section>

        {/* SECTION 4: ANALYTICS */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-primary/10">
            <BarChart3 className="text-primary" size={20} />
            <h2 className="text-xl font-bold tracking-tight">4. Analytics</h2>
          </div>
          <div className="text-sm text-secondary leading-relaxed space-y-3">
            <p>
              We use PostHog to understand how the billboard is used — pages viewed and actions such
              as sharing a message — so we can fix problems and improve the service. We do not sell
              personal information, and we do not run third-party advertising trackers.
            </p>
          </div>
        </section>

        {/* SECTION 5: RETENTION & CHOICES */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-primary/10">
            <Database className="text-primary" size={20} />
            <h2 className="text-xl font-bold tracking-tight">5. Retention &amp; Your Choices</h2>
          </div>
          <div className="text-sm text-secondary leading-relaxed space-y-3">
            <p>
              Broadcasts are a public record of the billboard, so messages, comments, and reactions
              are kept as part of the archive. Unpaid Waiting Room messages are deleted automatically
              after 12 hours. Payment records are kept as long as accounting and dispute rules require.
            </p>
            <p>
              You can delete your own comments at any time from the message page, and clear the device
              cookie in your browser settings. For anything else — including a request to remove a
              message you posted or to delete a reminder email — contact us below and we will help.
            </p>
            <p>
              Words of the World is not intended for children under 13. We may update this policy;
              the version published here is the current one.
            </p>
          </div>
        </section>

        {/* SECTION 6: CONTACT */}
        <section className="space-y-4 rounded-lg border border-primary/15 bg-background-elevated/40 p-6 md:p-8">
          <div className="flex items-center gap-2">
            <Mail className="text-primary" size={20} />
            <h2 className="text-lg font-bold">6. Contact</h2>
          </div>
          <p className="text-xs md:text-sm text-secondary leading-relaxed">
            Privacy questions or requests:{' '}
            <a
              href="mailto:wordsoftheworld.lol@gmail.com?subject=[Privacy%20Inquiry]"
              className="text-primary font-mono font-bold underline"
            >
              wordsoftheworld.lol@gmail.com
            </a>
          </p>
        </section>

        {/* Footer Navigation */}
        <div className="pt-6 border-t border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-secondary">
            © 2026 Words of the World. All rights reserved.
          </span>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/" className="hover:text-primary transition-colors">Billboard</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/content-policy" className="hover:text-primary transition-colors">Content Policy</Link>
            <Link href="/create" className="hover:text-primary transition-colors">Leave Message</Link>
          </div>
        </div>

      </div>
    </div>
  )
}
