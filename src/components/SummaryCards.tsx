"use client";

import type { CalcResult } from "@/types/calculator";
import { formatINR } from "@/lib/calculations";

interface Props {
  result: CalcResult;
}

function MetricCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: "green" | "red" | "default";
}) {
  const colorClass =
    color === "green"
      ? "text-primary-600 dark:text-primary-400"
      : color === "red"
      ? "text-red-500"
      : "text-gray-900 dark:text-gray-100";

  return (
    <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg px-4 py-3">
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 tracking-wide uppercase mb-1">
        {label}
      </p>
      <p className={`text-base font-semibold ${colorClass} tabular-nums`}>{value}</p>
    </div>
  );
}

export function SummaryCards({ result }: Props) {
  const { buyValue, sellValue, grossPnl, netPnl, returnPct, profitMargin, charges } =
    result;

  const netColor =
    netPnl > 0 ? "green" : netPnl < 0 ? "red" : "default";
  const grossColor =
    grossPnl > 0 ? "green" : grossPnl < 0 ? "red" : "default";

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Trade Value" value={formatINR(charges.turnover)} />
        <MetricCard label="Buy Value" value={formatINR(buyValue)} />
        <MetricCard
          label="Sell Value"
          value={sellValue > 0 ? formatINR(sellValue) : "₹0.00"}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Brokerage" value={formatINR(charges.brokerage)} />
        <MetricCard
          label="Other Charges"
          value={formatINR(charges.totalCharges - charges.brokerage)}
        />
        <MetricCard
          label="Gross P&L"
          value={sellValue > 0 ? formatINR(grossPnl, true) : "₹0.00"}
          color={grossColor}
        />
      </div>

      {/* Net P&L big card */}
      <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg px-5 py-4 flex flex-col gap-3">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Net P&L
          </span>
          <span
            className={`text-2xl font-bold tabular-nums ${
              netColor === "green"
                ? "text-primary-600 dark:text-primary-400"
                : netColor === "red"
                ? "text-red-500"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {sellValue > 0 ? formatINR(netPnl, true) : "₹0.00"}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Return %</span>
          <span
            className={`text-sm font-semibold tabular-nums ${
              returnPct > 0
                ? "text-primary-600 dark:text-primary-400"
                : returnPct < 0
                ? "text-red-500"
                : "text-gray-500"
            }`}
          >
            {sellValue > 0
              ? `${returnPct >= 0 ? "+" : ""}${returnPct.toFixed(2)}%`
              : "—"}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Net Profit Margin</span>
          <span
            className={`text-sm font-semibold tabular-nums ${
              profitMargin > 0
                ? "text-primary-600 dark:text-primary-400"
                : profitMargin < 0
                ? "text-red-500"
                : "text-gray-500"
            }`}
          >
            {sellValue > 0
              ? `${profitMargin >= 0 ? "+" : ""}${profitMargin.toFixed(2)}%`
              : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
