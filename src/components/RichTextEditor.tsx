'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle, FontSize } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { FontFamily } from '@tiptap/extension-font-family'
import { Highlight } from '@tiptap/extension-highlight'
import { useState, useEffect, useRef } from 'react'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { Bold, Italic, Strikethrough, Palette, Highlighter, Smile, X, Type, ChevronDown } from 'lucide-react'

const FONTS = [
  { name: 'Clean',    label: 'Aa', value: 'var(--font-inter)',      hint: 'Inter — clean sans-serif' },
  { name: 'Edit',     label: 'Éd', value: 'var(--font-cormorant)',   hint: 'Cormorant — editorial serif' },
  { name: 'Classic',  label: 'Pl', value: 'var(--font-playfair)',    hint: 'Playfair — classic serif' },
  { name: 'Modern',   label: 'Ot', value: 'var(--font-outfit)',      hint: 'Outfit — modern geometric' },
  { name: 'Script',   label: 'Cv', value: 'var(--font-caveat)',      hint: 'Caveat — handwritten' },
  { name: 'Caps',     label: 'Cz', value: 'var(--font-cinzel)',      hint: 'Cinzel — monumental caps' },
  { name: 'Mono',     label: '01', value: 'var(--font-space-mono)',  hint: 'Space Mono — monospace' },
]

const FONT_SIZES = [
  { label: 'S',   name: 'Small',       value: '14px', hint: 'Small (14px) — subtext & notes' },
  { label: 'M',   name: 'Normal',      value: '18px', hint: 'Normal (18px) — standard body' },
  { label: 'L',   name: 'Large',       value: '24px', hint: 'Large (24px) — emphasis & quote' },
  { label: 'XL',  name: 'Extra Large', value: '32px', hint: 'Extra Large (32px) — bold headline' },
  { label: '2XL', name: 'Giant',       value: '40px', hint: 'Giant (40px) — big hero impact' },
]

const ALL_FONT_SIZES = [
  { label: '12px', name: 'Micro',       value: '12px' },
  { label: '14px', name: 'Small (S)',   value: '14px' },
  { label: '16px', name: 'Compact',     value: '16px' },
  { label: '18px', name: 'Normal (M)',  value: '18px' },
  { label: '20px', name: 'Medium',      value: '20px' },
  { label: '24px', name: 'Large (L)',   value: '24px' },
  { label: '28px', name: 'Headline',    value: '28px' },
  { label: '32px', name: 'Huge (XL)',   value: '32px' },
  { label: '36px', name: 'Banner',      value: '36px' },
  { label: '40px', name: 'Giant (2XL)', value: '40px' },
]

const COLORS = [
  '#090909', // pitch dark / deep black
  '#f43f5e', // rose-500
  '#eab308', // yellow-500
  '#3b82f6', // blue-500
  '#22c55e', // green-500
  '#a855f7', // purple-500
  '#ffffff', // white
]

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Someone, somewhere, needs to hear this...",
  maxWords = 150
}: { 
  value: string, 
  onChange: (html: string) => void,
  placeholder?: string,
  maxWords?: number
}) {
  const [showEmoji, setShowEmoji] = useState(false)
  const [showSizeDropdown, setShowSizeDropdown] = useState(false)
  const emojiRef = useRef<HTMLDivElement>(null)
  const sizeDropdownRef = useRef<HTMLDivElement>(null)
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontSize,
      Color,
      FontFamily,
      Highlight.configure({ multicolor: true }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'text-primary focus:outline-none min-h-[14rem] max-h-[22rem] overflow-y-auto custom-scrollbar text-lg leading-relaxed select-text',
      },
    },
  })

  // Synchronize external value changes (e.g. when opening starters or templates are applied)
  useEffect(() => {
    if (!editor) return
    const currentHtml = editor.getHTML()
    if (value !== currentHtml && (value || currentHtml !== '<p></p>')) {
      editor.commands.setContent(value || '', { emitUpdate: false })
      editor.commands.focus('end')
    }
  }, [value, editor])

  // Close emoji picker when clicking outside or pressing Escape
  useEffect(() => {
    if (!showEmoji) return
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowEmoji(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showEmoji])

  // Close size dropdown when clicking outside or pressing Escape
  useEffect(() => {
    if (!showSizeDropdown) return
    const handleClickOutside = (e: MouseEvent) => {
      if (sizeDropdownRef.current && !sizeDropdownRef.current.contains(e.target as Node)) {
        setShowSizeDropdown(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowSizeDropdown(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showSizeDropdown])

  if (!editor) {
    return null
  }

  return (
    <div className="relative bg-background-muted/80 dark:bg-background-muted border border-background-elevated rounded-2xl p-6 transition-colors focus-within:border-secondary shadow-sm">
      
      {/* Static Toolbar */}
      <div className="flex flex-wrap gap-3.5 items-center mb-6 pb-4 border-b border-primary/10">
        {/* Main Actions */}
        <div className="flex gap-1 items-center">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded-lg transition-colors ${
              editor.isActive('bold') 
                ? 'bg-primary text-background shadow-xs font-semibold' 
                : 'text-secondary hover:text-primary hover:bg-primary/10'
            }`}
            title="Bold"
          >
            <Bold size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded-lg transition-colors ${
              editor.isActive('italic') 
                ? 'bg-primary text-background shadow-xs font-semibold' 
                : 'text-secondary hover:text-primary hover:bg-primary/10'
            }`}
            title="Italic"
          >
            <Italic size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded-lg transition-colors ${
              editor.isActive('strike') 
                ? 'bg-primary text-background shadow-xs font-semibold' 
                : 'text-secondary hover:text-primary hover:bg-primary/10'
            }`}
            title="Strikethrough"
          >
            <Strikethrough size={16} />
          </button>
          
          <div className="w-px h-4 bg-primary/15 mx-1" />
          
          <div className="flex gap-1 flex-wrap">
            {FONTS.map(font => {
              const isActive = editor.isActive('textStyle', { fontFamily: font.value })
              return (
                <button
                  key={font.name}
                  type="button"
                  onClick={() => {
                    if (isActive) {
                      editor.chain().focus().unsetFontFamily().run()
                    } else {
                      editor.chain().focus().setFontFamily(font.value).run()
                    }
                  }}
                  className={`flex flex-col items-center justify-center px-2 py-1.5 min-w-[2.75rem] rounded-xl border transition-all ${
                    isActive
                      ? 'bg-primary text-background border-primary shadow-sm scale-105'
                      : 'text-secondary hover:text-primary hover:bg-primary/10 border-transparent hover:border-primary/20'
                  }`}
                  style={{ fontFamily: font.value }}
                  title={font.hint}
                >
                  <span className="text-base leading-none font-semibold">{font.label}</span>
                  <span className="text-[8px] leading-none mt-0.5 opacity-70 font-sans" style={{ fontFamily: 'var(--font-inter)' }}>{font.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="w-px h-4 bg-primary/15" />

        {/* Font Size Selector */}
        <div className="relative flex items-center" ref={sizeDropdownRef}>
          <div className="flex items-center gap-1 bg-background-elevated/40 border border-primary/15 rounded-xl p-1">
            <div className="flex items-center gap-1 pl-1.5 pr-1 text-secondary select-none" title="Font Size">
              <Type size={14} className="opacity-70 shrink-0" />
              <span className="text-[11px] font-semibold hidden sm:inline">Size</span>
            </div>

            <div className="flex items-center gap-0.5">
              {FONT_SIZES.map(size => {
                const isActive = editor.isActive('textStyle', { fontSize: size.value })
                return (
                  <button
                    key={size.name}
                    type="button"
                    onClick={() => {
                      if (isActive) {
                        editor.chain().focus().unsetFontSize().run()
                      } else {
                        editor.chain().focus().setFontSize(size.value).run()
                      }
                    }}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-primary text-background shadow-xs scale-105'
                        : 'text-secondary hover:text-primary hover:bg-primary/10'
                    }`}
                    title={`${size.hint}${isActive ? ' (Active - click to reset)' : ''}`}
                  >
                    {size.label}
                  </button>
                )
              })}

              <button
                type="button"
                onClick={() => setShowSizeDropdown(!showSizeDropdown)}
                className={`p-1 rounded-lg transition-colors text-secondary hover:text-primary hover:bg-primary/10 ${
                  showSizeDropdown ? 'bg-primary/15 text-primary' : ''
                }`}
                title="All font sizes"
              >
                <ChevronDown size={13} className={`transition-transform duration-200 ${showSizeDropdown ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Size Dropdown Menu */}
          {showSizeDropdown && (
            <div className="absolute top-full left-0 mt-2 z-50 min-w-[11rem] bg-background-muted border border-background-elevated rounded-xl shadow-2xl p-1.5 backdrop-blur-md">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-secondary/70 border-b border-primary/10 mb-1">
                Font Size
              </div>
              <div className="max-h-48 overflow-y-auto custom-scrollbar flex flex-col gap-0.5">
                {ALL_FONT_SIZES.map(s => {
                  const isActive = editor.isActive('textStyle', { fontSize: s.value })
                  return (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => {
                        editor.chain().focus().setFontSize(s.value).run()
                        setShowSizeDropdown(false)
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors ${
                        isActive
                          ? 'bg-primary text-background font-semibold'
                          : 'text-secondary hover:text-primary hover:bg-primary/10'
                      }`}
                    >
                      <span className="truncate">{s.name}</span>
                      <span className="font-mono text-[11px] opacity-70 shrink-0 ml-2">{s.value}</span>
                    </button>
                  )
                })}
              </div>
              <div className="border-t border-primary/10 mt-1 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().unsetFontSize().run()
                    setShowSizeDropdown(false)
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] text-secondary hover:text-rose-500 rounded-lg transition-colors hover:bg-rose-500/10"
                >
                  <X size={12} />
                  <span>Reset font size</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-primary/15" />

        {/* Colors */}
        <div className="flex gap-2 items-center">
          <Palette size={15} className="text-secondary shrink-0" />
          <div className="flex gap-1.5 items-center">
            {COLORS.map(color => {
              const isActive = editor.isActive('textStyle', { color })
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    if (isActive) {
                      editor.chain().focus().unsetColor().run()
                    } else {
                      editor.chain().focus().setColor(color).run()
                    }
                  }}
                  className={`w-5 h-5 rounded-full border border-primary/25 hover:scale-115 transition-transform shadow-xs ${
                    isActive ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  title={`Color: ${color}${isActive ? ' (Active - click to remove)' : ''}`}
                />
              )
            })}
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetColor().run()}
              className="w-5 h-5 rounded-full border border-primary/20 flex items-center justify-center hover:bg-primary/10 text-secondary hover:text-primary text-[10px] transition-colors"
              title="Reset text color"
            >
              <X size={10} />
            </button>
          </div>
        </div>

        <div className="w-px h-4 bg-primary/15" />

        {/* Highlights */}
        <div className="flex gap-2 items-center">
          <Highlighter size={15} className="text-secondary shrink-0" />
          <div className="flex gap-1.5 items-center">
            {COLORS.slice(1).map(color => {
              const highlightColor = color + '40'
              const isActive = editor.isActive('highlight', { color: highlightColor })
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    if (isActive) {
                      editor.chain().focus().unsetHighlight().run()
                    } else {
                      editor.chain().focus().toggleHighlight({ color: highlightColor }).run()
                    }
                  }}
                  className={`w-5 h-5 rounded border border-primary/25 hover:scale-115 transition-transform shadow-xs ${
                    isActive ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110' : ''
                  }`}
                  style={{ backgroundColor: highlightColor }}
                  title={`Highlight: ${color}${isActive ? ' (Active - click to remove)' : ''}`}
                />
              )
            })}
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetHighlight().run()}
              className="w-5 h-5 rounded border border-primary/20 flex items-center justify-center hover:bg-primary/10 text-secondary hover:text-primary text-[10px] transition-colors"
              title="Reset highlight"
            >
              <X size={10} />
            </button>
          </div>
        </div>
      </div>

      <div className="relative">
        <EditorContent editor={editor} />
        {(!editor.getText() || editor.isEmpty) && (
          <div className="absolute top-0 left-0 text-secondary/60 pointer-events-none select-none text-lg leading-relaxed">
            {placeholder}
          </div>
        )}
      </div>

      <div className="absolute bottom-4 right-4 flex items-center gap-3">
        {/* Emoji Button */}
        <div className="relative" ref={emojiRef}>
          <button 
            type="button"
            onClick={() => setShowEmoji(!showEmoji)}
            className="p-2 text-secondary hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
            title="Add Emoji"
          >
            <Smile size={19} />
          </button>
          
          {showEmoji && (
            <div className="absolute bottom-full right-0 mb-2 z-50 shadow-2xl rounded-2xl overflow-hidden border border-primary/10">
              <Picker 
                data={data} 
                onEmojiSelect={(emoji: any) => {
                  editor.chain().focus().insertContent(emoji.native).run()
                  setShowEmoji(false)
                }} 
                theme="auto"
              />
            </div>
          )}
        </div>
        {(() => {
          const text = editor.getText().trim()
          const wordCount = text.length > 0 ? text.split(/\s+/).length : 0
          const isOver = wordCount > maxWords
          return (
            <div className={`text-xs font-mono px-2.5 py-1 rounded-full border transition-colors ${
              isOver 
                ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 font-bold' 
                : wordCount >= maxWords - 10 
                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 font-medium' 
                : 'text-secondary bg-background-elevated/80 border-primary/15'
            }`}>
              {wordCount} / {maxWords} words
            </div>
          )
        })()}
      </div>
    </div>
  )
}

