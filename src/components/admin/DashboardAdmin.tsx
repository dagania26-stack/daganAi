"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts"

interface StatsData {
  totalUsers:        number
  newUsers7d:        number
  newUsers30d:       number
  totalChats:        number
  failedChats:       number
  successRate:       number
  securityEvents24h: number
  chartData:         { date: string; label: string; inscriptions: number; chatsOk: number; chatsFail: number }[]
  topPays:           { pays: string; count: number }[]
}

const PAYS_COLORS = ["#C1440E", "#E8845C", "#F5C4A8", "#6B4F3A", "#A0856C", "#D4A882", "#8B6347"]

function StatCard({ icon, label, value, sub, accent = false }: {
  icon:    string
  label:   string
  value:   string | number
  sub?:    string
  accent?: boolean
}) {
  return (
    <div className={`bg-white rounded-2xl border p-5 ${accent ? "border-terracotta/30" : "border-border-custom"}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent ? "bg-terracotta/10" : "bg-surface"}`}>
          <i className={`fi ${icon} ${accent ? "text-terracotta" : "text-muted"} text-lg`} />
        </div>
      </div>
      <p className="font-display font-bold text-dark text-2xl">{value}</p>
      <p className="font-display font-semibold text-dark text-sm mt-0.5">{label}</p>
      {sub && <p className="font-sans text-muted text-xs mt-1">{sub}</p>}
    </div>
  )
}

export default function DashboardAdmin() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
          <p className="font-sans text-muted text-sm">Chargement des données…</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="p-6 lg:p-8">
        <p className="font-sans text-red-500 text-sm">Impossible de charger les statistiques.</p>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">

      {/* En-tête */}
      <div>
        <h1 className="font-display font-bold text-dark text-2xl">Tableau de bord</h1>
        <p className="font-sans text-muted text-sm mt-1">Vue d&apos;ensemble en temps réel de la plateforme</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="fi-rr-users"
          label="Utilisateurs"
          value={stats.totalUsers.toLocaleString("fr-FR")}
          sub={`+${stats.newUsers7d} cette semaine`}
          accent
        />
        <StatCard
          icon="fi-rr-comment-alt"
          label="Conversations"
          value={stats.totalChats.toLocaleString("fr-FR")}
          sub={`Taux succès : ${stats.successRate}%`}
        />
        <StatCard
          icon="fi-rr-cross-circle"
          label="Erreurs chat"
          value={stats.failedChats.toLocaleString("fr-FR")}
          sub="Requêtes échouées"
        />
        <StatCard
          icon="fi-rr-shield-check"
          label="Alertes sécurité"
          value={stats.securityEvents24h.toLocaleString("fr-FR")}
          sub="Dernières 24h"
        />
      </div>

      {/* Accès rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {[
          { href: "/admin/base-connaissance", icon: "fi-rr-database",   label: "Base de connaissances", desc: "Gérer les documents RAG",  accent: true  },
          { href: "/admin/utilisateurs",      icon: "fi-rr-users",      label: "Utilisateurs",          desc: "Comptes & rôles"                          },
          { href: "/admin/annonces",          icon: "fi-rr-megaphone",  label: "Annonces",              desc: "Diffuser un message"                      },
          { href: "/admin/maintenance",       icon: "fi-rr-settings",   label: "Maintenance",           desc: "Mode maintenance"                         },
        ].map(({ href, icon, label, desc, accent }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-start gap-3 p-4 bg-white rounded-2xl border transition-all hover:shadow-sm hover:-translate-y-0.5 ${accent ? "border-terracotta/30 hover:border-terracotta/60" : "border-border-custom hover:border-dark/20"}`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${accent ? "bg-terracotta/10" : "bg-surface"}`}>
              <i className={`fi ${icon} text-base ${accent ? "text-terracotta" : "text-muted"}`} />
            </div>
            <div className="min-w-0">
              <p className="font-display font-semibold text-dark text-sm leading-tight">{label}</p>
              <p className="font-sans text-muted text-xs mt-0.5 truncate">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Graphique inscriptions + chats */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border-custom p-5">
          <h2 className="font-display font-semibold text-dark text-base mb-4">Activité — 30 derniers jours</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats.chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#C1440E" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#C1440E" stopOpacity={0}    />
                </linearGradient>
                <linearGradient id="gradChats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6B4F3A" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6B4F3A" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fontFamily: "DM Sans" }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10, fontFamily: "DM Sans" }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ border: "1px solid #E8E0D8", borderRadius: 12, fontSize: 12, fontFamily: "DM Sans" }}
                labelStyle={{ fontFamily: "Syne", fontWeight: 600 }}
              />
              <Area type="monotone" dataKey="inscriptions" name="Inscriptions" stroke="#C1440E" fill="url(#gradUsers)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="chatsOk"      name="Chats OK"     stroke="#6B4F3A" fill="url(#gradChats)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut pays */}
        <div className="bg-white rounded-2xl border border-border-custom p-5">
          <h2 className="font-display font-semibold text-dark text-base mb-4">Top pays</h2>
          {stats.topPays.length === 0 ? (
            <div className="flex items-center justify-center h-[180px]">
              <p className="font-sans text-muted text-sm">Aucune donnée</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={stats.topPays}
                  dataKey="count"
                  nameKey="pays"
                  cx="50%" cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={2}
                >
                  {stats.topPays.map((_, i) => (
                    <Cell key={i} fill={PAYS_COLORS[i % PAYS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v, name) => [`${v} users`, String(name)]}
                  contentStyle={{ border: "1px solid #E8E0D8", borderRadius: 10, fontSize: 11 }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, fontFamily: "DM Sans" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Taux succès chat */}
      <div className="bg-white rounded-2xl border border-border-custom p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-dark text-base">Santé du chatbot</h2>
          <span className={`font-display font-bold text-sm px-3 py-1 rounded-full ${
            stats.successRate >= 90 ? "bg-green-100 text-green-700" :
            stats.successRate >= 70 ? "bg-yellow-100 text-yellow-700" :
                                       "bg-red-100 text-red-700"
          }`}>
            {stats.successRate}%
          </span>
        </div>
        <div className="w-full h-3 bg-surface rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              stats.successRate >= 90 ? "bg-green-500" :
              stats.successRate >= 70 ? "bg-yellow-500" : "bg-red-500"
            }`}
            style={{ width: `${stats.successRate}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="font-sans text-xs text-muted">{stats.totalChats - stats.failedChats} succès</span>
          <span className="font-sans text-xs text-red-500">{stats.failedChats} échecs</span>
        </div>
      </div>

    </div>
  )
}
