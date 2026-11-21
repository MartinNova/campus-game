/**
 * Re-created on every navigation (unlike the layout), so each page fades in
 * softly (fade only, see .page-in in globals.css); off for "reduce motion".
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-in">{children}</div>;
}
