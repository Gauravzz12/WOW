import { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowLeft,
  ScrollText,
  Megaphone,
  ShieldAlert,
  CreditCard,
  Clock,
  Scale,
  Mail,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms that govern broadcasting on Words of the World: tiers, payments, scheduling, moderation, and refunds.',
}

export default function TermsPage() {
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
            <ScrollText size={14} />
            <span>Legal</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif tracking-tight font-bold">
            Terms of Service
          </h1>
          <p className="text-secondary text-base md:text-lg leading-relaxed">
            Last Updated: November 2026 • Effective Immediately
          </p>
          <p className="text-secondary text-sm leading-relaxed">
            By using Words of the World (wordsoftheworld.xyz) — posting, sponsoring, commenting, or
            simply reading — you agree to these terms. If you do not agree, please do not use the service.
          </p>
        </header>

        {/* SECTION 1: THE SERVICE */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-primary/10">
            <Megaphone className="text-primary" size={20} />
            <h2 className="text-xl font-bold tracking-tight">1. What Words of the World Is</h2>
          </div>
          <div className="text-sm text-secondary leading-relaxed space-y-3">
            <p>
              Words of the World is a public, global message billboard. Everything you broadcast is
              public by design: it can be read, shared, and screenshotted by anyone, and it remains
              visible in our archive and leaderboard after its broadcast ends. Never post anything
              you would not want the world to see, and never post anyone else&apos;s private information.
            </p>
            <p>There are three ways a message reaches the billboard:</p>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-background-elevated/40 border border-primary/10 space-y-1">
                <span className="font-bold text-primary block text-sm">Normal (Priority Queue)</span>
                <span className="text-xs leading-relaxed block">You pay a bid for a broadcast duration. Messages air in bid order — higher bids air first — for the duration purchased. You may raise your bid later using the secret bump token in your receipt email.</span>
              </div>
              <div className="p-4 rounded-xl bg-background-elevated/40 border border-primary/10 space-y-1">
                <span className="font-bold text-primary block text-sm">Sponsored (Waiting Room)</span>
                <span className="text-xs leading-relaxed block">You post for free and your message waits, shown as a locked preview. Anyone — including you — may sponsor it for the flat sponsorship price, which broadcasts it in full for 30 minutes. Unpaid messages are removed from the Waiting Room after 12 hours. Sponsored posts do not have comments.</span>
              </div>
              <div className="p-4 rounded-xl bg-background-elevated/40 border border-primary/10 space-y-1">
                <span className="font-bold text-primary block text-sm">Special (Reserved Slots)</span>
                <span className="text-xs leading-relaxed block">You reserve fixed 3-hour slots on the global UTC schedule (up to 3 continuous slots). A Special broadcast airs at its reserved time and cannot be outbid. Slots are shown in UTC and converted to your local time for convenience — the UTC time is the one that counts.</span>
              </div>
            </div>
            <p>
              From time to time we run promotions, such as a limited number of free Normal broadcasts.
              Promotional broadcasts are limited per person, per email, and per device, join the queue
              at the base bid behind paid broadcasts, and may be changed or ended at any time.
            </p>
          </div>
        </section>

        {/* SECTION 2: YOUR CONTENT */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-primary/10">
            <ShieldAlert className="text-primary" size={20} />
            <h2 className="text-xl font-bold tracking-tight">2. Your Content &amp; Moderation</h2>
          </div>
          <div className="text-sm text-secondary leading-relaxed space-y-3">
            <p>
              You keep ownership of the words you write. By posting, you grant Words of the World a
              worldwide, royalty-free licence to display, reproduce, and promote your message as part
              of the service — on the billboard, in the archive and leaderboard, and in screenshots or
              posts showcasing the billboard.
            </p>
            <p>
              You are responsible for your content. All broadcasts must follow our{' '}
              <Link href="/guidelines" className="text-primary font-medium underline">User Guidelines</Link> and{' '}
              <Link href="/content-policy" className="text-primary font-medium underline">Content Policy</Link>:
              English text only, no hate speech, threats, harassment, scams, illegal goods, or sexual
              content involving minors (zero tolerance — such material is reported to authorities).
            </p>
            <p>
              Every message is screened automatically before it can air, and paid broadcasts are
              screened again when payment completes. Our moderation team may reject, remove, or
              purge any message, comment, or reaction that violates the policies, at any time,
              including after it has gone live.
            </p>
          </div>
        </section>

        {/* SECTION 3: PAYMENTS */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-primary/10">
            <CreditCard className="text-primary" size={20} />
            <h2 className="text-xl font-bold tracking-tight">3. Payments &amp; Refunds</h2>
          </div>
          <div className="text-sm text-secondary leading-relaxed space-y-3">
            <p>
              Payments are processed by Dodo Payments. Prices are in US dollars, and the total shown
              at checkout is the total you are charged. We never see or store your full card number.
            </p>
            <p>
              Broadcast airtime is a perishable, real-time product, and our refund rules follow the{' '}
              <Link href="/guidelines" className="text-primary font-medium underline">no-refund policy in the User Guidelines</Link>:
            </p>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 text-xs space-y-1">
                <span className="font-bold text-primary block text-sm">Policy violations — no refund</span>
                <span className="leading-relaxed block">If your message is rejected or removed for violating the User Guidelines or Content Policy, all payments for it — bids, slot fees, and sponsorships — are non-refundable.</span>
              </div>
              <div className="p-4 rounded-xl bg-background-elevated/40 border border-primary/10 text-xs space-y-1">
                <span className="font-bold text-primary block text-sm">Once it airs — no refund</span>
                <span className="leading-relaxed block">Once a broadcast has gone live or its reserved slot has begun, the airtime is consumed and no full or partial refund is due.</span>
              </div>
              <div className="p-4 rounded-xl bg-background-elevated/40 border border-primary/10 text-xs space-y-1">
                <span className="font-bold text-primary block text-sm">Our technical failure — we make it right</span>
                <span className="leading-relaxed block">If a paid broadcast never airs at all because of a technical fault on our side, contact us and we will re-run it or refund that broadcast.</span>
              </div>
            </div>
            <p>
              Sponsoring a message is a payment for that message&apos;s broadcast, whoever wrote it.
              A sponsorship is complete once the message goes live and cannot be withdrawn afterwards.
            </p>
          </div>
        </section>

        {/* SECTION 4: SCHEDULING */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-primary/10">
            <Clock className="text-primary" size={20} />
            <h2 className="text-xl font-bold tracking-tight">4. Scheduling &amp; Availability</h2>
          </div>
          <div className="text-sm text-secondary leading-relaxed space-y-3">
            <p>
              Normal broadcasts air in bid order, so an exact start time is never guaranteed — the
              queue position shown is an estimate based on the bids ahead of you. Special slots are
              the exception: they air at their reserved UTC times.
            </p>
            <p>
              We work to keep the billboard running around the clock, but the service is provided
              &quot;as is&quot;, without warranties of uninterrupted availability. Brief interruptions,
              maintenance, or queue congestion do not extend a broadcast unless we say so.
            </p>
            <p>
              We may change prices, durations, tiers, and features over time. Changes never alter a
              broadcast you have already paid for.
            </p>
          </div>
        </section>

        {/* SECTION 5: LIABILITY */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-primary/10">
            <Scale className="text-primary" size={20} />
            <h2 className="text-xl font-bold tracking-tight">5. Liability &amp; Changes</h2>
          </div>
          <div className="text-sm text-secondary leading-relaxed space-y-3">
            <p>
              Messages on the billboard are the words of their authors, not of Words of the World,
              and their appearance is not an endorsement. To the maximum extent permitted by law,
              our total liability arising from the service is limited to the amount you paid for the
              broadcast in question, and we are not liable for indirect or consequential losses.
            </p>
            <p>
              We may update these terms; the version published here is the current one, and continuing
              to use the service after an update means you accept it. If any part of these terms is
              found unenforceable, the rest still applies.
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
            Questions about these terms, a payment, or a broadcast:{' '}
            <a
              href="mailto:wordsoftheworld.lol@gmail.com?subject=[Terms%20Inquiry]"
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
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/content-policy" className="hover:text-primary transition-colors">Content Policy</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
            <Link href="/create" className="hover:text-primary transition-colors">Leave Message</Link>
          </div>
        </div>

      </div>
    </div>
  )
}
