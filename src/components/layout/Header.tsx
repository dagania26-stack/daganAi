// Motif Kente discret en CSS pur (grille + diagonales, opacité 0.08-0.10)
const KENTE_PATTERN = [
  "repeating-linear-gradient(0deg,   transparent, transparent 5px, rgba(255,255,255,0.07) 5px, rgba(255,255,255,0.07) 6px)",
  "repeating-linear-gradient(90deg,  transparent, transparent 5px, rgba(255,255,255,0.07) 5px, rgba(255,255,255,0.07) 6px)",
  "repeating-linear-gradient(45deg,  transparent, transparent 9px, rgba(212,160,23,0.09)  9px, rgba(212,160,23,0.09)  10px)",
  "repeating-linear-gradient(-45deg, transparent, transparent 9px, rgba(212,160,23,0.09)  9px, rgba(212,160,23,0.09)  10px)",
].join(", ");

export default function Header() {
  return (
    <header
      className="sticky top-0 z-50 w-full bg-terracotta shadow-sm"
      style={{ backgroundImage: KENTE_PATTERN }}
    >
      <div className="mx-auto max-w-2xl px-4 h-14 md:h-16 flex items-center justify-between">

        {/* Logo + tagline */}
        <div className="flex flex-col leading-none">
          <span className="font-display font-extrabold text-xl text-white tracking-tight">
            Dagan IA
          </span>
          <span className="hidden sm:block text-xs text-white/70 italic font-sans mt-0.5">
            Grande Sœur Numérique
          </span>
        </div>


      </div>
    </header>
  );
}
