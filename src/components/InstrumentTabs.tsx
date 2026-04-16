"use client";

import type { Instrument } from "@/types/calculator";

interface Tab {
  id: Instrument;
  label: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  {
    id: "equity",
    label: "Equity",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="9" width="3" height="6" fill="#1D9E75" rx="1" />
        <rect x="6" y="6" width="3" height="9" fill="#5DCAA5" rx="1" />
        <rect x="11" y="2" width="3" height="13" fill="#9FE1CB" rx="1" />
      </svg>
    ),
  },
  {
    id: "futures",
    label: "Futures",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <polyline
          points="1,12 4,7 7,9 11,4 15,5"
          stroke="#E24B4A"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
  },
  {
    id: "options",
    label: "Options",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke="#3b82f6" strokeWidth="1.5" fill="none" />
        <text x="5.5" y="12" fontSize="8" fill="#3b82f6" fontWeight="bold">O</text>
      </svg>
    ),
  },
  {
    id: "commodity",
    label: "Commodity",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="5" fill="#f97316" opacity="0.85" />
        <circle cx="8" cy="8" r="2.5" fill="#fff" opacity="0.4" />
      </svg>
    ),
  },
  {
    id: "etf",
    label: "ETFs",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="2" width="12" height="12" rx="3" fill="#8b5cf6" opacity="0.85" />
        <text x="4.5" y="11.5" fontSize="7" fill="#fff" fontWeight="bold">ETF</text>
      </svg>
    ),
  },
];

interface Props {
  value: Instrument;
  onChange: (instrument: Instrument) => void;
}

export function InstrumentTabs({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all duration-150
            ${
              value === tab.id
                ? "bg-primary-600 border-primary-600 text-white shadow-sm"
                : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
            }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
