/** "Martin is typing…" with three bouncing dots, like iMessage. */
export function TypingBubble({ name }: { name: string }) {
  return (
    <div className="fade-in flex items-center gap-2 justify-self-start">
      <span
        className="bg-surface border-border flex items-center gap-1 rounded-2xl rounded-bl-md border px-3.5 py-3"
        aria-hidden
      >
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="typing-dot bg-muted size-1.5 rounded-full"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </span>
      <span className="text-muted text-xs" role="status">
        {name} is typing…
      </span>
    </div>
  );
}
