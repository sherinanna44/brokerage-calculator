"use client";

import { useState, useMemo } from "react";
import type { CalcInput } from "@/types/calculator";
import { calculateBrokerage } from "@/lib/calculations";
import { InstrumentTabs } from "@/components/InstrumentTabs";
import { InputPanel } from "@/components/InputPanel";
import { SummaryCards } from "@/components/SummaryCards";
import { ChargesTable } from "@/components/ChargesTable";

const DEFAULT_INPUT: CalcInput = {
  symbol: "",
  buyPrice: 0,
  sellPrice: 0,
  quantity: 1,
  exchange: "NSE",
  instrument: "equity",
  segment: "intraday",
};

export default function CalculatorPage() {
  const [input, setInput] = useState<CalcInput>(DEFAULT_INPUT);

  const result = useMemo(() => calculateBrokerage(input), [input]);

  const hasValues = input.buyPrice > 0;

  function handleChange(updates: Partial<CalcInput>) {
    setInput((prev) => ({ ...prev, ...updates }));
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="8" width="3" height="7" fill="white" rx="0.5" />
                <rect x="6" y="5" width="3" height="10" fill="white" rx="0.5" />
                <rect x="11" y="2" width="3" height="13" fill="white" rx="0.5" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-none">
                Brokerage Calculator
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Indian Markets · NSE / BSE
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-primary-500 inline-block animate-pulse" />
            Live Estimates
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* ── Title ─────────────────────────────────────────────────────── */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Calculate your Brokerage
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Search a stock to auto-fill the live price, then adjust quantity &amp; prices to see exact charges.
          </p>
        </div>

        {/* ── Instrument tabs ───────────────────────────────────────────── */}
        <InstrumentTabs
          value={input.instrument}
          onChange={(instrument) => handleChange({ instrument })}
        />

        {/* ── Inputs ────────────────────────────────────────────────────── */}
        <InputPanel input={input} onChange={handleChange} />

        {/* ── Results ───────────────────────────────────────────────────── */}
        {hasValues ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                Transaction Summary
              </p>
              <SummaryCards result={result} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                Charges Breakdown
              </p>
              <ChargesTable
                charges={result.charges}
                breakevenPrice={result.breakevenPrice}
              />
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="text-gray-400 dark:text-gray-500"
              >
                <circle
                  cx="10"
                  cy="10"
                  r="7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M15 15l5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M10 7v3m0 2v.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Search a stock to get started
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Type a company name or ticker — the live price will auto-fill
              </p>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 dark:text-gray-600 pt-1">
          * Results are estimates. STT charged on sell side for intraday, both sides for delivery.
          For exact charges, refer to your broker&apos;s contract note.
        </p>
      </main>
    </div>
  );
}
