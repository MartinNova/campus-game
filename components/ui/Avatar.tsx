import Image from "next/image";
import { initials } from "@/lib/profile/profile-rules";

interface AvatarProps {
  firstName: string;
  lastName: string;
  username?: string;
  /** Profile picture URL (Supabase Storage or a data URL); empty = initials. */
  url?: string;
  /** Diameter in pixels. */
  size?: number;
  className?: string;
  /** Green dot: has the app open right now. */
  online?: boolean;
}

/** Round profile picture with an initials fallback, and a green dot while online. */
export function Avatar({ online, ...props }: AvatarProps) {
  if (!online) return <AvatarImage {...props} />;
  const dot = Math.max(10, Math.round((props.size ?? 32) * 0.28));
  return (
    <span className="relative inline-flex shrink-0">
      <AvatarImage {...props} />
      <span
        style={{ width: dot, height: dot }}
        className="presence-dot ring-surface absolute right-0 bottom-0 rounded-full bg-[#34c759] ring-2"
      >
        <span className="sr-only">Online</span>
      </span>
    </span>
  );
}

function AvatarImage({
  firstName,
  lastName,
  username,
  url,
  size = 32,
  className = "",
}: Omit<AvatarProps, "online">) {
  const style = { width: size, height: size, fontSize: Math.max(10, size * 0.38) };
  if (url) {
    return (
      <Image
        // Pictures are already resized to 256 px on upload, so no Next.js optimisation needed.
        unoptimized
        src={url}
        alt=""
        width={size}
        height={size}
        style={style}
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }
  return (
    <span
      aria-hidden
      style={style}
      className={`bg-brand text-brand-foreground flex shrink-0 items-center justify-center rounded-full font-semibold ${className}`}
    >
      {initials(firstName, lastName, username)}
    </span>
  );
}
