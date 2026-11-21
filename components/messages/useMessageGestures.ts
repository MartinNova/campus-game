"use client";

import { useRef, useState } from "react";

/** How long to hold a message before its menu opens (like WhatsApp and iMessage). */
const LONG_PRESS_MS = 450;
/** How far to drag a message to the right before letting go replies to it. */
export const SWIPE_REPLY_PX = 60;
/** The bubble stops following the finger (with some resistance) around here. */
const SWIPE_MAX_PX = 90;

interface Gesture {
  id: string;
  x: number;
  y: number;
  timer: ReturnType<typeof setTimeout> | null;
  swiping: boolean;
  dx: number;
}

/**
 * Touch gestures on a chat bubble, like WhatsApp:
 * - hold still → `onLongPress` (the message menu)
 * - drag to the right → the bubble follows; let go past the mark → `onSwipeReply`
 * Moving up or down is scrolling and cancels both.
 */
export function useMessageGestures({
  onLongPress,
  onSwipeReply,
}: {
  onLongPress: (id: string) => void;
  onSwipeReply: (id: string) => void;
}) {
  const gesture = useRef<Gesture | null>(null);
  const swiped = useRef(false);
  /** The bubble being dragged and how far (px), for the animation. */
  const [drag, setDrag] = useState<{ id: string; dx: number } | null>(null);

  function stopTimer() {
    if (gesture.current?.timer) clearTimeout(gesture.current.timer);
    if (gesture.current) gesture.current.timer = null;
  }

  function cancel() {
    stopTimer();
    gesture.current = null;
    setDrag(null);
  }

  function start(e: React.PointerEvent, id: string) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    stopTimer();
    swiped.current = false;
    gesture.current = {
      id,
      x: e.clientX,
      y: e.clientY,
      swiping: false,
      dx: 0,
      timer: setTimeout(() => {
        gesture.current = null;
        navigator.vibrate?.(10);
        onLongPress(id);
      }, LONG_PRESS_MS),
    };
  }

  function move(e: React.PointerEvent) {
    const g = gesture.current;
    if (!g) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (!g.swiping) {
      if (Math.hypot(dx, dy) <= 10) return;
      stopTimer();
      // Mostly sideways and to the right: a swipe. Anything else: scrolling, let it be.
      if (dx > 0 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        g.swiping = true;
        // Keep getting the moves even if the finger leaves the bubble. Throws if the touch
        // already ended; then there is nothing left to follow anyway.
        try {
          (e.currentTarget as Element).setPointerCapture(e.pointerId);
        } catch {}
      } else {
        gesture.current = null;
        return;
      }
    }
    const pulled = Math.max(0, dx);
    const offset =
      pulled <= SWIPE_REPLY_PX
        ? pulled
        : Math.min(SWIPE_MAX_PX, SWIPE_REPLY_PX + (pulled - SWIPE_REPLY_PX) * 0.35);
    // A little tap of the phone when the reply mark is reached, like WhatsApp.
    if (g.dx < SWIPE_REPLY_PX && offset >= SWIPE_REPLY_PX) navigator.vibrate?.(8);
    g.dx = offset;
    setDrag({ id: g.id, dx: offset });
  }

  function end() {
    const g = gesture.current;
    if (g?.swiping) {
      swiped.current = true;
      if (g.dx >= SWIPE_REPLY_PX) onSwipeReply(g.id);
    }
    cancel();
  }

  /** True once right after a swipe, so letting go doesn't also "tap" a picture or link. */
  function consumeSwipe() {
    const was = swiped.current;
    swiped.current = false;
    return was;
  }

  return { start, move, end, cancel, drag, consumeSwipe };
}
