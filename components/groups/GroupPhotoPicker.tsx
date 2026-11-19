"use client";

import { Camera } from "lucide-react";
import { useRef } from "react";
import { squareAvatar } from "@/lib/profile/avatar";
import { GroupAvatar } from "./GroupAvatar";

interface GroupPhotoPickerProps {
  name: string;
  photoUrl: string | null;
  size?: number;
  /** Square 256 px JPEG of the picked picture. */
  onPick: (photo: Blob) => void;
  onError: (message: string) => void;
}

/** Tap the round group picture to choose a new one (camera or library on phones). */
export function GroupPhotoPicker({
  name,
  photoUrl,
  size = 96,
  onPick,
  onError,
}: GroupPhotoPickerProps) {
  const input = useRef<HTMLInputElement>(null);

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      onPick(await squareAvatar(file));
    } catch (err) {
      onError(err instanceof Error ? err.message : "Could not use this picture.");
    }
  }

  return (
    <>
      <input
        ref={input}
        type="file"
        accept="image/*"
        onChange={pick}
        className="hidden"
        aria-hidden
        tabIndex={-1}
      />
      <button
        type="button"
        onClick={() => input.current?.click()}
        aria-label={photoUrl ? "Change group picture" : "Add group picture"}
        className="focus-visible:outline-brand relative rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-95"
      >
        <GroupAvatar name={name} photoUrl={photoUrl} size={size} />
        <span className="bg-surface text-brand ring-background absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full ring-2">
          <Camera className="size-4" aria-hidden />
        </span>
      </button>
    </>
  );
}
