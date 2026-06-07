"use client"

import { useState, useEffect, useRef } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import { mergeAttributes } from "@tiptap/core"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import { TextStyle } from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import Highlight from "@tiptap/extension-highlight"
import FontFamily from "@tiptap/extension-font-family"
import Link from "@tiptap/extension-link"
import TiptapImage from "@tiptap/extension-image"
import TextAlign from "@tiptap/extension-text-align"

// ─── Image redimensionnable et alignable — largeur (%) + position via marges ──
const ResizableImage = TiptapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "100",
        parseHTML: el => (el.getAttribute("data-width") || "100").replace("%", ""),
        renderHTML: () => ({}),
      },
      align: {
        default: "center",
        parseHTML: el => el.getAttribute("data-align") || "center",
        renderHTML: () => ({}),
      },
    }
  },
  renderHTML({ HTMLAttributes }) {
    const { width, align, ...rest } = HTMLAttributes
    const margin = align === "left" ? "0 auto 0 0" : align === "right" ? "0 0 0 auto" : "0 auto"
    const style  = `display:block;max-width:100%;width:${width}%;margin:${margin};border-radius:12px;`
    return ["img", mergeAttributes(rest, { style, "data-width": String(width), "data-align": align })]
  },
})

const FONTS = [
  { label: "Police par défaut", value: ""                                       },
  { label: "Arial",             value: "Arial, Helvetica, sans-serif"           },
  { label: "Helvetica",         value: "Helvetica, Arial, sans-serif"           },
  { label: "Georgia",           value: "Georgia, 'Times New Roman', serif"      },
  { label: "Times New Roman",   value: "'Times New Roman', Times, serif"        },
  { label: "Garamond",          value: "Garamond, Georgia, serif"               },
  { label: "Trebuchet MS",      value: "'Trebuchet MS', Tahoma, sans-serif"     },
  { label: "Verdana",           value: "Verdana, Geneva, sans-serif"            },
  { label: "Tahoma",            value: "Tahoma, Verdana, sans-serif"            },
  { label: "Palatino",          value: "'Palatino Linotype', 'Book Antiqua', serif" },
  { label: "Courier New",       value: "'Courier New', Courier, monospace"      },
]

const TEXT_COLORS      = ["#1A1A1A", "#C1440E", "#D4A017", "#2D6A4F", "#2563EB", "#DC2626", "#6B6860", "#FFFFFF"]
const HIGHLIGHT_COLORS = ["#FEF3C7", "#FCE7F3", "#DBEAFE", "#D1FAE5", "#FFE4E6", "#EDE9FE", "#F5F0EB", "#FFFFFF"]

const HEADINGS = [
  { label: "Paragraphe", level: 0 },
  { label: "Titre H1",   level: 1 },
  { label: "Titre H2",   level: 2 },
  { label: "Titre H3",   level: 3 },
  { label: "Titre H4",   level: 4 },
]

const SELECT = "border border-border-custom rounded-lg pl-2.5 pr-7 py-1.5 font-sans text-xs text-dark focus:outline-none focus:ring-2 focus:ring-terracotta/30 bg-white cursor-pointer"
const BTN    = "w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:bg-surface hover:text-dark transition-colors shrink-0"
const BTN_ON = "bg-terracotta/10 text-terracotta"

function ToolbarButton({ active, onClick, title, icon, disabled }: {
  active?: boolean; onClick: () => void; title: string; icon: string; disabled?: boolean
}) {
  return (
    <button type="button" onClick={onClick} title={title} disabled={disabled}
      className={`${BTN} ${active ? BTN_ON : ""} disabled:opacity-30 disabled:cursor-not-allowed`}>
      <i className={`fi ${icon} text-sm`} />
    </button>
  )
}

function Divider() {
  return <span className="w-px h-6 bg-border-custom mx-1 self-center shrink-0" />
}

interface Props {
  value:        string
  onChange:     (html: string) => void
  placeholder?: string
}

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const [popover, setPopover]   = useState<"color" | "highlight" | "link" | "image" | null>(null)
  const [linkUrl, setLinkUrl]   = useState("")
  const [imgUrl, setImgUrl]     = useState("")
  const [imgWidth, setImgWidth] = useState("100")
  const [imgAlign, setImgAlign] = useState<"left" | "center" | "right">("center")
  const wrapRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      FontFamily,
      Link.configure({
        openOnClick:    false,
        autolink:       true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      ResizableImage.configure({ inline: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "rte-content focus:outline-none min-h-[180px] max-h-[420px] overflow-y-auto px-4 py-3 font-sans text-dark text-sm leading-relaxed",
        ...(placeholder ? { "data-placeholder": placeholder } : {}),
      },
    },
  })

  // Fermer les popovers au clic extérieur
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setPopover(null)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  // Synchroniser si la valeur externe change (ex : passage en mode édition)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) editor.commands.setContent(value, { emitUpdate: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor])

  if (!editor) return null

  function toggle(name: "color" | "highlight" | "link" | "image") {
    if (name === "link") {
      setLinkUrl(editor?.getAttributes("link").href ?? "")
    }
    if (name === "image") {
      if (editor?.isActive("image")) {
        const attrs = editor.getAttributes("image")
        setImgUrl(attrs.src ?? "")
        setImgWidth(String(parseInt(attrs.width, 10) || 100))
        setImgAlign((attrs.align as "left" | "center" | "right") ?? "center")
      } else {
        setImgUrl(""); setImgWidth("100"); setImgAlign("center")
      }
    }
    setPopover(p => p === name ? null : name)
  }

  function applyLink() {
    if (!editor) return
    const url = linkUrl.trim()
    if (!url) editor.chain().focus().extendMarkRange("link").unsetLink().run()
    else      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
    setPopover(null)
  }

  function applyImage() {
    if (!editor) return
    const src = imgUrl.trim()
    if (!src) return
    const attrs = { src, alt: "", width: imgWidth || "100", align: imgAlign }
    if (editor.isActive("image")) editor.chain().focus().updateAttributes("image", attrs).run()
    else                          editor.chain().focus().setImage(attrs as never).run()
    setPopover(null)
  }

  const headingLevel = [1, 2, 3, 4].find(l => editor.isActive("heading", { level: l })) ?? 0

  return (
    <div ref={wrapRef} className="border border-border-custom rounded-xl overflow-visible bg-white">
      {/* Barre d'outils */}
      <div className="flex flex-wrap items-center gap-1 px-2.5 py-2 border-b border-border-custom bg-surface/50 relative">

        {/* Niveau de titre */}
        <select
          value={headingLevel}
          onChange={e => {
            const lvl = Number(e.target.value)
            if (lvl === 0) editor.chain().focus().setParagraph().run()
            else           editor.chain().focus().toggleHeading({ level: lvl as 1 | 2 | 3 | 4 }).run()
          }}
          className={SELECT}
          title="Niveau de titre"
        >
          {HEADINGS.map(h => <option key={h.level} value={h.level}>{h.label}</option>)}
        </select>

        {/* Police d'écriture */}
        <select
          value={editor.getAttributes("textStyle").fontFamily ?? ""}
          onChange={e => {
            const font = e.target.value
            if (font) editor.chain().focus().setFontFamily(font).run()
            else      editor.chain().focus().unsetFontFamily().run()
          }}
          className={`${SELECT} max-w-[140px]`}
          title="Police d'écriture"
        >
          {FONTS.map(f => <option key={f.label} value={f.value} style={{ fontFamily: f.value || undefined }}>{f.label}</option>)}
        </select>

        <Divider />

        {/* Mise en forme */}
        <ToolbarButton icon="fi-rr-bold"      title="Gras (Ctrl+B)"      active={editor.isActive("bold")}      onClick={() => editor.chain().focus().toggleBold().run()} />
        <ToolbarButton icon="fi-rr-italic"    title="Italique (Ctrl+I)"  active={editor.isActive("italic")}    onClick={() => editor.chain().focus().toggleItalic().run()} />
        <ToolbarButton icon="fi-rr-underline" title="Souligner (Ctrl+U)" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} />

        <Divider />

        {/* Couleur du texte */}
        <div className="relative">
          <ToolbarButton icon="fi-rr-text" title="Couleur du texte" active={popover === "color"} onClick={() => toggle("color")} />
          {popover === "color" && (
            <div className="absolute z-30 top-full left-0 mt-1.5 bg-white border border-border-custom rounded-xl shadow-lg p-3 w-44">
              <p className="font-display font-semibold text-dark text-xs mb-2">Couleur du texte</p>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {TEXT_COLORS.map(c => (
                  <button key={c} type="button" title={c} onClick={() => { editor.chain().focus().setColor(c).run(); setPopover(null) }}
                    className="w-7 h-7 rounded-lg border border-border-custom hover:scale-110 transition-transform"
                    style={{ background: c }} />
                ))}
              </div>
              <button type="button" onClick={() => { editor.chain().focus().unsetColor().run(); setPopover(null) }}
                className="w-full text-xs font-sans text-muted hover:text-dark py-1.5 rounded-lg hover:bg-surface transition-colors">
                Réinitialiser
              </button>
            </div>
          )}
        </div>

        {/* Couleur de fond (surlignage) */}
        <div className="relative">
          <ToolbarButton icon="fi-rr-highlighter" title="Couleur d'arrière-plan" active={popover === "highlight"} onClick={() => toggle("highlight")} />
          {popover === "highlight" && (
            <div className="absolute z-30 top-full left-0 mt-1.5 bg-white border border-border-custom rounded-xl shadow-lg p-3 w-44">
              <p className="font-display font-semibold text-dark text-xs mb-2">Couleur d&apos;arrière-plan</p>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {HIGHLIGHT_COLORS.map(c => (
                  <button key={c} type="button" title={c} onClick={() => { editor.chain().focus().setHighlight({ color: c }).run(); setPopover(null) }}
                    className="w-7 h-7 rounded-lg border border-border-custom hover:scale-110 transition-transform"
                    style={{ background: c }} />
                ))}
              </div>
              <button type="button" onClick={() => { editor.chain().focus().unsetHighlight().run(); setPopover(null) }}
                className="w-full text-xs font-sans text-muted hover:text-dark py-1.5 rounded-lg hover:bg-surface transition-colors">
                Réinitialiser
              </button>
            </div>
          )}
        </div>

        <Divider />

        {/* Alignement */}
        <ToolbarButton icon="fi-rr-align-left"    title="Aligner à gauche" active={editor.isActive({ textAlign: "left" })}    onClick={() => editor.chain().focus().setTextAlign("left").run()} />
        <ToolbarButton icon="fi-rr-align-center"  title="Centrer"          active={editor.isActive({ textAlign: "center" })}  onClick={() => editor.chain().focus().setTextAlign("center").run()} />
        <ToolbarButton icon="fi-rr-align-right"   title="Aligner à droite" active={editor.isActive({ textAlign: "right" })}   onClick={() => editor.chain().focus().setTextAlign("right").run()} />
        <ToolbarButton icon="fi-rr-align-justify" title="Justifier"        active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()} />

        <Divider />

        {/* Citation */}
        <ToolbarButton icon="fi-rr-quote-right" title="Citation" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} />

        {/* Lien hypertexte */}
        <div className="relative">
          <ToolbarButton icon="fi-rr-link-alt" title="Lien hypertexte" active={editor.isActive("link") || popover === "link"} onClick={() => toggle("link")} />
          {popover === "link" && (
            <div className="absolute z-30 top-full left-0 mt-1.5 bg-white border border-border-custom rounded-xl shadow-lg p-3 w-64">
              <p className="font-display font-semibold text-dark text-xs mb-2">Lien hypertexte</p>
              <input
                type="url"
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                placeholder="https://exemple.com"
                autoFocus
                className="w-full border border-border-custom rounded-lg px-3 py-1.5 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-terracotta/30 mb-2"
              />
              <div className="flex gap-1.5">
                <button type="button" onClick={applyLink}
                  className="flex-1 bg-terracotta text-white text-xs font-display font-semibold py-1.5 rounded-lg hover:bg-[#a33a0c] transition-colors">
                  {linkUrl.trim() ? "Appliquer" : "Retirer"}
                </button>
                <button type="button" onClick={() => setPopover(null)}
                  className="px-3 text-xs font-sans text-muted hover:text-dark py-1.5 rounded-lg hover:bg-surface transition-colors">
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Image */}
        <div className="relative">
          <ToolbarButton icon="fi-rr-picture" title="Insérer une image" active={editor.isActive("image") || popover === "image"} onClick={() => toggle("image")} />
          {popover === "image" && (
            <div className="absolute z-30 top-full left-0 mt-1.5 bg-white border border-border-custom rounded-xl shadow-lg p-3 w-72">
              <p className="font-display font-semibold text-dark text-xs mb-2">
                {editor.isActive("image") ? "Modifier l'image" : "Insérer une image"}
              </p>
              <input
                type="url"
                value={imgUrl}
                onChange={e => setImgUrl(e.target.value)}
                placeholder="https://exemple.com/image.jpg"
                autoFocus
                className="w-full border border-border-custom rounded-lg px-3 py-1.5 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-terracotta/30 mb-2.5"
              />
              <div className="mb-2.5">
                <div className="flex items-center justify-between mb-1">
                  <label className="font-sans text-xs text-muted">Taille</label>
                  <span className="font-display font-semibold text-xs text-dark">{imgWidth}%</span>
                </div>
                <input
                  type="range" min={10} max={100} step={5}
                  value={imgWidth}
                  onChange={e => setImgWidth(e.target.value)}
                  className="w-full accent-terracotta"
                />
              </div>
              <div className="mb-3">
                <label className="font-sans text-xs text-muted block mb-1">Position</label>
                <div className="flex gap-1.5">
                  {([
                    { v: "left",   icon: "fi-rr-align-left",   label: "Gauche"  },
                    { v: "center", icon: "fi-rr-align-center", label: "Centre"  },
                    { v: "right",  icon: "fi-rr-align-right",  label: "Droite"  },
                  ] as const).map(opt => (
                    <button key={opt.v} type="button" onClick={() => setImgAlign(opt.v)}
                      title={opt.label}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border text-xs font-display font-semibold transition-colors ${
                        imgAlign === opt.v ? "border-terracotta bg-terracotta/10 text-terracotta" : "border-border-custom text-muted hover:bg-surface"
                      }`}>
                      <i className={`fi ${opt.icon} text-xs`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-1.5">
                <button type="button" onClick={applyImage} disabled={!imgUrl.trim()}
                  className="flex-1 bg-terracotta text-white text-xs font-display font-semibold py-1.5 rounded-lg hover:bg-[#a33a0c] disabled:opacity-50 transition-colors">
                  {editor.isActive("image") ? "Mettre à jour" : "Insérer"}
                </button>
                <button type="button" onClick={() => setPopover(null)}
                  className="px-3 text-xs font-sans text-muted hover:text-dark py-1.5 rounded-lg hover:bg-surface transition-colors">
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Zone d'édition */}
      <EditorContent editor={editor} />
    </div>
  )
}
