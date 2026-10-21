import { Metadata } from 'next'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Sparkles, 
  Heart, 
  ShieldAlert, 
  Ban, 
  AlertOctagon, 
  CheckCircle2, 
  DollarSign, 
  Mail, 
  HelpCircle,
  FileText
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'User Guidelines & Code of Conduct',
  description: 'Community guidelines, prohibited content criteria, and our strict no-refund policy for violating messages.',
}

export default function GuidelinesPage() {
  return (
    <div className="min-h-[100dvh] bg-background text-primary relative flex flex-col pt-16 px-6 pb-24 overflow-x-hidden">
      
      {/* Background radial gradient mask */}
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
            <FileText size={14} />
            <span>Broadcast Standards</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif tracking-tight font-bold">
            User Guidelines & Code of Conduct
          </h1>
          <p className="text-secondary text-base md:text-lg leading-relaxed">
            Words of the World is an open, global canvas. It exists for real human stories, raw confessions, celebrations, and vulnerability. To protect our community and our payment networks, all broadcasts must adhere to these criteria.
          </p>
        </header>

        {/* SECTION 1: WHAT WE CELEBRATE */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-primary/10">
            <Heart className="text-rose-500" size={20} />
            <h2 className="text-xl font-bold tracking-tight">1. What Belongs on the Billboard</h2>
          </div>
          <p className="text-sm text-secondary leading-relaxed">
            We built this stage so authentic thoughts can be heard. We believe in open expression and human authenticity:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-background-elevated/40 border border-primary/10 space-y-2">
              <div className="font-bold text-sm text-primary flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                Raw Emotion & Real Confessions
              </div>
              <p className="text-xs text-secondary leading-relaxed">
                Heartbreak, grief, unsent letters, personal milestones, and secret apologies. Natural profanity used in emotional venting is completely allowed.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-background-elevated/40 border border-primary/10 space-y-2">
              <div className="font-bold text-sm text-primary flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                Love, Proposals & Celebrations
              </div>
              <p className="text-xs text-secondary leading-relaxed">
                Wedding announcements, birthday wishes, love letters, community shoutouts, and personal victories shared with the world.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-background-elevated/40 border border-primary/10 space-y-2">
              <div className="font-bold text-sm text-primary flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                Art, Poetry & Philosophy
              </div>
              <p className="text-xs text-secondary leading-relaxed">
                Micro-fiction, original poetry, philosophical ponderings, and thought-provoking perspectives that make onlookers pause.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-background-elevated/40 border border-primary/10 space-y-2">
              <div className="font-bold text-sm text-primary flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                Brand & Launch Showcases
              </div>
              <p className="text-xs text-secondary leading-relaxed">
                Legitimate product launches, creative studio releases, and startup links submitted via verified sponsored slots.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: PROHIBITED CRITERIA */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-primary/10">
            <Ban className="text-rose-500" size={20} />
            <h2 className="text-xl font-bold tracking-tight">2. Strictly Prohibited Content Criteria</h2>
          </div>
          <p className="text-sm text-secondary leading-relaxed">
            Do not submit content falling under any of the following categories. Such submissions are blocked automatically or removed upon review:
          </p>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 text-xs text-secondary space-y-1">
              <span className="font-bold text-primary block text-sm">🚫 Hate Speech & Group Denigration</span>
              <span>Content promoting violence or using derogatory slurs targeting race, religion, nationality, disability, gender, or sexual orientation.</span>
            </div>

            <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 text-xs text-secondary space-y-1">
              <span className="font-bold text-primary block text-sm">🚫 Violent Threats, Doxxing & Targeted Harassment</span>
              <span>Direct threats of bodily harm, encouraging suicide, bomb threats, mass violence, or publishing non-public personal information (phone numbers, home addresses, private emails).</span>
            </div>

            <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 text-xs text-secondary space-y-1">
              <span className="font-bold text-primary block text-sm">🚫 Child Safety & Commercial NSFW Content</span>
              <span>Zero tolerance for child sexual abuse material (CSAM - immediately logged and reported to authorities), escort solicitations, or commercial pornography.</span>
            </div>

            <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 text-xs text-secondary space-y-1">
              <span className="font-bold text-primary block text-sm">🚫 Financial Scams & Crypto Phishing</span>
              <span>Wallet drainers, fake token giveaways, Ponzi schemes, fraudulent investment offers, or deceptive redirect links.</span>
            </div>

            <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 text-xs text-secondary space-y-1">
              <span className="font-bold text-primary block text-sm">🚫 Illegal Narcotics & Weapons</span>
              <span>Solicitation, sale, or distribution of illegal drugs, prescription medications without authorization, or unregistered weapons.</span>
            </div>

            <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 text-xs text-secondary space-y-1">
              <span className="font-bold text-primary block text-sm">🚫 Non-English Script Submissions</span>
              <span>All broadcasts must currently be submitted in the English language to enable automated compliance screening.</span>
            </div>
          </div>
        </section>

        {/* SECTION 3: STRICT NO-REFUND POLICY (HIGH VISIBILITY CALLOUT) */}
        <section className="rounded-3xl border-2 border-rose-500 bg-gradient-to-b from-rose-500/15 via-rose-500/5 to-background p-6 md:p-8 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shrink-0">
              <AlertOctagon size={26} />
            </div>
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Mandatory Legal Notice
              </span>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-primary">
                Strict No-Refund Policy for Policy Violations
              </h2>
            </div>
          </div>

          <div className="space-y-3 text-xs md:text-sm text-secondary leading-relaxed pt-2">
            <p>
              Every slot on Words of the World occupies finite, real-time global broadcast airtime. By submitting a message and proceeding through checkout, you explicitly agree to the following terms:
            </p>
            
            <div className="p-4 rounded-2xl bg-background/80 border border-rose-500/30 space-y-2">
              <div className="flex items-start gap-2.5">
                <span className="font-bold text-rose-500 shrink-0">•</span>
                <p>
                  <strong>Immediate Forfeiture of Payment:</strong> If your message is removed, canceled, or purged due to a violation of our User Guidelines or Content Policy, <strong>all fees, priority bids, or sponsorship payments paid are strictly non-refundable and permanently forfeited</strong>.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="font-bold text-rose-500 shrink-0">•</span>
                <p>
                  <strong>No Refund for Voluntary Cancellations Once Broadcasted:</strong> Once a message goes live or enters the confirmed schedule, the broadcast airtime has been consumed. No prorated or partial refunds will be granted.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="font-bold text-rose-500 shrink-0">•</span>
                <p>
                  <strong>Chargeback & Dispute Notice:</strong> Any attempt to file a fraudulent payment chargeback with your bank after deliberately submitting prohibited content will be contested using our cryptographically signed pre-submission agreement and database audit logs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: HOW TO REPORT */}
        <section className="space-y-4 rounded-2xl border border-primary/15 bg-background-elevated/40 p-6 md:p-8">
          <div className="flex items-center gap-2">
            <Mail className="text-primary" size={20} />
            <h2 className="text-lg font-bold">4. Reporting a Violation</h2>
          </div>
          <p className="text-xs md:text-sm text-secondary leading-relaxed">
            If you see any broadcast that violates these criteria, click the <strong>Flag icon (⚑)</strong> located on the bottom right of any message card. This triggers an expedited alert directly to our 24/7 human moderation team.
          </p>
          <p className="text-xs text-secondary">
            For urgent legal or law enforcement inquiries, email:{' '}
            <a 
              href="mailto:wordsoftheworld.lol@gmail.com?subject=[URGENT%20Guideline%20Inquiry]" 
              className="text-primary font-mono font-bold underline"
            >
              wordsoftheworld.lol@gmail.com
            </a>
          </p>
        </section>

        {/* Footer Navigation */}
        <div className="pt-6 border-t border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-secondary">
            © 2026 Words of the World • All broadcasts monitored
          </span>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/" className="hover:text-primary transition-colors">Billboard</Link>
            <Link href="/content-policy" className="hover:text-primary transition-colors">Content Policy</Link>
            <Link href="/create" className="hover:text-primary transition-colors">Leave Message</Link>
          </div>
        </div>

      </div>
    </div>
  )
}
