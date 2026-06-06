"use client"

import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts"

function fmtK(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M"
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + "k"
  return String(n)
}

interface ChartPoint   { label: string; ca: number; depenses: number }
interface CategoryPoint { nom: string; entrees: number; sorties: number; total: number }

interface Props {
  chartData:  ChartPoint[]
  categories: CategoryPoint[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-border-custom rounded-xl shadow-sm px-3 py-2.5 text-xs font-sans">
      <p className="font-display font-semibold text-dark mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="mb-0.5">
          {p.name === "ca" ? "Entrées" : p.name === "depenses" ? "Sorties" : p.name} :{" "}
          <span className="font-semibold">{new Intl.NumberFormat("fr-FR").format(p.value)} FCFA</span>
        </p>
      ))}
    </div>
  )
}

export default function DashboardCharts({ chartData, categories }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

      {/* Évolution CA / Dépenses */}
      <div className="bg-white rounded-2xl border border-border-custom p-5">
        <p className="font-display font-bold text-dark text-sm mb-4">Évolution CA vs Dépenses</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="gradCA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#2D6A4F" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0}    />
              </linearGradient>
              <linearGradient id="gradDep" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#DC2626" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#DC2626" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#6B6860", fontFamily: "sans-serif" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: "#6B6860", fontFamily: "sans-serif" }} tickLine={false} axisLine={false} tickFormatter={fmtK} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="ca"       stroke="#2D6A4F" fill="url(#gradCA)"  strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="depenses" stroke="#DC2626" fill="url(#gradDep)" strokeWidth={2} dot={false} />
            <Legend
              formatter={(v) => v === "ca" ? "Entrées" : "Sorties"}
              wrapperStyle={{ fontSize: 11, fontFamily: "sans-serif" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Répartition catégories */}
      <div className="bg-white rounded-2xl border border-border-custom p-5">
        <p className="font-display font-bold text-dark text-sm mb-4">Répartition par catégorie</p>
        {categories.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center">
            <p className="font-sans text-muted text-sm text-center">Pas encore de données catégorisées</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categories} layout="vertical" margin={{ top: 0, right: 4, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#6B6860" }} tickLine={false} axisLine={false} tickFormatter={fmtK} />
              <YAxis type="category" dataKey="nom" tick={{ fontSize: 10, fill: "#6B6860", fontFamily: "sans-serif" }} tickLine={false} axisLine={false} width={72} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="entrees" name="Entrées" fill="#2D6A4F" radius={[0, 4, 4, 0]} barSize={10} />
              <Bar dataKey="sorties" name="Sorties" fill="#DC2626" radius={[0, 4, 4, 0]} barSize={10} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
