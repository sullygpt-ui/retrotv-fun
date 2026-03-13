"use client";

import { useState, useRef, useEffect } from "react";
import { searchShows } from "@/lib/shows";

interface GuessInputProps {
  onGuess: (show: string) => void;
  onSkip: () => void;
  disabled: boolean;
}

export default function GuessInput({ onGuess, onSkip, disabled }: GuessInputProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSuggestions(searchShows(query));
    setActiveIdx(-1);
  }, [query]);

  const submit = (value: string) => {
    if (!value.trim() || disabled) return;
    onGuess(value.trim());
    setQuery("");
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && suggestions[activeIdx]) {
        submit(suggestions[activeIdx]);
      } else if (query.trim()) {
        submit(query);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative mt-4">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Guess the TV show..."
          className="flex-1 bg-[var(--bg-dark)] border border-[var(--amber-dark)] rounded-lg px-4 py-3 text-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--amber)] disabled:opacity-50"
        />
        <button
          onClick={() => submit(query)}
          disabled={disabled || !query.trim()}
          className="bg-green-600 text-white px-4 py-3 rounded-lg font-retro text-xs hover:bg-green-500 disabled:opacity-50 transition"
        >
          Guess
        </button>
        <button
          onClick={onSkip}
          disabled={disabled}
          className="bg-gray-700 text-gray-300 px-3 py-3 rounded-lg font-retro text-xs hover:bg-gray-600 disabled:opacity-50 transition"
        >
          Skip
        </button>
      </div>
      {showSuggestions && suggestions.length > 0 && !disabled && (
        <div className="autocomplete-list absolute z-50 w-full mt-1">
          {suggestions.map((s, i) => (
            <div
              key={s}
              className={`autocomplete-item text-lg ${i === activeIdx ? "active" : ""}`}
              onMouseDown={() => submit(s)}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
