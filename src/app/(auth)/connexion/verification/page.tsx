import Link from "next/link"

export default function VerificationPage() {
  return (
    <div className="w-full max-w-md text-center">
      <div className="bg-white rounded-2xl border border-border-custom shadow-sm px-8 py-10">

        {/* Icone */}
        <div className="w-16 h-16 bg-terracotta/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <i className="fi fi-rr-envelope text-terracotta text-2xl" aria-hidden="true" />
        </div>

        <h1 className="font-display font-bold text-dark text-xl mb-3">
          Vérifiez votre boite mail
        </h1>
        <p className="font-sans text-muted text-sm leading-relaxed mb-6">
          Un lien de connexion sécurisé vient d&apos;être envoyé à votre adresse email.
          Cliquez sur le lien pour accéder à Dagan Gestion.
        </p>

        {/* Info box */}
        <div className="bg-surface rounded-xl px-5 py-4 mb-6 text-left">
          <div className="flex items-start gap-3">
            <i className="fi fi-rr-info text-terracotta text-sm mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-sans text-xs text-dark font-medium mb-1">À savoir</p>
              <ul className="font-sans text-xs text-muted space-y-1">
                <li>Le lien expire dans <strong className="text-dark">24 heures</strong></li>
                <li>Vérifiez aussi vos courriers indésirables</li>
                <li>Le lien ne peut être utilisé qu&apos;une seule fois</li>
              </ul>
            </div>
          </div>
        </div>

        <Link
          href="/connexion"
          className="inline-flex items-center gap-2 font-display font-semibold text-sm text-terracotta hover:text-[#a33a0c] transition-colors"
        >
          <i className="fi fi-rr-arrow-left text-xs" aria-hidden="true" />
          Retour à la connexion
        </Link>
      </div>
    </div>
  )
}
