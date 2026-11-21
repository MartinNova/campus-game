/**
 * Re-created on every navigation (unlike the layout), so each page fades and slides in
 * softly. See .page-in in globals.css; off for "reduce motion".
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-in">{children}</div>;
}
