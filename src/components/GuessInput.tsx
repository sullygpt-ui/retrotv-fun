"use client";

import { useId, useMemo, useState } from "react";
import { SKIP } from "@/lib/matching";
import { searchShows } from "@/lib/shows";

interface GuessInputProps {
  onGuess: (show: string) => void;
  disabled: boolean;
}

export default function GuessInput({ onGuess, disabled }: GuessInputProps) {
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(-1);
  const [open, setOpen] = useState(false);
  const [confirmSkip, setConfirmSkip] = useState(false);
  const listId = useId();

  const suggestions = useMemo(() => searchShows(query), [query]);

  const submit = (value: string) => {
    if (!value.trim() || disabled) return;
    onGuess(value.trim());
    setQuery("");
    setOpen(false);
    setConfirmSkip(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && activeIdx >= 0 && suggestions[activeIdx]) submit(suggestions[activeIdx]);
      else if (query.trim()) submit(query);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showList = open && suggestions.length > 0 && !disabled;

  return (
    <div className="relative mt-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIdx(-1);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Guess the TV show..."
          aria-label="Guess the TV show"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            showList && activeIdx >= 0 ? `${listId}-opt-${activeIdx}` : undefined
          }
          autoComplete="off"
          className="flex-1 bg-[var(--bg-dark)] border border-[var(--amber-dark)] rounded-lg px-4 py-3 text-lg text-white placeholder-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] focus:border-[var(--amber)] disabled:opacity-50"
        />
        <button
          onClick={() => submit(query)}
          disabled={disabled || !query.trim()}
          className="bg-green-600 text-white px-4 py-3 rounded-lg font-retro text-xs hover:bg-green-500 focus-visible:ring-2 focus-visible:ring-white disabled:opacity-50 transition"
        >
          Guess
        </button>
        <button
          onClick={() => (confirmSkip ? submit(SKIP) : setConfirmSkip(true))}
          onBlur={() => setConfirmSkip(false)}
          disabled={disabled}
          title="Reveals the next frame and uses up one of your six guesses"
          className="bg-gray-700 text-gray-300 px-3 py-3 rounded-lg font-retro text-[10px] hover:bg-gray-600 focus-visible:ring-2 focus-visible:ring-white disabled:opacity-50 transition whitespace-nowrap"
        >
          {confirmSkip ? "Uses a guess — tap again" : "Skip"}
        </button>
      </div>

      <ul
        id={listId}
        role="listbox"
        aria-label="Show suggestions"
        className={`autocomplete-list absolute z-50 w-full mt-1 ${showList ? "" : "hidden"}`}
      >
        {suggestions.map((s, i) => (
          <li
            key={s}
            id={`${listId}-opt-${i}`}
            role="option"
            aria-selected={i === activeIdx}
            className={`autocomplete-item text-lg ${i === activeIdx ? "active" : ""}`}
            // pointerdown fires before blur, so the list is still mounted on tap
            onPointerDown={(e) => {
              e.preventDefault();
              submit(s);
            }}
          >
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
