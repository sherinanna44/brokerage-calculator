"use client";

import type { ChargesBreakdown } from "@/types/calculator";
import { formatINR } from "@/lib/calculations";

interface Props {
  charges: ChargesBreakdown;
  breakevenPrice: number;
}

interface ChargeRow {
  label: string;
  key: keyof ChargesBreakdown | "totalCharges";
  tooltip?: string;
  isTotal?: boolean;
}

const ROWS: ChargeRow[] = [
  { label: "Turnover", key: "turnover" },
  { label: "Brokerage", key: "brokerage", tooltip: "Capped at ₹20 per order (Zerodha-style flat fee)" },
  {
    label: "Exchange Transaction Charges",
    key: "exchangeTransactionCharges",
    tooltip: "NSE: 0.00297% | BSE: 0.00375% on turnover",
  },
  { label: "DP Charges", key: "dpCharges", tooltip: "₹13.5 charged on delivery/MTF sell transactions" },
  {
    label: "Securities Transaction Tax (STT)",
    key: "stt",
    tooltip: "Intraday: 0.025% on sell. Delivery: 0.1% on both sides.",
  },
  { label: "SEBI Turnover Charges", key: "sebiCharges", tooltip: "₹10 per crore of turnover" },
  {
    label: "Investor Protection Fund Trust (IPFT)",
    key: "ipft",
    tooltip: "₹1 per crore of turnover",
  },
  { label: "Stamp Duty", key: "stampDuty", tooltip: "Charged on buy side only. Intraday: 0.003%, Delivery: 0.015%" },
  { label: "GST (18%)", key: "gst", tooltip: "18% on brokerage + ETC + SEBI charges + IPFT" },
  { label: "Total Tax & Charges", key: "totalCharges", isTotal: true },
];

export function ChargesTable({ charges, breakevenPrice }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <table className="w-full">
          <tbody>
            {ROWS.map((row, i) => (
              <tr
                key={row.key}
                className={`
                  ${i !== ROWS.length - 1 ? "border-b border-gray-100 dark:border-gray-800" : ""}
                  ${row.isTotal ? "bg-gray-50 dark:bg-gray-800/60" : ""}
                  group
                `}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm ${
                        row.isTotal
                          ? "font-semibold text-gray-900 dark:text-gray-100"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {row.label}
                    </span>
                    {row.tooltip && (
                      <div className="relative group/tip">
                        <svg
                          className="text-gray-300 dark:text-gray-600 hover:text-gray-400 cursor-help"
                          width="13"
                          height="13"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                          <text x="6.2" y="12" fontSize="9" fill="currentColor" fontWeight="bold">i</text>
                        </svg>
                        <div className="absolute left-5 top-0 z-10 hidden group-hover/tip:block w-52 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg p-2.5 shadow-xl">
                          {row.tooltip}
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={`text-sm tabular-nums ${
                      row.isTotal
                        ? "font-semibold text-gray-900 dark:text-gray-100"
                        : "font-medium text-gray-900 dark:text-gray-200"
                    }`}
                  >
                    {formatINR(charges[row.key as keyof ChargesBreakdown] ?? 0)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Breakeven */}
      <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl px-5 py-4 flex justify-between items-center">
        <div>
          <p className="text-xs font-semibold text-primary-700 dark:text-primary-400 uppercase tracking-wide mb-0.5">
            Breakeven Price
          </p>
          <p className="text-xs text-primary-600/70 dark:text-primary-500">
            Minimum sell price for no profit / no loss
          </p>
        </div>
        <span className="text-lg font-bold text-primary-700 dark:text-primary-300 tabular-nums">
          {breakevenPrice > 0 ? formatINR(breakevenPrice) : "—"}
        </span>
      </div>
    </div>
  );
}
