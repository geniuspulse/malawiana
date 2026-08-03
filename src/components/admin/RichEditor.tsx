'use client'
import { extractYouTubeId, youTubeIdToUrl } from '@/lib/utils'
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ImageExt from '@tiptap/extension-image'
import LinkExt from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import UnderlineExt from '@tiptap/extension-underline'
import Youtube from '@tiptap/extension-youtube'
import CharacterCount from '@tiptap/extension-character-count'
import Color from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import { useState, useCallback } from 'react'
import {
  Bold, Italic, Underline, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code2, Minus,
  Link as LinkIcon, Image as ImageIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Youtube as YoutubeIcon, Table as TableIcon,
  Undo2, Redo2, Highlighter, Subscript as SubIcon, Superscript as SupIcon,
  RemoveFormatting, X, Check, Type
} from 'lucide-react'

interface RichEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

interface ModalState {
  type: 'link' | 'image' | 'youtube' | null
  url: string
  alt: string
  newTab: boolean
}

const ToolbarBtn = ({
  onClick, active, disabled, title, children
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded-md transition-colors text-sm flex items-center justify-center ${
      active
        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
    } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    {children}
  </button>
)

const Divider = () => <div className="w-px h-5 bg-gray-200 dark:bg-slate-700 mx-0.5 self-center" />

export default function RichEditor({ value, onChange, placeholder = 'Start writing your story...' }: RichEditorProps) {
  const [modal, setModal] = useState<ModalState>({ type: null, url: '', alt: '', newTab: true })

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      UnderlineExt,
      ImageExt.configure({ inline: false, allowBase64: false }),
      LinkExt.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Youtube.configure({ width: 840, height: 472, nocookie: true, modestBranding: true }),
      CharacterCount.configure({ limit: 50000 }),
      Color,
      TextStyle,
      Highlight.configure({ multicolor: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Subscript,
      Superscript,
    ],
    content: value,
    autofocus: false,
    editorProps: {
      attributes: {
        class: 'prose prose-lg dark:prose-invert max-w-none min-h-[480px] focus:outline-none px-6 py-5',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  const openModal = useCallback((type: 'link' | 'image' | 'youtube') => {
    const existingUrl = type === 'link' ? editor?.getAttributes('link').href || '' : ''
    setModal({ type, url: existingUrl, alt: '', newTab: true })
  }, [editor])

  const closeModal = () => setModal({ type: null, url: '', alt: '', newTab: true })

  const applyModal = () => {
    if (!editor || !modal.url.trim()) { closeModal(); return }
    if (modal.type === 'link') {
      editor.chain().focus().extendMarkRange('link')
        .setLink({ href: modal.url.trim(), target: modal.newTab ? '_blank' : '_self' }).run()
    } else if (modal.type === 'image') {
      editor.chain().focus().setImage({ src: modal.url.trim(), alt: modal.alt.trim() }).run()
    } else if (modal.type === 'youtube') {
      const input = modal.url.trim()
      const videoId = extractYouTubeId(input)
      const src = videoId ? youTubeIdToUrl(videoId) : input
      editor.chain().focus().setYoutubeVideo({ src }).run()
    }
    closeModal()
  }

  if (!editor) return <div className="min-h-[480px] bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 animate-pulse" />

  const words = editor.storage.characterCount?.words() ?? 0
  const chars = editor.storage.characterCount?.characters() ?? 0
  const readingTime = Math.max(1, Math.ceil(words / 200))

  return (
    <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">

      {/* ─── TOOLBAR ─────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-3 py-2 flex flex-wrap gap-0.5 items-center">

        {/* History */}
        <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo"><Undo2 size={15} /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo"><Redo2 size={15} /></ToolbarBtn>
        <Divider />

        {/* Text style */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><Bold size={15} /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Italic size={15} /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><Underline size={15} /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><Strikethrough size={15} /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Highlight"><Highlighter size={14} /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} title="Subscript"><SubIcon size={14} /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} title="Superscript"><SupIcon size={14} /></ToolbarBtn>

        {/* Color picker */}
        <label title="Text color" className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer flex items-center">
          <Type size={14} className="text-gray-600 dark:text-gray-300" />
          <input type="color" className="w-0 h-0 opacity-0 absolute"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()} />
        </label>
        <Divider />

        {/* Headings */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1"><Heading1 size={15} /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2"><Heading2 size={15} /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3"><Heading3 size={15} /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive('paragraph') && !editor.isActive('heading')} title="Paragraph"><span className="text-xs font-semibold px-1">P</span></ToolbarBtn>
        <Divider />

        {/* Alignment */}
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align left"><AlignLeft size={14} /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Center"><AlignCenter size={14} /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align right"><AlignRight size={14} /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justify"><AlignJustify size={14} /></ToolbarBtn>
        <Divider />

        {/* Lists */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list"><List size={15} /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list"><ListOrdered size={15} /></ToolbarBtn>
        <Divider />

        {/* Blocks */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote"><Quote size={15} /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block"><Code2 size={15} /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider"><Minus size={15} /></ToolbarBtn>
        <Divider />

        {/* Insert */}
        <ToolbarBtn onClick={() => openModal('link')} active={editor.isActive('link')} title="Insert link"><LinkIcon size={14} /></ToolbarBtn>
        <ToolbarBtn onClick={() => openModal('image')} title="Insert image"><ImageIcon size={14} /></ToolbarBtn>
        <ToolbarBtn onClick={() => openModal('youtube')} title="Embed YouTube video"><YoutubeIcon size={15} /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Insert table"><TableIcon size={14} /></ToolbarBtn>
        <Divider />

        {/* Clear */}
        <ToolbarBtn onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} title="Clear formatting"><RemoveFormatting size={14} /></ToolbarBtn>
      </div>

      {/* ─── BUBBLE MENU ─────────────────────────────── */}
      <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
        <div className="flex items-center gap-0.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg p-1">
          <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><Bold size={13} /></ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Italic size={13} /></ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><Underline size={13} /></ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Highlight"><Highlighter size={12} /></ToolbarBtn>
          <ToolbarBtn onClick={() => openModal('link')} active={editor.isActive('link')} title="Link"><LinkIcon size={12} /></ToolbarBtn>
          {editor.isActive('link') && (
            <ToolbarBtn onClick={() => editor.chain().focus().unsetLink().run()} title="Remove link"><X size={12} /></ToolbarBtn>
          )}
        </div>
      </BubbleMenu>

      {/* ─── EDITOR AREA ─────────────────────────────── */}
      <EditorContent editor={editor} className="min-h-[480px]" />

      {/* ─── STATUS BAR ──────────────────────────────── */}
      <div className="border-t border-gray-100 dark:border-slate-700 px-4 py-2 flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-slate-800/50">
        <span>{words.toLocaleString()} words</span>
        <span className="text-gray-200 dark:text-slate-700">·</span>
        <span>{chars.toLocaleString()} characters</span>
        <span className="text-gray-200 dark:text-slate-700">·</span>
        <span>{readingTime} min read</span>
        <span className="ml-auto text-gray-300 dark:text-slate-600">{chars}/50,000</span>
      </div>

      {/* ─── MODALS ──────────────────────────────────── */}
      {modal.type && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={closeModal}>
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white text-base">
                {modal.type === 'link' ? 'Insert Link' : modal.type === 'image' ? 'Insert Image' : 'Embed YouTube Video'}
              </h3>
              <button type="button" onClick={closeModal} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400"><X size={16} /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  {modal.type === 'youtube' ? 'YouTube URL or Video ID' : 'URL'}
                </label>
                <input
                  autoFocus
                  type="text"
                  value={modal.url}
                  onChange={e => setModal(m => ({ ...m, url: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && applyModal()}
                  placeholder={
                    modal.type === 'link' ? 'https://example.com' :
                    modal.type === 'image' ? 'https://example.com/image.jpg' :
                    'https://youtube.com/watch?v=... or just the video ID (e.g. dQw4w9WgXcQ)'
                  }
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent text-sm dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              {modal.type === 'image' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Alt Text</label>
                  <input
                    type="text"
                    value={modal.alt}
                    onChange={e => setModal(m => ({ ...m, alt: e.target.value }))}
                    placeholder="Describe the image..."
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent text-sm dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}
              {modal.type === 'link' && (
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={modal.newTab} onChange={e => setModal(m => ({ ...m, newTab: e.target.checked }))} className="rounded" />
                  Open in new tab
                </label>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
              <button type="button" onClick={applyModal} className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1.5">
                <Check size={14} /> Insert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
