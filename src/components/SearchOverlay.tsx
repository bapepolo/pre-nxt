import { useRef, useEffect, useState } from "react";

type Props = {
  query: string;
  setQuery: (v: string) => void;
  onSubmit: () => boolean;
  onClose: () => void;
};

export default function SearchOverlay({
  query,
  setQuery,
  onSubmit,
  onClose,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleEnter = () => {
    if (onSubmit()) {
      onClose();
    } else {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 300);
    }
  }

  return (
    <div
      className="container__search-overlay"
      onMouseDown={() => onClose()}
    >
      <input
        ref={inputRef}
        className={`container__overlay-input ${isShaking ? "shake" : ""}`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.stopPropagation();
            handleEnter();
          }
        }}
        placeholder="검색..."
      />
    </div>
  );
}