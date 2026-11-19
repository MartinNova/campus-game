import { Users } from "lucide-react";
import Image from "next/image";

interface GroupAvatarProps {
  name: string;
  photoUrl: string | null;
  /** Diameter in pixels. */
  size?: number;
}

/** Round group picture; without one, a navy circle with a people icon (like WhatsApp). */
export function GroupAvatar({ name, photoUrl, size = 48 }: GroupAvatarProps) {
  const style = { width: size, height: size };
  if (photoUrl) {
    return (
      <Image
        // Group pictures are already cropped and resized to 256 px before upload.
        unoptimized
        src={photoUrl}
        alt=""
        width={size}
        height={size}
        style={style}
        className="shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <span
      aria-hidden
      title={name}
      style={style}
      className="bg-brand text-brand-foreground flex shrink-0 items-center justify-center rounded-full"
    >
      <Users style={{ width: size * 0.48, height: size * 0.48 }} strokeWidth={2} />
    </span>
  );
}
