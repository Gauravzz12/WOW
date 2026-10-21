import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Shield, AlertTriangle, Eye, CheckCircle2, Mail, Ban, Lock, Scale } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Content Moderation & Community Guidelines',
  description: 'Our zero-tolerance content policy, automated moderation guardrails, and compliance standards.',
}

export default function ContentPolicyPage() {
  return (
    <div className="min-h-[100dvh] bg-background text-primary relative flex flex-col pt-16 px-6 pb-24 overflow-x-hidden">
      
      {/* Background radial gradient */}
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Shield size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span>Safety & Compliance Standards</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif tracking-tight font-bold">
            Content Moderation Policy
          </h1>
          <p className="text-secondary text-base md:text-lg leading-relaxed">
            Words of the World is an ephemeral global broadcast platform. To maintain a safe, lawful, and trustworthy environment for all viewers and card payment networks, we enforce strict, multi-layered content moderation guardrails.
          </p>
          <p className="text-xs text-secondary font-mono">
            Last Updated: October 2026 • Effective Immediately
          </p>
        </header>

        {/* Core Principles */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-background-elevated/40 border border-primary/10 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Eye size={18} />
            </div>
            <h3 className="font-bold text-sm">Automated Pre-Screening</h3>
            <p className="text-xs text-secondary leading-relaxed">
              Every message is parsed by automated safety filters prior to checkout, preventing prohibited content before it can be submitted.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-background-elevated/40 border border-primary/10 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Lock size={18} />
            </div>
            <h3 className="font-bold text-sm">24/7 Human Moderation</h3>
            <p className="text-xs text-secondary leading-relaxed">
              Administrative reviewers monitor the live display and waiting queues to rapidly remove any borderline or flagged material.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-background-elevated/40 border border-primary/10 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Ban size={18} />
            </div>
            <h3 className="font-bold text-sm">Zero-Tolerance / No Refund</h3>
            <p className="text-xs text-secondary leading-relaxed">
              Violating messages are purged immediately. Fees paid for prohibited content are strictly forfeited with zero refund.
            </p>
          </div>
        </section>

        {/* Section 1: Prohibited Categories */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-primary/10">
            <AlertTriangle className="text-amber-500" size={20} />
            <h2 className="text-xl font-bold tracking-tight">1. Strictly Prohibited Content</h2>
          </div>
          <p className="text-sm text-secondary leading-relaxed">
            The following categories of content are strictly prohibited from being submitted, queued, or broadcast on Words of the World under any circumstances:
          </p>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-background-elevated/20 border border-primary/5 space-y-1">
              <h4 className="font-bold text-sm text-primary flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Hate Speech & Discrimination
              </h4>
              <p className="text-xs text-secondary leading-relaxed pl-4">
                Content that promotes hatred, incites violence, or uses derogatory slurs against individuals or groups based on race, ethnicity, nationality, religion, disability, gender, gender identity, age, veteran status, or sexual orientation.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-background-elevated/20 border border-primary/5 space-y-1">
              <h4 className="font-bold text-sm text-primary flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Adult, Sexually Explicit & NSFW Material
              </h4>
              <p className="text-xs text-secondary leading-relaxed pl-4">
                Pornography, sexually explicit descriptions, prostitution/escort solicitations, nudity, or graphic sexual acts. <strong>Zero-tolerance policy for child sexual abuse material (CSAM)</strong>: any attempt to submit or solicit underage content will be permanently logged and reported to the National Center for Missing & Exploited Children (NCMEC) and relevant law enforcement.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-background-elevated/20 border border-primary/5 space-y-1">
              <h4 className="font-bold text-sm text-primary flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Threats, Violence & Self-Harm Incitement
              </h4>
              <p className="text-xs text-secondary leading-relaxed pl-4">
                Specific threats of physical harm, encouraging suicide or self-harm, bomb threats, mass violence references, terrorism promotion, or glorification of violent acts.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-background-elevated/20 border border-primary/5 space-y-1">
              <h4 className="font-bold text-sm text-primary flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Harassment, Doxxing & Defamation
              </h4>
              <p className="text-xs text-secondary leading-relaxed pl-4">
                Publishing private personally identifiable information (PII) including non-public phone numbers, physical residential addresses, social security/national identity numbers, non-consensual imagery, or malicious libelous statements intended to damage personal reputations.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-background-elevated/20 border border-primary/5 space-y-1">
              <h4 className="font-bold text-sm text-primary flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Financial Fraud, Scams & Malicious Links
              </h4>
              <p className="text-xs text-secondary leading-relaxed pl-4">
                Crypto wallet drainers, phishing domains, get-rich-quick schemes, pyramid/Ponzi promotions, fake prize giveaways, or unsolicited financial solicitation. All external hyperlinks submitted via sponsored slots must lead to legitimate, secure HTTPS destinations.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-background-elevated/20 border border-primary/5 space-y-1">
              <h4 className="font-bold text-sm text-primary flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Language Requirement: English Only
              </h4>
              <p className="text-xs text-secondary leading-relaxed pl-4">
                To guarantee reliable real-time automated safety scanning and immediate takedown verification, all messages submitted for global broadcast must be written in English. Submissions containing foreign non-Latin scripts will be rejected at entry.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-background-elevated/20 border border-primary/5 space-y-1">
              <h4 className="font-bold text-sm text-primary flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Illegal Goods & Controlled Substances
              </h4>
              <p className="text-xs text-secondary leading-relaxed pl-4">
                Selling, facilitating, or promoting illegal narcotics, regulated pharmaceuticals without prescription, unregistered firearms, ammunition, explosives, or black market goods.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Technical Architecture */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-primary/10">
            <Scale className="text-blue-500" size={20} />
            <h2 className="text-xl font-bold tracking-tight">2. Multi-Layer Guardrail Architecture</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-background-elevated/30 border border-primary/10 space-y-2">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-500">
                Layer 1: Real-time Ingestion Filter
              </div>
              <h3 className="font-bold text-base">Client & Server Pre-Validation</h3>
              <p className="text-xs text-secondary leading-relaxed">
                Prior to checkout initiation, every message string is parsed against our keyword, regex, and leetspeak de-obfuscation engine. Violating strings are blocked synchronously with a descriptive error, preventing unmoderated content from ever entering the payment funnel.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-background-elevated/30 border border-primary/10 space-y-2">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-500">
                Layer 2: XSS & HTML Sanitization
              </div>
              <h3 className="font-bold text-base">DOMPurify & Structural Stripping</h3>
              <p className="text-xs text-secondary leading-relaxed">
                Rich text styling is sanitized through strict server-side DOMPurify policies. Script tags, iframes, inline event handlers, and data URIs are discarded to ensure visual and cryptographic security.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-background-elevated/30 border border-primary/10 space-y-2">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-violet-500">
                Layer 3: 24/7 Admin Takedown Engine
              </div>
              <h3 className="font-bold text-base">1-Click Immediate Purge</h3>
              <p className="text-xs text-secondary leading-relaxed">
                Administrators possess dedicated live moderation dashboards with authenticated 1-click removal capabilities. Removing a message permanently marks it as <code className="text-xs font-mono bg-background px-1 py-0.5 rounded">REMOVED</code> and automatically advances the queue.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-background-elevated/30 border border-primary/10 space-y-2">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500">
                Layer 4: Community Fast-Track SLA
              </div>
              <h3 className="font-bold text-base">Viewer Reporting Channel</h3>
              <p className="text-xs text-secondary leading-relaxed">
                Every broadcast card features direct reporting access. Community incident reports trigger instant review with a guaranteed response and resolution SLA under 1 hour.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Enforcement & No-Refund Policy */}
        <section className="space-y-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6">
          <h2 className="text-lg font-bold text-rose-800 dark:text-rose-300 flex items-center gap-2">
            <AlertTriangle size={18} />
            <span>3. Zero-Refund Policy for Violations</span>
          </h2>
          <p className="text-xs md:text-sm text-secondary leading-relaxed">
            By submitting a message and completing payment through DodoPayments, you acknowledge that our billboard operates on finite global airtime. 
            If a broadcast is removed due to a violation of this Content Moderation Policy:
          </p>
          <ul className="list-disc list-inside text-xs text-secondary space-y-1.5 pl-2">
            <li>The message will be removed from the live display and historical archive immediately.</li>
            <li><strong>All associated fees, bids, or sponsorship payments are strictly non-refundable and will be forfeited.</strong></li>
            <li>Repeat offenders or malicious actors will be permanently blocked from submitting future messages.</li>
          </ul>
        </section>

        {/* Section 4: Notice, Takedown & Contact */}
        <section className="space-y-4 rounded-2xl border border-primary/15 bg-background-elevated/40 p-6 md:p-8">
          <div className="flex items-center gap-2">
            <Mail className="text-primary" size={20} />
            <h2 className="text-lg font-bold">4. Report a Violation or Request a Takedown</h2>
          </div>
          <p className="text-xs md:text-sm text-secondary leading-relaxed">
            If you encounter any broadcast that you believe violates our Community Guidelines or applicable laws, please submit an expedited takedown notice:
          </p>

          <div className="p-4 rounded-xl bg-background border border-primary/10 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                Dedicated Moderation Email
              </span>
              <a 
                href="mailto:wordsoftheworld.lol@gmail.com?subject=[URGENT%20Content%20Moderation%20Notice]" 
                className="text-sm font-mono font-bold text-primary hover:underline"
              >
                wordsoftheworld.lol@gmail.com
              </a>
            </div>
            <p className="text-[11px] text-secondary">
              Include the Message ID (visible on card), timestamp, or card screenshot. Takedown requests are processed 24/7/365 with typical resolution in under 30 minutes.
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
            <Link href="/about" className="hover:text-primary transition-colors">About</Link>
            <Link href="/create" className="hover:text-primary transition-colors">Leave Message</Link>
          </div>
        </div>

      </div>
    </div>
  )
}
