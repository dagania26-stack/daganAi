export function fmt(amount: number, devise = "FCFA"): string {
  return (
    new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) +
    " " +
    devise
  )
}

export function fmtDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  })
}
