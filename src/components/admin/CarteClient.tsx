"use client"

import { useState, useEffect } from "react"

// Coordonnées des capitales par code pays (projection équirectangulaire)
const COUNTRY_COORDS: Record<string, { lat: number; lng: number; name: string }> = {
  TG: { lat:  6.14,  lng:  1.22,  name: "Togo"          },
  BJ: { lat:  6.37,  lng:  2.42,  name: "Bénin"         },
  SN: { lat: 14.69,  lng: -17.44, name: "Sénégal"        },
  CI: { lat:  5.35,  lng: -4.00,  name: "Côte d'Ivoire" },
  GH: { lat:  5.55,  lng: -0.20,  name: "Ghana"          },
  ML: { lat: 12.65,  lng: -8.00,  name: "Mali"           },
  BF: { lat: 12.37,  lng: -1.53,  name: "Burkina Faso"  },
  NG: { lat:  9.06,  lng:  7.50,  name: "Nigeria"        },
  CM: { lat:  3.87,  lng: 11.52,  name: "Cameroun"       },
  GA: { lat:  0.39,  lng:  9.45,  name: "Gabon"          },
  CD: { lat: -4.32,  lng: 15.32,  name: "Congo DRC"      },
  FR: { lat: 48.85,  lng:  2.35,  name: "France"         },
  BE: { lat: 50.85,  lng:  4.35,  name: "Belgique"       },
  CH: { lat: 46.95,  lng:  7.45,  name: "Suisse"         },
  CA: { lat: 45.42,  lng: -75.70, name: "Canada"         },
  US: { lat: 38.89,  lng: -77.04, name: "États-Unis"     },
  MA: { lat: 33.99,  lng: -6.85,  name: "Maroc"          },
  DZ: { lat: 36.74,  lng:  3.06,  name: "Algérie"        },
  TN: { lat: 36.82,  lng: 10.17,  name: "Tunisie"        },
}

function mercatorX(lng: number): string {
  return `${((lng + 180) / 360) * 100}%`
}
function mercatorY(lat: number): string {
  return `${((90 - lat) / 180) * 100}%`
}

function getColor(lastLogin: string | null): string {
  if (!lastLogin) return "#9CA3AF"  // gris — jamais connecté
  const days = (Date.now() - new Date(lastLogin).getTime()) / 86400_000
  if (days <= 7)  return "#22C55E"  // vert — actif
  if (days <= 30) return "#F59E0B"  // orange — inactif
  return "#9CA3AF"                  // gris — dormant
}

interface UserGeo {
  id:        string
  name:      string | null
  email:     string | null
  pays:      string | null
  lastLogin: string | null
}

export default function CarteClient() {
  const [users,   setUsers]   = useState<UserGeo[]>([])
  const [loading, setLoading] = useState(true)
  const [hover,   setHover]   = useState<string | null>(null)
  const [filter,  setFilter]  = useState<"all" | "active" | "inactive" | "dormant">("all")

  useEffect(() => {
    fetch("/api/admin/users?limit=500")
      .then(r => r.json())
      .then(d => { setUsers(d.users ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  function getDaysSince(lastLogin: string | null): number {
    if (!lastLogin) return Infinity
    return (Date.now() - new Date(lastLogin).getTime()) / 86400_000
  }

  const filtered = users.filter(u => {
    if (!u.pays) return false
    const days = getDaysSince(u.lastLogin)
    if (filter === "active")   return days <= 7
    if (filter === "inactive") return days > 7 && days <= 30
    if (filter === "dormant")  return days > 30 || !u.lastLogin
    return true
  })

  // Regrouper par pays
  const byPays = filtered.reduce((acc, u) => {
    if (!u.pays) return acc
    if (!acc[u.pays]) acc[u.pays] = []
    acc[u.pays].push(u)
    return acc
  }, {} as Record<string, UserGeo[]>)

  // Stats globales
  const activeCount   = users.filter(u => getDaysSince(u.lastLogin) <= 7).length
  const inactiveCount = users.filter(u => { const d = getDaysSince(u.lastLogin); return d > 7 && d <= 30 }).length
  const dormantCount  = users.filter(u => getDaysSince(u.lastLogin) > 30 || !u.lastLogin).length

  return (
    <div className="p-6 lg:p-8 space-y-5">

      <div>
        <h1 className="font-display font-bold text-dark text-2xl">Cartographie</h1>
        <p className="font-sans text-muted text-sm mt-0.5">
          Distribution géographique des {users.length} utilisateurs
        </p>
      </div>

      {/* Légende + filtres */}
      <div className="flex flex-wrap gap-3">
        {[
          { key: "all",      label: `Tous (${users.filter(u => u.pays).length})`,     color: "#6B4F3A" },
          { key: "active",   label: `Actifs 7j (${activeCount})`,   color: "#22C55E" },
          { key: "inactive", label: `Inactifs 30j (${inactiveCount})`, color: "#F59E0B" },
          { key: "dormant",  label: `Dormants (${dormantCount})`,   color: "#9CA3AF" },
        ].map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setFilter(key as typeof filter)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-display font-semibold text-sm border transition-all ${
              filter === key
                ? "border-terracotta bg-terracotta/5 text-terracotta"
                : "border-border-custom text-muted hover:border-terracotta/30"
            }`}
          >
            <span className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
            {label}
          </button>
        ))}
      </div>

      {/* Carte monde */}
      <div className="bg-white rounded-2xl border border-border-custom overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="w-6 h-6 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="relative" style={{ paddingBottom: "50%" }}>
            {/* Fond carte du monde */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/2000px-World_map_-_low_resolution.svg.png"
              alt="Carte du monde"
              className="absolute inset-0 w-full h-full object-cover opacity-20"
            />

            {/* Fond coloré */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#EBE5DF] to-[#F5F0EB]" />

            {/* Continent overlay pour meilleur contraste */}
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/2000px-World_map_-_low_resolution.svg.png"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-40"
            />

            {/* Points utilisateurs par pays */}
            {Object.entries(byPays).map(([code, usrs]) => {
              const coords = COUNTRY_COORDS[code]
              if (!coords) return null
              const isHovered = hover === code
              const color     = getColor(usrs[0]?.lastLogin ?? null)

              return (
                <div
                  key={code}
                  style={{
                    position:  "absolute",
                    left:      mercatorX(coords.lng),
                    top:       mercatorY(coords.lat),
                    transform: "translate(-50%, -50%)",
                    zIndex:    isHovered ? 10 : 5,
                  }}
                  onMouseEnter={() => setHover(code)}
                  onMouseLeave={() => setHover(null)}
                  className="cursor-pointer"
                >
                  {/* Pulse ring */}
                  {isHovered && (
                    <span
                      className="absolute rounded-full animate-ping"
                      style={{
                        width:  24, height: 24,
                        top: -4, left: -4,
                        background: color,
                        opacity: 0.4,
                      }}
                    />
                  )}

                  {/* Dot */}
                  <div
                    className="rounded-full border-2 border-white shadow-md flex items-center justify-center font-display font-bold text-white transition-all"
                    style={{
                      width:      isHovered ? 36 : usrs.length > 5 ? 28 : 20,
                      height:     isHovered ? 36 : usrs.length > 5 ? 28 : 20,
                      background: color,
                      fontSize:   isHovered ? 11 : 9,
                    }}
                  >
                    {usrs.length}
                  </div>

                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 pointer-events-none">
                      <div className="bg-dark text-white rounded-xl px-3 py-2 text-xs shadow-xl whitespace-nowrap font-sans">
                        <p className="font-display font-semibold text-sm">{coords.name}</p>
                        <p className="text-white/70">{usrs.length} utilisateur{usrs.length > 1 ? "s" : ""}</p>
                        {usrs.slice(0, 3).map(u => (
                          <p key={u.id} className="text-white/50 truncate max-w-[180px]">{u.email}</p>
                        ))}
                        {usrs.length > 3 && <p className="text-white/40">+{usrs.length - 3} autres</p>}
                      </div>
                      <div className="w-2 h-2 bg-dark rotate-45 mx-auto -mt-1" />
                    </div>
                  )}
                </div>
              )
            })}

            {/* Message si aucun pays géolocalisé */}
            {Object.keys(byPays).length === 0 && !loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center bg-white/80 rounded-2xl px-6 py-4 backdrop-blur-sm">
                  <i className="fi fi-rr-map-marker text-muted text-2xl mb-2 block" />
                  <p className="font-display font-semibold text-dark text-sm">Aucune localisation disponible</p>
                  <p className="font-sans text-muted text-xs mt-1">Renseignez le pays des utilisateurs dans le CRM</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table récap par pays */}
      {Object.keys(byPays).length > 0 && (
        <div className="bg-white rounded-2xl border border-border-custom overflow-hidden">
          <div className="px-5 py-4 border-b border-border-custom">
            <h2 className="font-display font-semibold text-dark text-base">Répartition par pays</h2>
          </div>
          <div className="divide-y divide-border-custom">
            {Object.entries(byPays)
              .sort((a, b) => b[1].length - a[1].length)
              .map(([code, usrs]) => {
                const cfg = COUNTRY_COORDS[code]
                const pct = Math.round((usrs.length / users.length) * 100)
                return (
                  <div key={code} className="flex items-center gap-4 px-5 py-3">
                    <div className="w-10 font-display font-bold text-dark text-sm">{code}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-sans text-sm text-dark">{cfg?.name ?? code}</span>
                        <span className="font-display font-semibold text-dark text-sm">{usrs.length}</span>
                      </div>
                      <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                        <div className="h-full bg-terracotta rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="w-10 text-right font-sans text-xs text-muted">{pct}%</div>
                  </div>
                )
              })
            }
          </div>
        </div>
      )}
    </div>
  )
}
