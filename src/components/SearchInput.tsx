import { forwardRef, useState } from "react";

type Props = {
  query: string;
  onChange: (value: string) => void;
  onSubmit: () => boolean;
};

const SearchInput = forwardRef<HTMLInputElement, Props>(
  ({ query, onChange, onSubmit }, ref) => {
    const [isShaking, setIsShaking] = useState(false);

    const handleEnter = () => {
      if (!onSubmit()) {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 300);
      }
    }
    
    return (
      <input
        ref={ref}
        className={`search-input ${isShaking ? "shake" : "" }`}
        type="text"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleEnter();
          }
        }}
        placeholder="검색..."
      />
    );
  }
);

export default SearchInput;