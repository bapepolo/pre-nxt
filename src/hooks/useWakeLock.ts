import { useEffect, useRef } from "react";

export function useWakeLock(enabled: boolean) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const isSupported =
    typeof navigator !== "undefined" &&
    "wakeLock" in navigator &&
    typeof navigator.wakeLock.request === "function";

  const requestWakeLock = async () => {
    if (!isSupported) return;

    // 중복 요청 방지
    if (wakeLockRef.current) return;

    try {
      const sentinel = await navigator.wakeLock.request("screen");
      wakeLockRef.current = sentinel;

      console.log("🔒 Wake Lock active");

      sentinel.addEventListener("release", () => {
        console.log("Wake Lock released by browser");

        wakeLockRef.current = null;

        // Safari는 탭 전환 등에서 자동 release함
        if (enabled && document.visibilityState === "visible") {
          requestWakeLock();
        }
      });
    } catch (err) {
      console.error("Wake Lock error:", err);
    }
  };

  const releaseWakeLock = async () => {
    try {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log("🔓 Wake Lock manually released");
      }
    } catch (err) {
      console.error("Wake Lock release error:", err);
    }
  };

  useEffect(() => {
    if (!isSupported) {
      console.log("Wake Lock not supported in this browser");
      return;
    }

    if (enabled) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        enabled &&
        !wakeLockRef.current
      ) {
        requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      releaseWakeLock();
    };
  }, [enabled]);

  return {
    isSupported,
  };
}