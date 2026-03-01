import { useEffect, useRef } from "react";

export function useAutoHideCursor(
  isFullscreen: boolean,
  delay: number = 2000
) {
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isFullscreen) {
      document.body.classList.remove("hide-cursor");
      return;
    }

    const hideCursor = () => {
      document.body.classList.add("hide-cursor");
    };

    const showCursor = () => {
      document.body.classList.remove("hide-cursor");

      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }

      timerRef.current = window.setTimeout(hideCursor, delay);
    };

    // 처음 진입 시 타이머 시작
    timerRef.current = window.setTimeout(hideCursor, delay);

    window.addEventListener("mousemove", showCursor);
    window.addEventListener("mousedown", showCursor);
    window.addEventListener("keydown", showCursor);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      document.body.classList.remove("hide-cursor");
      window.removeEventListener("mousemove", showCursor);
      window.removeEventListener("mousedown", showCursor);
      window.removeEventListener("keydown", showCursor);
    };
  }, [isFullscreen, delay]);
}