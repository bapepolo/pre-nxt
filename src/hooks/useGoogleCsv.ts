import { useState } from "react";
import { getPeopleFromGoogle } from "../services/csvService";

export function useGoogleCsv(initialUrl: string = "") {
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateUrl = (value: string) => {
    try {
      const parsed = new URL(value);

      // check https
      if (parsed.protocol !== "https:") return false;

      // check google domain 
      if (!parsed.hostname.includes("google.com")) return false;

      // check csv output
      if (parsed.searchParams.get("output") !== "csv") return false;

      return true;
    } catch {
      return false;
    }
  };

  const load = async () => {
    setError(null);

    if (!validateUrl(url)) {
      setError("유효한 Google CSV 게시 링크가 아닙니다.");
      return null;
    }

    try {
      setIsLoading(true);
      const data = await getPeopleFromGoogle(url);
      return data;
    } catch {
      setError("CSV를 불러오지 못했습니다.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    url,
    setUrl,
    error,
    isLoading,
    load,
  };
}