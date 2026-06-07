"use client"

interface Props {
  page:     number
  total:    number
  perPage:  number
  onChange: (page: number) => void
}

export default function Pagination({ page, total, perPage, onChange }: Props) {
  const pageCount = Math.max(1, Math.ceil(total / perPage))
  if (pageCount <= 1) return null

  const from = (page - 1) * perPage + 1
  const to   = Math.min(page * perPage, total)

  return (
    <div className="flex items-center justify-between mt-3 px-1">
      <p className="font-sans text-xs text-muted">
        {from}–{to} sur {total}
      </p>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onChange(page - 1)} disabled={page <= 1}
          aria-label="Page précédente"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-border-custom text-muted hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <i className="fi fi-rr-angle-small-left text-xs" />
        </button>
        <span className="font-display font-semibold text-dark text-xs px-1.5 min-w-[3.5rem] text-center">
          {page} / {pageCount}
        </span>
        <button onClick={() => onChange(page + 1)} disabled={page >= pageCount}
          aria-label="Page suivante"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-border-custom text-muted hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <i className="fi fi-rr-angle-small-right text-xs" />
        </button>
      </div>
    </div>
  )
}
