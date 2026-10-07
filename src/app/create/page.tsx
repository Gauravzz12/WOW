"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Zap, CheckCircle2, Sparkles, ExternalLink, Globe, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createMessage } from "./actions";
import { createClient } from '@/lib/supabase/client'
import { sanitizeHtmlText } from '@/lib/sanitize'
import { getCategoryStyles, resolveCardStyles, resolveThemeSafeTextColor } from '@/lib/utils/colors'
import { FrameDecorator } from '@/components/FrameDecorator'
import { getFrameClass } from '@/lib/constants/frames'
import { ThemeToggle } from '@/components/ThemeToggle'
import { toast } from '@/components/Toast'
import dynamic from 'next/dynamic'

// Dynamically import heavy components to speed up initial page load
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor').then(mod => mod.RichTextEditor), { 
  ssr: false, 
  loading: () => <div className="h-64 w-full flex items-center justify-center bg-background-elevated animate-pulse rounded-lg text-secondary text-sm">Loading Editor...</div> 
})
const StickerPicker = dynamic(() => import('@/components/StickerPicker').then(mod => mod.StickerPicker), { ssr: false })
const FramePicker = dynamic(() => import('@/components/FramePicker').then(mod => mod.FramePicker), { ssr: false })
const SlotPicker = dynamic(() => import('@/components/SlotPicker').then(mod => mod.SlotPicker), { ssr: false })

import type { Sticker } from '@/components/StickerPicker'
import type { Slot } from '@/components/SlotPicker'

import { 
  NORMAL_DURATION_OPTIONS, 
  calculateNormalMinBid, 
  BASE_NORMAL_MINS, 
  MAX_NORMAL_MINS,
  EXTENSION_STEP_MINS,
  SPECIAL_SLOT_PRICE,
  calculateSpecialPrice,
  SPONSORED_PRICE,
  SPONSORED_DURATION_SECS,
} from '@/lib/constants/pricing';

import {
  ALL_TEMPLATES,
  STANDARD_TEMPLATES,
  CATEGORY_METADATA,
  Template
} from '@/lib/constants/templates';

const CATEGORY_DUMMY_MESSAGES: Record<string, string> = {
  promotion: "Introducing something built with obsession. Built for those who dare to dream.",
  celebration: "Wishing the happiest 25th Birthday to my favorite human! May this year bring endless magic.",
  love: "To the love of my life: wherever the world takes us, you will always be my greatest adventure.",
  confession: "Nobody in my life knows this, but I quit my job today and I've never felt more alive.",
  gratitude: "Thank you for holding my hand when medicine and words weren't enough.",
  announcement: "Attention world: Today marks a new chapter for our global community.",
  rant: "Can we please normalize saying 'I don't have the energy for this right now' without feeling guilty?",
  general: "Peace is greater than being right. Do not fear starting over.",
}

function CreateMessageContent() {
  // Steps: 1=Category, 2=Write, 3=Template+Identity, 4=Bidding, 5=Preview
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [category, setCategory] = useState("general");
  const [template, setTemplate] = useState("a");
  const [templatePage, setTemplatePage] = useState(0);
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const [queueBids, setQueueBids] = useState<number[]>([]);
  const [normalDuration, setNormalDuration] = useState(60);
  const [messageHtml, setMessageHtml] = useState("");
  const [messageText, setMessageText] = useState("");
  const [identityType, setIdentityType] = useState("anonymous");
  const [customName, setCustomName] = useState("");
  const [recipient, setRecipient] = useState("");
  const [brandName, setBrandName] = useState("");
  const [brandUrl, setBrandUrl] = useState("");
  const [wantsReminder, setWantsReminder] = useState(false);
  const [reminderEmail, setReminderEmail] = useState("");
  const searchParams = useSearchParams();
  const tierParam = searchParams?.get('tier');
  const slotParam = searchParams?.get('slot');
  const prefillParam = searchParams?.get('prefill');

  const [bidAmount, setBidAmount] = useState(15);
  // Delivery tier: Normal (bid queue) · Special (reserved slots) · Sponsored ($3 grid)
  const [tier, setTier] = useState<'normal' | 'special' | 'sponsored'>('normal');
  const isReserved = tier === 'special';
  const isSponsored = tier === 'sponsored';
  const [selectedSpecialSlots, setSelectedSpecialSlots] = useState<Slot[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (prefillParam && !messageText) {
      // Strip any markup: prefill lands in dangerouslySetInnerHTML preview,
      // so raw ?prefill=<img onerror=...> must never reach the DOM.
      const safePrefill = prefillParam.replace(/<[^>]*>/g, '');
      setMessageHtml(`<p>${safePrefill}</p>`);
      setMessageText(safePrefill);
    }
  }, [prefillParam, messageText]);

  useEffect(() => {
    if (tierParam === 'special' || slotParam) {
      setTier('special');
    } else if (tierParam === 'sponsored') {
      setTier('sponsored');
    }
  }, [tierParam, slotParam]);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [frameId, setFrameId] = useState<string | null>(null);
  const previewCardRef = useRef<HTMLDivElement>(null);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [isDraggingSticker, setIsDraggingSticker] = useState(false);

  const handleStickerPointerDown = (e: React.PointerEvent, sticker: Sticker) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedStickerId(sticker.id);
    setIsDraggingSticker(true);

    const card = previewCardRef.current;
    if (!card) return;

    const cardRect = card.getBoundingClientRect();
    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startPercentX = sticker.x;
    const startPercentY = sticker.y;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startClientX;
      const deltaY = moveEvent.clientY - startClientY;

      // Convert pixel movement to card dimension percentage
      const deltaPercentX = (deltaX / cardRect.width) * 100;
      const deltaPercentY = (deltaY / cardRect.height) * 100;

      const newX = Math.max(6, Math.min(94, Math.round((startPercentX + deltaPercentX) * 10) / 10));
      const newY = Math.max(8, Math.min(92, Math.round((startPercentY + deltaPercentY) * 10) / 10));

      setStickers((prev) =>
        prev.map((s) => (s.id === sticker.id ? { ...s, x: newX, y: newY } : s))
      );
    };

    const handlePointerUp = () => {
      setIsDraggingSticker(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleStretchPointerDown = (e: React.PointerEvent, sticker: Sticker) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedStickerId(sticker.id);

    const card = previewCardRef.current;
    if (!card) return;

    const cardRect = card.getBoundingClientRect();
    const centerX = cardRect.left + (sticker.x / 100) * cardRect.width;
    const centerY = cardRect.top + (sticker.y / 100) * cardRect.height;

    const startDist = Math.max(15, Math.hypot(e.clientX - centerX, e.clientY - centerY));
    const startSize = sticker.size || 3.5;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      const currentDist = Math.hypot(moveEvent.clientX - centerX, moveEvent.clientY - centerY);
      const ratio = currentDist / startDist;
      const newSize = Math.max(1.5, Math.min(8.5, Math.round(startSize * ratio * 10) / 10));

      setStickers((prev) =>
        prev.map((s) => (s.id === sticker.id ? { ...s, size: newSize } : s))
      );
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const router = useRouter();
  const supabase = useRef(createClient()).current;

  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase.from('categories').select('*').eq('status', 'ACTIVE').order('name');
      if (data && data.length > 0) {
        setCategories(data);
        setCategory(data[0].slug);
      }
      setCategoriesLoading(false);
    }
    loadCategories();
  }, []);

  useEffect(() => {
    if (step === 4) {
      const loadBids = async () => {
        const { data } = await supabase
          .from('messages')
          .select('bid_amount')
          .eq('status', 'QUEUED')
          .eq('is_reserved_slot', false)
          .gte('bid_amount', 10);
        if (data) {
          setQueueBids(data.map(d => d.bid_amount || 0).sort((a, b) => b - a));
        }
      };
      loadBids();

      const channel = supabase.channel('create_step4_bids')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
          loadBids();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [step]);

  // Minimum bid is derived from 1 hour base + 10-minute extensions (+$5/10m)
  const minBid = calculateNormalMinBid(normalDuration);

  const selectedTemplate = ALL_TEMPLATES.find(t => t.id === template) || STANDARD_TEMPLATES[0];
  const cardStyles = resolveCardStyles({
    bg: selectedTemplate.bg,
    textColor: selectedTemplate.textColor,
    cardBorder: selectedTemplate.cardBorder,
    isVip: selectedTemplate.isVip || false,
  }, selectedTemplate.id);
  const categoryMeta = CATEGORY_METADATA[category] || CATEGORY_METADATA.general;
  const dummyMessage = CATEGORY_DUMMY_MESSAGES[category] || CATEGORY_DUMMY_MESSAGES.general;
  const { bgClass: catBg, borderClass: catBorder, accentClass: catColor, badgeClass } = getCategoryStyles(category);

  const handleSelectTemplate = (t: Template) => {
    setTemplate(t.id);
    if (t.isVip) {
      // Suggest / unlock special slot automatically when picking a VIP template
      setTier('special');
    }
  };

  const handleApplyStarter = (starterText: string) => {
    const formatted = `<p>${starterText} </p>`;
    setMessageHtml(formatted);
    setMessageText(starterText + ' ');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const specialPricing = isReserved && selectedSpecialSlots.length > 0 
      ? calculateSpecialPrice(selectedSpecialSlots.length) 
      : { finalPrice: SPECIAL_SLOT_PRICE, originalPrice: SPECIAL_SLOT_PRICE };

    const result = await createMessage({
      categorySlug: category,
      templateId: template,
      content: messageText,
      identityType,
      customName,
      recipient,
      bidAmount: isSponsored ? SPONSORED_PRICE : isReserved ? specialPricing.finalPrice : Math.max(bidAmount, minBid),
      isReservedSlot: isReserved,
      isSponsored,
      styleConfig: JSON.stringify({ 
        html: messageHtml,
        bg: cardStyles.bg,
        font: selectedTemplate.font,
        textColor: cardStyles.textColor,
        isVip: selectedTemplate.isVip || false,
        vipBadge: selectedTemplate.vipBadge || undefined,
        vipIcon: selectedTemplate.vipIcon || undefined,
        cardBorder: cardStyles.cardBorder || undefined,
        accent: selectedTemplate.accent || undefined,
        brandName: brandName.trim().slice(0, 40) || undefined,
        brandUrl: brandUrl.trim() || undefined,
        isSponsored: isSponsored || undefined,
        durationSecs: isSponsored
          ? SPONSORED_DURATION_SECS
          : isReserved 
          ? (selectedSpecialSlots.length > 0 ? selectedSpecialSlots.length * 10800 : 10800) 
          : normalDuration * 60,
        slotCount: isReserved ? (selectedSpecialSlots.length || 1) : undefined,
        slotIds: isReserved && selectedSpecialSlots.length > 0 ? selectedSpecialSlots.map(s => s.id) : undefined,
        selectedSlots: isReserved && selectedSpecialSlots.length > 0 ? selectedSpecialSlots : undefined,
        reminderEmail: wantsReminder ? reminderEmail : undefined,
        // Stickers are disabled for Sponsored messages — never persist any.
        stickers: !isSponsored && stickers.length > 0 ? stickers : undefined,
        frameId: !isSponsored && frameId ? frameId : undefined,
      }),
    });

    setIsSubmitting(false);

    if (result.error) {
      toast.error(result.error, { title: 'Submission Error' });
    } else if (isSponsored) {
      // Sponsored messages have no pay-and-broadcast: they sit in the Waiting
      // Room (PENDING_PAYMENT) until someone else sponsors them for $3.
      toast.success('Your message is now in the Waiting Room! It will broadcast worldwide once someone sponsors it for $3.', {
        title: 'Message Queued'
      });
      window.location.href = '/waiting-room';
    } else {
      const slotQuery = isReserved && selectedSpecialSlots.length > 0 
        ? `?slots=${selectedSpecialSlots.map(s => s.id).join(',')}` 
        : '';
      window.location.href = `/checkout/${result.messageId}${slotQuery}`;
    }
  };

  const selectedCategory = categories.find(c => c.slug === category) || { name: categoryMeta.badgeLabel, slug: category };

  const handleNext = () => { if (step < 5) setStep(step + 1); };
  const handleBack = () => { if (step > 1) setStep(step - 1); };

  return (
    <main className="min-h-screen bg-background text-primary flex flex-col items-center">
      
      {/* Header */}
      <header className="w-full max-w-2xl flex items-center justify-between p-6 z-20 sticky top-0 bg-background/80 backdrop-blur-md">
        {step === 1 ? (
          <Link href="/">
            <button className="flex items-center gap-2 text-secondary hover:text-primary transition-colors">
              <ArrowLeft size={18} /> <span className="text-sm font-medium">Back to World</span>
            </button>
          </Link>
        ) : (
          <button onClick={handleBack} className="flex items-center gap-2 text-secondary hover:text-primary transition-colors">
            <ArrowLeft size={18} /> <span className="text-sm font-medium">Back</span>
          </button>
        )}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${step >= i ? 'bg-primary scale-110' : 'bg-background-elevated'}`} />
            ))}
          </div>
        </div>
      </header>

      <div className={`w-full ${step === 5 ? 'max-w-4xl' : 'max-w-2xl'} flex-1 flex flex-col p-6 z-10`}>
        <AnimatePresence mode="wait">
          
          {/* STEP 1: CATEGORY SELECTION */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
              <div className="mb-6">
                <span className="text-xs uppercase tracking-widest font-bold text-secondary">Step 1 of 5</span>
                <h2 className="text-2xl sm:text-3xl font-serif mt-1 mb-2">What is the nature of your message?</h2>
                <p className="text-secondary text-sm">Choose the category that best describes your broadcast. Your styling, inspiration, and stage presence will adapt to match.</p>
              </div>
              
              {categoriesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="w-full h-24 rounded-2xl border border-background-elevated bg-background-elevated/50 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
                  {categories.map(cat => {
                    const meta = CATEGORY_METADATA[cat.slug] || CATEGORY_METADATA.general;
                    const { bgClass, borderClass, accentClass } = getCategoryStyles(cat.slug);
                    const isSelected = category === cat.slug;

                    return (
                      <button 
                        key={cat.id}
                        type="button"
                        onClick={() => { 
                          setCategory(cat.slug); 
                          handleNext(); 
                        }}
                        className={`group relative text-left p-4 rounded-2xl border transition-all duration-200 active:scale-[0.98] flex flex-col justify-between overflow-hidden ${
                          isSelected 
                            ? `${bgClass} ${borderClass} ring-2 ring-primary/40 shadow-md` 
                            : 'border-background-elevated hover:border-secondary/40 bg-background-muted hover:bg-background-elevated/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl select-none" role="img" aria-label={cat.name}>
                              {meta.icon}
                            </span>
                            <div>
                              <span className={`text-base font-semibold block transition-colors ${isSelected ? accentClass : 'text-primary'}`}>
                                {cat.name}
                              </span>
                              <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">
                                {cat.slug === 'promotion' ? 'Brand & Showcase' : cat.slug === 'celebration' ? 'Birthdays & Gala' : cat.slug === 'love' ? 'Romantic' : 'Global'}
                              </span>
                            </div>
                          </div>
                          
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-primary text-background flex items-center justify-center shadow-sm">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>

                        {(cat.description || meta.tagline) && (
                          <p className="text-xs text-secondary line-clamp-2 leading-relaxed">
                            {cat.description || meta.tagline}
                          </p>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 2: WRITE MESSAGE & CATEGORY IMPACT */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
              {/* Category Impact Banner */}
              <div className={`p-4 rounded-2xl border ${catBorder} bg-gradient-to-r ${categoryMeta.gradientAccent} mb-6 flex items-start gap-3.5 shadow-sm`}>
                <span className="text-3xl select-none shrink-0 mt-0.5">{categoryMeta.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs uppercase tracking-widest font-bold ${catColor}`}>
                      {categoryMeta.badgeLabel}
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setStep(1)}
                      className="text-[11px] underline opacity-70 hover:opacity-100 text-secondary"
                    >
                      Change
                    </button>
                  </div>
                  <p className="text-xs text-secondary mt-0.5 leading-relaxed">
                    {categoryMeta.tagline}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-serif">Write your words.</h2>
                <span className="text-xs text-secondary font-mono">Max 150 words</span>
              </div>

              {/* Inspiration Sentence Starters */}
              <div className="mb-4">
                <div className="flex items-center gap-1.5 text-xs text-secondary mb-2 font-medium">
                  <Sparkles size={13} className="text-amber-500" />
                  <span>Tap an opening starter to begin:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categoryMeta.starters.map((starter, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleApplyStarter(starter)}
                      className="text-xs text-left px-3 py-1.5 rounded-full border border-primary/10 hover:border-primary/30 bg-background-elevated/40 hover:bg-background-elevated text-secondary hover:text-primary transition-all active:scale-95"
                    >
                      &ldquo;{starter.length > 45 ? starter.slice(0, 45) + '…' : starter}&rdquo;
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex-1 flex flex-col gap-4">
                <RichTextEditor 
                  value={messageHtml}
                  onChange={(html) => {
                    setMessageHtml(html)
                    const temp = document.createElement('div')
                    temp.innerHTML = html
                    setMessageText(temp.textContent || '')
                  }}
                />

                {/* Category-Tailored Fields */}
                {category === 'promotion' ? (
                  <div className="p-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 space-y-3">
                    <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold text-xs uppercase tracking-wider">
                      <Globe size={14} />
                      <span>Brand / Launch Details</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-secondary block mb-1">Brand or Project Name</label>
                        <input 
                          type="text" 
                          value={brandName}
                          onChange={e => setBrandName(e.target.value)}
                          placeholder="e.g. Apex Studio"
                          maxLength={40}
                          className="w-full bg-background border border-background-elevated rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-secondary block mb-1">Website / Showcase Link</label>
                        <input 
                          type="url" 
                          value={brandUrl}
                          onChange={e => setBrandUrl(e.target.value)}
                          placeholder="https://yourproject.com"
                          className="w-full bg-background border border-background-elevated rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    {(brandName || brandUrl) && (
                      <div className="pt-1 flex items-center gap-2 text-xs text-cyan-700 dark:text-cyan-300">
                        <span className="font-semibold">Interactive Button Preview:</span>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-[11px] font-bold">
                          {brandName || 'Open Link'} <ExternalLink size={10} />
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-secondary">
                      {category === 'celebration' 
                        ? 'Who is celebrating? (e.g. Maya, Grandma, Our Class)' 
                        : category === 'love' 
                        ? 'Who is this love letter for? (e.g. Emma, My Soulmate, Alex)' 
                        : 'Who is this for? (Optional)'}
                    </label>
                    <input 
                      type="text" 
                      value={recipient}
                      onChange={e => setRecipient(e.target.value)}
                      placeholder={category === 'celebration' ? 'e.g. Maya (25th Birthday)' : 'e.g. Emma, Mom, The World'}
                      className="w-full bg-background-muted border border-background-elevated rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-secondary"
                    />
                  </div>
                )}

                {/* Optional link — every category. Shown centered on its own
                    line right after the message on the live card. */}
                {category !== 'promotion' && (
                  <div className="p-4 rounded-2xl border border-background-elevated bg-background-muted/40 space-y-3">
                    <div className="flex items-center gap-2 text-secondary font-bold text-xs uppercase tracking-wider">
                      <Globe size={14} />
                      <span>Link (optional)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-secondary block mb-1">Link label (max 40 chars)</label>
                        <input 
                          type="text" 
                          value={brandName}
                          onChange={e => setBrandName(e.target.value)}
                          placeholder="e.g. Our photos, Donate here"
                          maxLength={40}
                          className="w-full bg-background border border-background-elevated rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-secondary"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-secondary block mb-1">Link URL</label>
                        <input 
                          type="url" 
                          value={brandUrl}
                          onChange={e => setBrandUrl(e.target.value)}
                          placeholder="https://example.com/your-page"
                          className="w-full bg-background border border-background-elevated rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-secondary"
                        />
                      </div>
                    </div>

                    {(brandName || brandUrl) && (
                      <div className="pt-1 flex items-center gap-2 text-xs text-secondary">
                        <span className="font-semibold">Button preview:</span>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-700 dark:text-cyan-300 text-[11px] font-bold">
                          {brandName || 'Open Link'} <ExternalLink size={10} />
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="reminderCheck"
                      checked={wantsReminder}
                      onChange={e => setWantsReminder(e.target.checked)}
                      className="w-5 h-5 rounded border-background-elevated bg-background-muted text-primary focus:ring-primary focus:ring-offset-background"
                    />
                    <label htmlFor="reminderCheck" className="text-sm font-medium text-secondary cursor-pointer">
                      Remind me when this goes live
                    </label>
                  </div>
                  
                  {wantsReminder && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <input 
                        type="email" 
                        value={reminderEmail}
                        onChange={e => setReminderEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full bg-background-muted border border-background-elevated rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-secondary"
                      />
                    </motion.div>
                  )}
                </div>
              </div>

              {(() => {
                const words = messageText.trim().length > 0 ? messageText.trim().split(/\s+/).length : 0
                return (
                  <>
                    {words > 150 && (
                      <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
                        <span>Please shorten your message — maximum 150 words allowed.</span>
                        <span className="font-mono font-bold">{words} / 150 words</span>
                      </div>
                    )}

                    <button 
                      disabled={messageText.trim().length === 0 || words > 150}
                      onClick={handleNext}
                      className="w-full py-4 mt-6 bg-primary text-background rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    >
                      {words > 150 ? `Too long (${words}/150 words) — Please shorten` : 'Choose a Style & Template'}
                    </button>
                  </>
                )
              })()}
            </motion.div>
          )}

          {/* STEP 3: TEMPLATES (CLASSIC) */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
              <div className="mb-6">
                <span className="text-xs uppercase tracking-widest font-bold text-secondary">Step 3 of 5</span>
                <h2 className="text-2xl sm:text-3xl font-serif mt-1 mb-2">Select Your Visual Style</h2>
                <p className="text-secondary text-sm">Pick a classic style.</p>
              </div>

              {/* CLASSIC EDITORIAL TEMPLATES */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-secondary">
                    Classic Editorial Styles
                  </h3>
                  <button
                    type="button"
                    onClick={() => setTemplatePage(p => (p + 1) % Math.ceil(STANDARD_TEMPLATES.length / 6))}
                    className="text-xs font-semibold text-primary hover:text-primary/70 bg-background-elevated px-2.5 py-1 rounded-full transition-colors flex items-center gap-1.5 shadow-sm border border-primary/10"
                  >
                    More Templates
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 22v-6h6"/></svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {STANDARD_TEMPLATES.slice(templatePage * 6, (templatePage + 1) * 6).map(t => {
                    const isSelected = template === t.id;
                    const tStyles = resolveCardStyles({ bg: t.bg, textColor: t.textColor, cardBorder: t.cardBorder, isVip: false }, t.id);
                    return (
                      <button 
                        key={t.id}
                        type="button"
                        onClick={() => handleSelectTemplate(t)}
                        className="group flex flex-col gap-2 text-left focus:outline-none"
                      >
                        <div 
                          className={`w-full aspect-[4/3] rounded-2xl p-4 flex flex-col justify-center items-center relative overflow-hidden transition-all duration-200 ${tStyles.bg} ${
                            isSelected 
                              ? 'ring-2 ring-primary shadow-lg border-transparent scale-[1.02]' 
                              : `${tStyles.cardBorder || 'border border-primary/10 hover:border-primary/30'} shadow-sm hover:shadow`
                          }`}
                        >
                          {/* Accent stripe */}
                          {t.accent && (
                            <div className={`absolute top-0 left-0 right-0 h-1 ${t.accent}`} />
                          )}

                          {isSelected && (
                            <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-primary text-background flex items-center justify-center shadow-md">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}

                          <p 
                            className={`text-xs sm:text-sm leading-relaxed text-center line-clamp-3 font-medium select-none ${t.font} ${tStyles.textColor}`}
                            style={{ color: tStyles.inlineColor !== 'inherit' ? tStyles.inlineColor : undefined }}
                          >
                            &ldquo;{dummyMessage}&rdquo;
                          </p>
                        </div>

                        <div className="flex items-center justify-between px-1">
                          <span className={`text-xs font-medium transition-colors ${isSelected ? 'text-primary font-bold' : 'text-secondary group-hover:text-primary'}`}>
                            {t.name}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] uppercase font-bold tracking-wider text-primary">Selected</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Identity Sign-off */}
              <h2 className="text-lg font-serif mb-3">How will you sign it?</h2>
              <div className="space-y-3 mb-8">
                <label className="flex items-center gap-3 p-4 rounded-xl border border-background-elevated cursor-pointer hover:bg-background-muted">
                  <input type="radio" name="identity" checked={identityType === 'anonymous'} onChange={() => setIdentityType('anonymous')} className="accent-primary w-4 h-4" />
                  <span className="font-medium text-sm">Anonymous</span>
                </label>
                <label className="flex items-center gap-3 p-4 rounded-xl border border-background-elevated cursor-pointer hover:bg-background-muted">
                  <input type="radio" name="identity" checked={identityType === 'custom'} onChange={() => setIdentityType('custom')} className="accent-primary w-4 h-4" />
                  <div className="flex-1">
                    <span className="font-medium text-sm block mb-1">Custom Signature</span>
                    {identityType === 'custom' && (
                      <input 
                        type="text" 
                        value={customName}
                        onChange={e => setCustomName(e.target.value)}
                        placeholder="e.g. A friend in New York"
                        className="w-full bg-background border border-background-elevated rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-secondary"
                      />
                    )}
                  </div>
                </label>
              </div>

              <button 
                onClick={handleNext}
                className="w-full py-4 mt-auto bg-primary text-background rounded-full font-medium"
              >
                Choose Delivery Options
              </button>
            </motion.div>
          )}

          {/* STEP 4: DELIVERY & DURATION */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
              <div className="mb-6">
                <span className="text-xs uppercase tracking-widest font-bold text-secondary">Step 4 of 5</span>
                <h2 className="text-2xl sm:text-3xl font-serif mt-1 mb-2">Queue Priority &amp; Delivery</h2>
                <p className="text-secondary text-sm">Choose how soon and for how long your message commands the world stage.</p>
              </div>
              
              <div className="space-y-6 mb-8">
                {/* Standard Queue Option */}
                <label className={`block p-6 rounded-2xl border cursor-pointer transition-all ${tier === 'normal' ? 'border-primary bg-background-elevated ring-1 ring-primary/30' : 'border-background-elevated hover:border-secondary/50'}`}>
                  <div className="flex items-start gap-4">
                    <input type="radio" checked={tier === 'normal'} onChange={() => setTier('normal')} className="mt-1 accent-primary w-4 h-4" />
                    <div className="flex-1">
                      <h3 className="text-lg font-medium">Standard Queue</h3>
                      <p className="text-sm text-secondary mt-1 mb-4">Enter the main queue. Bump up your priority by outbidding others.</p>
                      
                      {tier === 'normal' && (
                        <div className="flex flex-col gap-4 bg-background p-4 rounded-xl border border-background-elevated">
                          <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center text-xs">
                              <div>
                                <span className="font-bold uppercase tracking-wider text-primary">Airtime Duration</span>
                                <p className="text-[11px] text-secondary">Base 1 hour • Extend up to 2 hours (+$5 per 10 mins)</p>
                              </div>
                              <span className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded">
                                Min Bid: ${minBid}
                              </span>
                            </div>

                            {/* 10-Minute Increment Pills */}
                            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                              {NORMAL_DURATION_OPTIONS.map(opt => {
                                const isSelected = normalDuration === opt.mins;
                                return (
                                  <button
                                    key={opt.mins}
                                    type="button"
                                    onClick={() => {
                                      setNormalDuration(opt.mins);
                                      setBidAmount(prev => Math.max(prev, opt.minBid));
                                    }}
                                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                                      isSelected 
                                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-900 dark:text-emerald-200 shadow-sm ring-1 ring-emerald-500/40 font-bold' 
                                        : 'border-primary/10 hover:border-primary/25 bg-background-elevated/40 text-primary'
                                    }`}
                                  >
                                    <span className="text-xs font-bold">{opt.label}</span>
                                    <span className="text-[10px] font-mono text-secondary mt-0.5">${opt.minBid}</span>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Granular Stepper & Duration Summary */}
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-background-elevated/60 border border-primary/10 text-xs">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  disabled={normalDuration <= BASE_NORMAL_MINS}
                                  onClick={() => {
                                    const next = Math.max(BASE_NORMAL_MINS, normalDuration - EXTENSION_STEP_MINS);
                                    setNormalDuration(next);
                                    setBidAmount(prev => Math.max(prev, calculateNormalMinBid(next)));
                                  }}
                                  className="w-7 h-7 rounded-lg border border-primary/15 bg-background flex items-center justify-center font-bold text-sm hover:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                  -
                                </button>
                                <span className="font-semibold text-primary">
                                  {Math.floor(normalDuration / 60)}h {normalDuration % 60 > 0 ? `${normalDuration % 60}m` : ''} ({normalDuration} mins)
                                </span>
                                <button
                                  type="button"
                                  disabled={normalDuration >= MAX_NORMAL_MINS}
                                  onClick={() => {
                                    const next = Math.min(MAX_NORMAL_MINS, normalDuration + EXTENSION_STEP_MINS);
                                    setNormalDuration(next);
                                    setBidAmount(prev => Math.max(prev, calculateNormalMinBid(next)));
                                  }}
                                  className="w-7 h-7 rounded-lg border border-primary/15 bg-background flex items-center justify-center font-bold text-sm hover:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                  +
                                </button>
                              </div>

                              <span className="text-[11px] text-secondary">
                                {normalDuration === 60 ? 'Base 1-hour broadcast' : `+${normalDuration - 60}m extension (+$${(normalDuration - 60) / 10 * 5})`}
                              </span>
                            </div>
                          </div>

                          {/* Bid Input & 1-Click Outbid Button */}
                          <div className="flex flex-col gap-3 pt-3 border-t border-background-elevated">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Your Priority Bid:</span>
                              <div className="flex items-center bg-emerald-600 text-white rounded-lg px-3 py-1 shadow-sm">
                                <span className="text-xl font-serif font-bold">$</span>
                                <input 
                                  type="number" 
                                  min={minBid}
                                  value={bidAmount}
                                  onChange={(e) => setBidAmount(Math.max(Number(e.target.value), minBid))}
                                  onBlur={(e) => setBidAmount(Math.max(Number(e.target.value), minBid))}
                                  className="w-20 bg-transparent text-xl font-bold font-serif focus:outline-none text-white appearance-none"
                                />
                              </div>
                            </div>

                            {/* 1-Click #1 Priority Button */}
                            {(() => {
                              const highestBid = queueBids.length > 0 ? Math.max(...queueBids) : 0;
                              const isOutbid = highestBid >= bidAmount;
                              if (isOutbid) {
                                return (
                                  <button
                                    type="button"
                                    onClick={() => setBidAmount(Math.max(highestBid + 1, minBid))}
                                    className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                                  >
                                    <Zap size={14} />
                                    <span>Take #1 Position in Queue (Bid ${highestBid + 1})</span>
                                  </button>
                                );
                              }
                              return (
                                <div className="p-2 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                                  <span className="flex items-center gap-1.5 font-semibold">
                                    <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" />
                                    <span>Highest Bid (Rank #1)</span>
                                  </span>
                                  <span className="font-mono font-bold">${bidAmount}</span>
                                </div>
                              );
                            })()}
                          </div>
                          
                          <div className="text-xs text-secondary flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="font-medium text-secondary/80">Top bids in queue: </span>
                            {queueBids.length > 0 ? (
                              queueBids.slice(0, 5).map((b, idx) => (
                                <span 
                                  key={idx} 
                                  className="inline-flex items-center font-mono font-bold text-xs bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-600/25 dark:border-emerald-500/30 px-2 py-0.5 rounded-md shadow-xs"
                                >
                                  ${b}
                                </span>
                              ))
                            ) : (
                              <span className="italic text-secondary/60">None — be the first!</span>
                            )}
                            {queueBids.length > 5 && <span className="ml-1 opacity-60 text-[11px]">+{queueBids.length - 5} more</span>}
                          </div>
                          <div className="text-xs font-medium text-primary bg-primary/5 p-3 rounded-lg border border-primary/10 flex items-center justify-between">
                            <span>Selected Duration: {Math.floor(normalDuration / 60)}h {normalDuration % 60 > 0 ? `${normalDuration % 60}m` : ''}</span>
                            <span className="font-bold">Estimated Rank: #{queueBids.filter(b => b >= bidAmount).length + 1}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </label>

                {/* ✦ Special option */}
                <label className={`block p-6 rounded-2xl border cursor-pointer transition-all ${tier === 'special' ? 'border-violet-500/60 bg-violet-500/[0.06] ring-2 ring-violet-500/25 shadow-sm' : 'border-background-elevated hover:border-violet-500/40'}`}>
                  <div className="flex items-start gap-4">
                    <input type="radio" checked={tier === 'special'} onChange={() => setTier('special')} className="mt-1 accent-violet-600 w-4 h-4" />
                    <div className="w-full">
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-medium text-violet-700 dark:text-violet-300">
                            ✦ Special — 3 hours, your time
                          </h3>
                          {selectedTemplate.isVip && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-700 dark:text-violet-200 font-bold border border-violet-500/30">
                              Matches your design
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-400/15 border border-amber-400/40 px-2.5 py-1 rounded-lg font-mono shadow-sm">
                          $30 / slot
                        </span>
                      </div>
                      
                      <p className="text-sm text-secondary mt-1">
                        Lock in 3 full hours. No bidding, no interruptions. Book up to 9 hours and save 20%.
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-violet-500/20 text-xs text-violet-700 dark:text-violet-300">
                        <span className="font-semibold">✨ Save 20% on 2–3 slots together</span>
                        <span>•</span>
                        <span>Up to 9 hours</span>
                        <span>•</span>
                        <span>Premium glow + share page forever</span>
                      </div>

                      {tier === 'special' && (
                        <div className="mt-5 pt-4 border-t border-violet-500/20" onClick={(e) => e.stopPropagation()}>
                          <div className="mb-3">
                            <span className="text-xs font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider block">
                              Pick your time (8 slots a day, can span consecutive days):
                            </span>
                            <p className="text-[11px] text-secondary mt-0.5">
                              All times auto-show in your timezone.
                            </p>
                          </div>
                          <SlotPicker
                            onSelect={(slots) => {
                              setSelectedSpecialSlots(slots);
                              if (slots.length > 0) {
                                const pricing = calculateSpecialPrice(slots.length);
                                setBidAmount(pricing.finalPrice);
                              } else {
                                setBidAmount(SPECIAL_SLOT_PRICE);
                              }
                            }}
                            selectedSlotIds={selectedSpecialSlots.map(s => s.id)}
                            initialSlotNumber={slotParam ? parseInt(slotParam, 10) : undefined}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </label>

                {/* ♥ Sponsored option — free post, waits for a $3 community sponsor */}
                <label className={`block p-6 rounded-2xl border cursor-pointer transition-all ${tier === 'sponsored' ? 'border-blue-500/60 bg-blue-500/[0.06] ring-2 ring-blue-500/25 shadow-sm' : 'border-background-elevated hover:border-blue-500/40'}`}>
                  <div className="flex items-start gap-4">
                    <input type="radio" checked={tier === 'sponsored'} onChange={() => setTier('sponsored')} className="mt-1 accent-blue-600 w-4 h-4" />
                    <div className="w-full">
                      <div className="flex justify-between items-center w-full">
                        <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300">
                          ♥ Sponsored — free, backed by the community
                        </h3>
                        <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-500/15 border border-blue-500/40 px-2.5 py-1 rounded-lg font-mono shadow-sm">
                          Free to post
                        </span>
                      </div>

                      <p className="text-sm text-secondary mt-1">
                        Post for free into the Waiting Room. Your message broadcasts for 30 minutes once someone sponsors it for $3.
                      </p>

                      <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-blue-500/20 text-xs text-blue-700 dark:text-blue-300">
                        <span className="font-semibold">✨ No pay-and-broadcast</span>
                        <span>•</span>
                        <span>Waits until sponsored</span>
                        <span>•</span>
                        <span>No stickers on sponsored cards</span>
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              {tier === 'special' && selectedSpecialSlots.length === 0 && (
                <div className="mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-300 text-xs text-center font-medium">
                  Please pick at least 1 time slot above before continuing.
                </div>
              )}

              <button 
                disabled={tier === 'special' && selectedSpecialSlots.length === 0}
                onClick={handleNext}
                className="w-full py-4 mt-auto bg-primary text-background rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {tier === 'special' && selectedSpecialSlots.length === 0 ? 'Select a Time Slot to Continue' : tier === 'sponsored' ? 'Preview Sponsored Message' : 'Preview Final Message'}
              </button>
            </motion.div>
          )}

          {/* STEP 5: PREVIEW & STICKER CANVAS */}
          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center h-full pt-4">
              <div className="text-center mb-6">
                <span className="text-xs uppercase tracking-widest font-bold text-secondary">Step 5 of 5</span>
                <h2 className="text-2xl sm:text-3xl font-serif mt-1 mb-1">{isSponsored ? 'Preview' : 'Preview & Decorate'}</h2>
                <p className="text-secondary text-xs sm:text-sm">
                  {isSponsored
                    ? 'Your message will wait in the Waiting Room until someone sponsors it for $3.'
                    : 'Drag stickers freely across the card to customize your stage layout.'}
                </p>
              </div>

              {/* Canvas instruction pill — full card width like live */}
              {!isSponsored && (
              <div className="w-full flex items-center justify-between mb-3 px-2 text-xs text-secondary">
                <span className="font-semibold text-primary">Live Card Canvas</span>
                <span className="text-[11px] text-amber-500 dark:text-amber-400 font-semibold flex items-center gap-1">
                  <span>✦</span> Drag stickers to reposition
                </span>
              </div>
              )}
              
              <div 
                ref={previewCardRef}
                onClick={() => setSelectedStickerId(null)}
                className={`w-full max-w-4xl aspect-square md:aspect-video mx-auto border ${cardStyles.cardBorder || 'border-primary/20'} rounded-2xl flex flex-col p-6 md:p-12 relative overflow-hidden shadow-2xl backdrop-blur-md select-none ${cardStyles.bg} ${getFrameClass(frameId || undefined)}`}
              >
                {!isSponsored && <FrameDecorator frameId={frameId || undefined} />}

                {/* Interactive Draggable & Stretchable Stickers (disabled for Sponsored) */}
                {!isSponsored && stickers.map(sticker => {
                  const isSelected = selectedStickerId === sticker.id;
                  return (
                    <div
                      key={sticker.id}
                      onPointerDown={(e) => handleStickerPointerDown(e, sticker)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStickerId(sticker.id);
                      }}
                      className={`group absolute select-none leading-none z-30 touch-none transition-transform ${
                        isSelected 
                          ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-black/50 rounded-2xl p-1 bg-amber-400/20 cursor-grab active:cursor-grabbing scale-105 shadow-xl' 
                          : 'cursor-grab hover:scale-105 hover:ring-1 hover:ring-amber-400/60 rounded-2xl p-1'
                      }`}
                      style={{
                        left: `${sticker.x}%`,
                        top: `${sticker.y}%`,
                        transform: 'translate(-50%, -50%)',
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.65))',
                      }}
                      title="Drag to reposition • Drag corner stretch handle to resize"
                    >
                      <span
                        className="block pointer-events-none select-none leading-none"
                        style={{
                          fontSize: `${sticker.size}em`,
                        }}
                      >
                        {sticker.emoji}
                      </span>

                      {/* Stretch handle on border — shown on hover or when selected */}
                      <div
                        onPointerDown={(e) => handleStretchPointerDown(e, sticker)}
                        onClick={(e) => e.stopPropagation()}
                        className={`absolute -bottom-2.5 -right-2.5 w-6 h-6 rounded-full bg-amber-400 hover:bg-amber-300 text-neutral-950 flex items-center justify-center shadow-lg border-2 border-neutral-900 cursor-se-resize transition-all hover:scale-125 active:scale-95 z-40 select-none ${
                          isSelected ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                        title="Drag to stretch / scale size"
                      >
                        <svg className="w-3 h-3 stroke-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="15 3 21 3 21 9" />
                          <polyline points="9 21 3 21 3 15" />
                          <line x1="21" y1="3" x2="14" y2="10" />
                          <line x1="3" y1="21" x2="10" y2="14" />
                        </svg>
                      </div>

                      {/* Delete button on top-right corner — shown on hover or when selected */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setStickers(stickers.filter(s => s.id !== sticker.id));
                          setSelectedStickerId(null);
                        }}
                        className={`absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg border-2 border-neutral-900 cursor-pointer transition-all hover:scale-125 active:scale-95 z-40 select-none ${
                          isSelected ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                        title="Delete sticker"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  );
                })}

                {/* Header with Category Badge & VIP Badge — same row layout as live */}
                <div className="flex justify-between items-center mb-2 relative z-10 pointer-events-none">
                  <span className={`text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-full border shadow-xs ${badgeClass}`}>
                    {categoryMeta.icon} {selectedCategory.name}
                  </span>

                  {selectedTemplate.vipBadge && (
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      {selectedTemplate.vipIcon} VIP
                    </span>
                  )}
                </div>

                {/* Message Body — same geometry + type scale as live feed */}
                <div className="relative z-10 flex-1 min-h-0 w-full overflow-y-auto overscroll-contain custom-scrollbar px-2 md:px-6 py-4 my-2 flex flex-col pointer-events-none">
                  <div className="my-auto w-full flex flex-col items-center justify-center">
                    <div 
                      className={`max-w-none text-center leading-relaxed ${
                        messageText.length > 350 ? 'text-lg md:text-xl' : messageText.length > 180 ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl'
                      } ${selectedTemplate.font} ${cardStyles.textColor}`}
                      style={{ color: cardStyles.inlineColor !== 'inherit' ? cardStyles.inlineColor : undefined }}
                      dangerouslySetInnerHTML={{ __html: sanitizeHtmlText(messageHtml) }}
                    />
                  </div>
                </div>

                {/* Interactive Brand Link or Recipient */}
                <div className="relative z-10 mt-auto text-center space-y-2 pointer-events-none">
                  {(brandName || brandUrl) && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-700 dark:text-cyan-300 text-xs font-semibold pointer-events-auto">
                      <span>{brandName || 'Open Link'}</span>
                      <ExternalLink size={11} />
                    </div>
                  )}

                  {recipient && category !== 'promotion' && (
                    <p className={`text-xs uppercase tracking-widest opacity-60 ${cardStyles.textColor}`}>For {recipient}</p>
                  )}
                  
                  <p className={`text-sm font-medium italic opacity-70 ${cardStyles.textColor}`}>
                    — {identityType === 'custom' && customName ? customName : 'Anonymous'}
                  </p>
                </div>
              </div>

              {/* ✦ Sticker Decoration Panel directly below Preview Card (not for Sponsored) */}
              {isSponsored ? (
                <div className="w-full mt-6 p-4 rounded-2xl border border-blue-500/25 bg-blue-500/5 text-center">
                  <p className="text-xs text-secondary">
                    Stickers aren&apos;t available on Sponsored messages — your card stays clean on the grid.
                  </p>
                </div>
              ) : (
              <div className="w-full mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 sm:p-5 rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-background-elevated/40 to-background-elevated/20 shadow-md flex flex-col">
                  <StickerPicker 
                    stickers={stickers} 
                    onChange={setStickers}
                    selectedId={selectedStickerId}
                    onSelectId={setSelectedStickerId}
                  />
                </div>
                <div className="p-4 sm:p-5 rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-background-elevated/40 to-background-elevated/20 shadow-md flex flex-col">
                  <FramePicker selectedId={frameId} onChange={setFrameId} />
                </div>
              </div>
              )}

              <div className="w-full mt-8 grid grid-cols-2 gap-4">
                <button 
                  onClick={handleBack}
                  className="w-full py-4 border border-background-elevated rounded-full font-medium hover:bg-background-muted transition-colors"
                >
                  Edit
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-primary text-background rounded-full font-medium disabled:opacity-50 transition-opacity"
                >
                  {isSubmitting ? 'Submitting...' : isSponsored ? 'Post to Waiting Room' : 'Proceed to Checkout'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

export default function CreateMessage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        </div>
      }
    >
      <CreateMessageContent />
    </Suspense>
  );
}
