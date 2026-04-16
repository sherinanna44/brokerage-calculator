"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  KeyboardEvent,
} from "react";
import type { CalcInput } from "@/types/calculator";
import { searchStocks, fetchStockQuote, StockSuggestion } from "@/lib/stockApi";

interface Props {
  value: string;
  onSelectStock: (updates: Partial<CalcInput>) => void;
  onPriceLoadingChange?: (loading: boolean) => void;
}

function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

const EXCHANGE_BADGE: Record<string, string> = {
  NSE: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
  BSE: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
};

const TYPE_ICON: Record<string, string> = {
  ETF: "ETF",
  MUTUALFUND: "MF",
  FUTURE: "FUT",
  EQUITY: "",
};

export function StockSearch({ value, onSelectStock, onPriceLoadingChange }: Props) {
  const [inputText, setInputText] = useState(value);
  const [suggestions, setSuggestions] = useState<StockSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(inputText, 280);

  // ── Keep input in sync when parent resets externally ─────────────────────
  useEffect(() => {
    setInputText(value);
  }, [value]);

  // ── Autocomplete search ───────────────────────────────────────────────────
  useEffect(() => {
    setError(null);
    if (debouncedQuery.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    searchStocks(debouncedQuery)
      .then((results) => {
        if (cancelled) return;
        setSuggestions(results);
        setIsOpen(results.length > 0);
        setActiveIndex(-1);
        if (results.length === 0) setError("No results found");
      })
      .catch(() => {
        if (!cancelled) setError("Search failed — try again");
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  // ── Close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  // ── Select a suggestion → fetch price ────────────────────────────────────
  const selectStock = useCallback(
    async (stock: StockSuggestion) => {
      setInputText(stock.name);
      setIsOpen(false);
      setSuggestions([]);
      setError(null);

      // Optimistic update — symbol + reset qty
      onSelectStock({ symbol: stock.name, quantity: 1 });

      setIsFetchingPrice(true);
      onPriceLoadingChange?.(true);

      try {
        const { price } = await fetchStockQuote(stock.ticker);
        if (price !== null) {
          onSelectStock({
            symbol: stock.name,
            buyPrice: parseFloat(price.toFixed(2)),
            sellPrice: parseFloat(price.toFixed(2)),
            quantity: 1,
          });
        } else {
          setError("Price unavailable — enter manually");
        }
      } catch {
        setError("Price fetch failed — enter manually");
      } finally {
        setIsFetchingPrice(false);
        onPriceLoadingChange?.(false);
      }
    },
    [onSelectStock, onPriceLoadingChange]
  );

  // ── Keyboard navigation ───────────────────────────────────────────────────
  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        selectStock(suggestions[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  const isBusy = isSearching || isFetchingPrice;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search icon */}
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
      >
        <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M10 10l4 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>

      <input
        ref={inputRef}
        id="stock-symbol-input"
        type="text"
        value={inputText}
        autoComplete="off"
        spellCheck={false}
        placeholder="Search stock or symbol…"
        aria-label="Search stock"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-activedescendant={
          activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined
        }
        onChange={(e) => {
          const v = e.target.value;
          setInputText(v);
          setError(null);
          if (!v.trim()) {
            onSelectStock({ symbol: "" });
            setSuggestions([]);
            setIsOpen(false);
          }
        }}
        onFocus={() => {
          if (suggestions.length > 0) setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        className="w-full pl-8 pr-8 h-10 rounded-lg border border-gray-200 dark:border-gray-700
          bg-transparent text-gray-900 dark:text-gray-100 text-sm
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
      />

      {/* Spinner */}
      {isBusy && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="animate-spin w-3.5 h-3.5 text-primary-500"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          role="listbox"
          aria-label="Stock suggestions"
          className="absolute top-full mt-1.5 left-0 right-0 z-50
            bg-white dark:bg-gray-900
            border border-gray-200 dark:border-gray-700
            rounded-xl shadow-2xl overflow-hidden
            animate-in fade-in slide-in-from-top-1 duration-100"
        >
          {suggestions.map((s, i) => {
            const isActive = i === activeIndex;
            const typeLabel = TYPE_ICON[s.type] ?? s.type;
            return (
              <div
                key={s.ticker}
                id={`suggestion-${i}`}
                role="option"
                aria-selected={isActive}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectStock(s);
                }}
                onMouseEnter={() => setActiveIndex(i)}
                className={`flex items-center justify-between gap-3 px-4 py-2.5 cursor-pointer transition-colors
                  ${i !== 0 ? "border-t border-gray-100 dark:border-gray-800" : ""}
                  ${isActive
                    ? "bg-primary-50 dark:bg-primary-900/20"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/60"
                  }`}
              >
                {/* Name + ticker */}
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {s.name}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {s.ticker}
                  </span>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {typeLabel && (
                    <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                      {typeLabel}
                    </span>
                  )}
                  {s.exchange && (
                    <span
                      className={`text-xs font-semibold px-1.5 py-0.5 rounded
                        ${EXCHANGE_BADGE[s.exchange] ?? "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"}`}
                    >
                      {s.exchange}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inline error / hint */}
      {!isOpen && error && (
        <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">{error}</p>
      )}
    </div>
  );
}
