"use client";

import { useState } from "react";
import type { CalcInput, Exchange, Segment } from "@/types/calculator";
import { StockSearch } from "@/components/StockSearch";

interface Props {
  input: CalcInput;
  onChange: (updates: Partial<CalcInput>) => void;
}

const SEGMENTS: { id: Segment; label: string }[] = [
  { id: "intraday", label: "For Intraday" },
  { id: "delivery", label: "For Delivery" },
  { id: "mtf", label: "MTF" },
];

export function InputPanel({ input, onChange }: Props) {
  // Track whether buy price was auto-filled from the market so we can show the badge
  const [priceAutoFilled, setPriceAutoFilled] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);

  function handleStockSelect(updates: Partial<CalcInput>) {
    // If updates contain a buyPrice, it means price was fetched successfully
    if (updates.buyPrice !== undefined) {
      setPriceAutoFilled(true);
    }
    onChange(updates);
  }

  function handleBuyPriceChange(raw: string) {
    // User manually typed → clear the auto-filled badge
    setPriceAutoFilled(false);
    onChange({ buyPrice: parseFloat(raw) || 0 });
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
      {/* ── Input fields ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        {/* Symbol / Stock Search */}
        <div className="lg:col-span-2 flex flex-col gap-1">
          <label
            htmlFor="stock-symbol-input"
            className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase"
          >
            Stock / Symbol
          </label>
          <StockSearch
            value={input.symbol}
            onSelectStock={handleStockSelect}
            onPriceLoadingChange={setPriceLoading}
          />
        </div>

        {/* Buy Price */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="buy-price-input"
              className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase"
            >
              Buy Price (₹)
            </label>

            {/* Live price badge */}
            {priceLoading ? (
              <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                <svg className="animate-spin w-2.5 h-2.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                LTP…
              </span>
            ) : priceAutoFilled ? (
              <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse inline-block" />
                Live
              </span>
            ) : null}
          </div>

          <input
            id="buy-price-input"
            type="number"
            min={0}
            step={0.05}
            value={input.buyPrice || ""}
            placeholder="0.00"
            onChange={(e) => handleBuyPriceChange(e.target.value)}
            className="h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700
              bg-transparent text-gray-900 dark:text-gray-100 text-sm
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
          />
        </div>

        {/* Sell Price */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="sell-price-input"
            className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase"
          >
            Sell Price (₹)
          </label>
          <input
            id="sell-price-input"
            type="number"
            min={0}
            step={0.05}
            value={input.sellPrice || ""}
            placeholder="0.00"
            onChange={(e) =>
              onChange({ sellPrice: parseFloat(e.target.value) || 0 })
            }
            className="h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700
              bg-transparent text-gray-900 dark:text-gray-100 text-sm
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
          />
        </div>

        {/* Quantity */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="quantity-input"
            className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase"
          >
            Quantity
          </label>
          <input
            id="quantity-input"
            type="number"
            min={1}
            step={1}
            value={input.quantity}
            onChange={(e) =>
              onChange({ quantity: parseInt(e.target.value) || 1 })
            }
            className="h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700
              bg-transparent text-gray-900 dark:text-gray-100 text-sm
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
          />
        </div>
      </div>

      {/* ── Segment + Exchange row ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2 flex-wrap">
          {SEGMENTS.map((seg) => (
            <button
              key={seg.id}
              id={`segment-${seg.id}`}
              onClick={() => onChange({ segment: seg.id })}
              className={`px-4 py-1.5 rounded-full border text-sm transition-all duration-150
                ${
                  input.segment === seg.id
                    ? "border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 font-semibold"
                    : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
            >
              {seg.label}
            </button>
          ))}
        </div>

        {/* Exchange toggle */}
        <div className="flex h-9 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {(["NSE", "BSE"] as Exchange[]).map((ex) => (
            <button
              key={ex}
              id={`exchange-${ex.toLowerCase()}`}
              onClick={() => onChange({ exchange: ex })}
              className={`flex items-center gap-2 px-4 text-sm font-medium transition-all duration-150
                ${
                  input.exchange === ex
                    ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                    : "text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
            >
              <span
                className={`w-2 h-2 rounded-full bg-primary-500`}
              />
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
