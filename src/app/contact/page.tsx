"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Navbar from "@/components/layout/Navbar";

const SUJETS = [
  "Question générale",
  "Signaler un problème",
  "Partenariat",
  "Presse & médias",
  "Autre",
] as const;

interface FormState {
  nom:     string;
  email:   string;
  sujet:   string;
  message: string;
}

const INITIAL: FormState = { nom: "", email: "", sujet: "", message: "" };

export default function ContactPage() {
  const [form,      setForm]      = useState<FormState>(INITIAL);
  const [sent,      setSent]      = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [fieldErr,  setFieldErr]  = useState<Partial<FormState>>({});

  function validate(): boolean {
    const err: Partial<FormState> = {};
    if (!form.nom.trim())                          err.nom     = "Ton nom est requis.";
    if (!form.email.includes("@"))                 err.email   = "Email invalide.";
    if (!form.sujet)                               err.sujet   = "Choisis un sujet.";
    if (form.message.trim().length < 20)           err.message = "Message trop court (20 caractères min).";
    setFieldErr(err);
    return Object.keys(err).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    // Simulation d'envoi (à connecter à une API email)
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
  }

  const field = (key: keyof FormState) => ({
    value:    form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  return (
    <div className="min-h-screen bg-warm-white flex flex-col">
      <Navbar />

      {/* Header page */}
      <div className="bg-surface border-b border-border-custom">
        <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
          <div className="flex items-center gap-2 text-terracotta font-display text-xs font-bold uppercase tracking-wider mb-3">
            <i className="fi fi-rr-envelope text-sm" aria-hidden="true" />
            Nous contacter
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-dark mb-2">
            Une question ? Un partenariat ?
          </h1>
          <p className="font-sans text-muted text-base max-w-lg">
            L&apos;équipe Dagan IA est disponible pour répondre à vos questions.
            Nous répondons généralement sous 48 heures.
          </p>
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 mx-auto max-w-5xl px-4 py-12 w-full grid grid-cols-1 md:grid-cols-5 gap-10">

        {/* Formulaire */}
        <div className="md:col-span-3">
          {sent ? (
            <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-surface rounded-2xl border border-border-custom gap-5">
              <div className="w-14 h-14 rounded-full bg-forest/10 flex items-center justify-center">
                <i className="fi fi-rr-check-circle text-forest text-2xl" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-display font-bold text-xl text-dark mb-2">
                  Message envoyé !
                </h2>
                <p className="text-muted font-sans text-sm">
                  Merci {form.nom.split(" ")[0]}. Nous reviendrons vers vous sous 48 heures.
                </p>
              </div>
              <button
                onClick={() => { setForm(INITIAL); setSent(false); }}
                className="font-display text-sm text-terracotta hover:underline"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

              {/* Nom */}
              <div className="flex flex-col gap-1.5">
                <label className="font-display text-sm font-semibold text-dark" htmlFor="nom">
                  Nom complet <span className="text-terracotta">*</span>
                </label>
                <input
                  id="nom"
                  type="text"
                  placeholder="Akoua Mensah"
                  {...field("nom")}
                  className={cn(
                    "font-sans text-sm bg-surface border rounded-xl px-4 py-3 min-h-[44px] text-dark",
                    "placeholder:text-muted focus:outline-none focus:ring-1 focus:border-terracotta focus:ring-terracotta",
                    "transition-colors duration-150",
                    fieldErr.nom ? "border-red-400" : "border-border-custom",
                  )}
                />
                {fieldErr.nom && <p className="text-xs text-red-500">{fieldErr.nom}</p>}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="font-display text-sm font-semibold text-dark" htmlFor="email">
                  Adresse email <span className="text-terracotta">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="akoua@example.com"
                  {...field("email")}
                  className={cn(
                    "font-sans text-sm bg-surface border rounded-xl px-4 py-3 min-h-[44px] text-dark",
                    "placeholder:text-muted focus:outline-none focus:ring-1 focus:border-terracotta focus:ring-terracotta",
                    "transition-colors duration-150",
                    fieldErr.email ? "border-red-400" : "border-border-custom",
                  )}
                />
                {fieldErr.email && <p className="text-xs text-red-500">{fieldErr.email}</p>}
              </div>

              {/* Sujet */}
              <div className="flex flex-col gap-1.5">
                <label className="font-display text-sm font-semibold text-dark" htmlFor="sujet">
                  Sujet <span className="text-terracotta">*</span>
                </label>
                <select
                  id="sujet"
                  {...field("sujet")}
                  className={cn(
                    "font-sans text-sm bg-surface border rounded-xl px-4 py-3 min-h-[44px] text-dark",
                    "focus:outline-none focus:ring-1 focus:border-terracotta focus:ring-terracotta",
                    "transition-colors duration-150",
                    !form.sujet && "text-muted",
                    fieldErr.sujet ? "border-red-400" : "border-border-custom",
                  )}
                >
                  <option value="" disabled>Choisir un sujet</option>
                  {SUJETS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {fieldErr.sujet && <p className="text-xs text-red-500">{fieldErr.sujet}</p>}
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label className="font-display text-sm font-semibold text-dark" htmlFor="message">
                  Message <span className="text-terracotta">*</span>
                </label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="Décris ta question ou demande en détail..."
                  {...field("message")}
                  className={cn(
                    "font-sans text-sm bg-surface border rounded-xl px-4 py-3 text-dark resize-none",
                    "placeholder:text-muted focus:outline-none focus:ring-1 focus:border-terracotta focus:ring-terracotta",
                    "transition-colors duration-150",
                    fieldErr.message ? "border-red-400" : "border-border-custom",
                  )}
                />
                <div className="flex items-center justify-between">
                  {fieldErr.message
                    ? <p className="text-xs text-red-500">{fieldErr.message}</p>
                    : <span />}
                  <span className="text-xs text-muted tabular-nums">
                    {form.message.length}/1000
                  </span>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "inline-flex items-center justify-center gap-2",
                  "bg-terracotta text-white font-display font-semibold",
                  "px-6 py-3.5 rounded-xl min-h-[48px] text-base",
                  "hover:bg-[#a33a0c] active:scale-95 transition-all duration-150",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                )}
              >
                {loading ? (
                  <>
                    <i className="fi fi-rr-rotate-right animate-spin text-sm" aria-hidden="true" />
                    Envoi en cours…
                  </>
                ) : (
                  <>
                    <i className="fi fi-rr-paper-plane text-sm" aria-hidden="true" />
                    Envoyer le message
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Infos de contact */}
        <aside className="md:col-span-2 flex flex-col gap-6">

          {[
            {
              icon: "fi-rr-envelope",
              titre: "Email",
              contenu: "contact@dagan-ia.tg",
              lien: "mailto:contact@dagan-ia.tg",
            },
            {
              icon: "fi-rr-marker",
              titre: "Localisation",
              contenu: "Lomé, Togo\nCotonou, Bénin",
              lien: null,
            },
            {
              icon: "fi-rr-clock",
              titre: "Temps de réponse",
              contenu: "Sous 48 heures ouvrées",
              lien: null,
            },
          ].map(({ icon, titre, contenu, lien }) => (
            <div key={titre} className="flex items-start gap-4 p-4 bg-surface rounded-xl border border-border-custom">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-terracotta/10 flex items-center justify-center">
                <i className={`fi ${icon} text-terracotta text-base`} aria-hidden="true" />
              </div>
              <div>
                <p className="font-display font-semibold text-dark text-sm">{titre}</p>
                {lien ? (
                  <a href={lien} className="font-sans text-muted text-sm hover:text-terracotta transition-colors">
                    {contenu}
                  </a>
                ) : (
                  <p className="font-sans text-muted text-sm whitespace-pre-line">{contenu}</p>
                )}
              </div>
            </div>
          ))}

          {/* Lien vers le chat */}
          <div className="p-5 bg-terracotta/5 border border-terracotta/20 rounded-xl">
            <p className="font-display font-semibold text-dark text-sm mb-1">
              Une question urgente ?
            </p>
            <p className="font-sans text-muted text-xs mb-3">
              Dagan IA répond immédiatement à vos questions juridiques et fiscales.
            </p>
            <Link
              href="/chat"
              className="inline-flex items-center gap-1.5 text-terracotta font-display font-semibold text-sm hover:underline"
            >
              <i className="fi fi-rr-comment-alt text-xs" aria-hidden="true" />
              Ouvrir le chat
            </Link>
          </div>
        </aside>
      </div>

      {/* Footer minimal */}
      <footer className="border-t border-border-custom py-6 bg-surface">
        <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-sans text-xs text-muted">
            &copy; {new Date().getFullYear()} Dagan IA
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {[
              { href: "/",               label: "Accueil"          },
              { href: "/chat",           label: "Chat IA"          },
              { href: "/a-propos",       label: "À propos"         },
              { href: "/contact",        label: "Contact"          },
              { href: "/confidentialite", label: "Confidentialité" },
              { href: "/conditions",     label: "Conditions"       },
            ].map(({ href, label }) => (
              <Link key={href} href={href} className="font-sans text-xs text-muted hover:text-dark transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
