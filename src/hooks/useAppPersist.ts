import { useEffect } from "react";

const STORAGE_KEY = "dbSelectionAppState";

export type PersistedAppState = {
  dataSource: "local" | "google";
  googleUrl: string;
  isFullscreen: boolean;
  uiScale: number;
  darkMode: boolean;
  useSystemTheme: boolean;
  selectedIndex: number;
};

export function loadPersistedState(): PersistedAppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function useAppPersist(state: PersistedAppState) {
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);
}