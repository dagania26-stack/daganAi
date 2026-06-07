"use client"

interface Props {
  open:          boolean
  title:         string
  message:       string
  confirmLabel?: string
  cancelLabel?:  string
  loading?:      boolean
  onConfirm:     () => void
  onCancel:      () => void
}

export default function ConfirmDialog({
  open, title, message,
  confirmLabel = "Supprimer", cancelLabel = "Annuler",
  loading = false,
  onConfirm, onCancel,
}: Props) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl border border-border-custom shadow-xl w-full max-w-sm p-5 animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <i className="fi fi-rr-trash text-red-600 text-base" />
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-dark text-base">{title}</p>
            <p className="font-sans text-muted text-sm mt-1 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-border-custom text-muted font-display font-semibold text-sm hover:bg-surface disabled:opacity-50 transition-colors">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-display font-semibold text-sm hover:bg-red-700 disabled:opacity-60 transition-colors">
            {loading ? "Suppression…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
