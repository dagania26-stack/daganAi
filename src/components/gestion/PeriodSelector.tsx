"use client"

import { useRouter, usePathname } from "next/navigation"
import { PERIOD_OPTIONS } from "@/lib/periode"

interface Props {
  value:    number
  disabled?: boolean
}

export default function PeriodSelector({ value, disabled }: Props) {
  const router   = useRouter()
  const pathname = usePathname()

  return (
    <div className="relative shrink-0">
      <select
        value={value}
        disabled={disabled}
        onChange={e => router.push(`${pathname}?jours=${e.target.value}`)}
        className="appearance-none pl-3 pr-8 py-2 bg-white border border-border-custom rounded-lg font-sans text-xs font-semibold text-dark hover:bg-surface disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-terracotta/30"
      >
        {PERIOD_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <i className="fi fi-rr-angle-small-down absolute right-2.5 top-1/2 -translate-y-1/2 text-muted text-xs pointer-events-none" />
    </div>
  )
}
