export default function TypingIndicator() {
  return (
    <div className="flex justify-start items-end gap-2 animate-fade-in-up">

      {/* Avatar D */}
      <div className="shrink-0 w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center">
        <span className="font-display font-bold text-sm text-terracotta">D</span>
      </div>

      {/* Bulle */}
      <div className="flex flex-col gap-1">
        <div className="bg-surface border border-border-custom rounded-2xl rounded-tl-sm px-4 py-3">
          <div className="flex items-center gap-1.5 h-4">
            <span className="typing-dot bg-muted" />
            <span className="typing-dot bg-muted" />
            <span className="typing-dot bg-muted" />
          </div>
        </div>
        <span className="text-xs text-muted pl-1">Dagan réfléchit…</span>
      </div>

    </div>
  );
}
