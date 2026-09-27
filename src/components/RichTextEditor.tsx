'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { FontFamily } from '@tiptap/extension-font-family'
import { Highlight } from '@tiptap/extension-highlight'
import { useState, useEffect, useRef } from 'react'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { Bold, Italic, Strikethrough, Palette, Highlighter, Smile, X } from 'lucide-react'

const FONTS = [
  { name: 'Sans', value: 'var(--font-inter)' },
  { name: 'Serif', value: 'var(--font-cormorant)' },
  { name: 'Mono', value: 'monospace' },
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
  const emojiRef = useRef<HTMLDivElement>(null)
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
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
      editor.commands.setContent(value || '', false)
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
          
          <div className="flex gap-1">
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
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                    isActive 
                      ? 'bg-primary text-background shadow-xs font-semibold' 
                      : 'text-secondary hover:text-primary hover:bg-primary/10'
                  }`}
                  style={{ fontFamily: font.value }}
                  title={`Font: ${font.name}${isActive ? ' (Active - click to reset)' : ''}`}
                >
                  {font.name}
                </button>
              )
            })}
          </div>
        </div>

        <div className="w-px h-4 bg-primary/15" />

        {/* Colors */}
        <div className="flex gap-2 items-center">
          <Palette size={15} className="text-secondary shrink-0" title="Text Color" />
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
          <Highlighter size={15} className="text-secondary shrink-0" title="Highlight Color" />
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

