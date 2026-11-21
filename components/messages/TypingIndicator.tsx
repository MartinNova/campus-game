/** "Martin is typing…" with a bubble of three bouncing dots, under the last message. */
export function TypingIndicator({ label }: { label: string | null }) {
  return (
    <div aria-live="polite" className="min-h-0">
      {label && (
        <div className="fade-in flex items-center gap-2">
          <span className="bg-surface flex h-9 items-center gap-1 rounded-[18px] rounded-bl-md px-3.5">
            {[0, 1, 2].map((i) => (
              <span key={i} className="typing-dot bg-muted size-2 rounded-full" aria-hidden />
            ))}
          </span>
          <span className="text-muted text-sm">{label}</span>
        </div>
      )}
    </div>
  );
}
