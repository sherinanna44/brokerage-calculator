import type { CalcInput, CalcResult, ChargesBreakdown } from "@/types/calculator";

function clamp20(value: number): number {
  return Math.min(20, value);
}

export function calculateBrokerage(input: CalcInput): CalcResult {
  const { buyPrice, sellPrice, quantity, exchange, instrument, segment } = input;

  const buyValue = buyPrice * quantity;
  const sellValue = sellPrice * quantity;
  const turnover = buyValue + sellValue;

  // ── Brokerage ─────────────────────────────────────────────────────────────
  let brokOnBuy = 0;
  let brokOnSell = 0;

  if (instrument === "options") {
    brokOnBuy = clamp20(buyValue * 0.0003);
    brokOnSell = sellValue > 0 ? clamp20(sellValue * 0.0003) : 0;
  } else if (instrument === "equity" && segment === "delivery") {
    brokOnBuy = clamp20(buyValue * 0.0003);
    brokOnSell = sellValue > 0 ? clamp20(sellValue * 0.0003) : 0;
  } else if (instrument === "futures" || instrument === "commodity") {
    brokOnBuy = clamp20(buyValue * 0.0003);
    brokOnSell = sellValue > 0 ? clamp20(sellValue * 0.0003) : 0;
  } else {
    // equity intraday, etf
    brokOnBuy = clamp20(buyValue * 0.0003);
    brokOnSell = sellValue > 0 ? clamp20(sellValue * 0.0003) : 0;
  }

  const brokerage = brokOnBuy + brokOnSell;

  // ── STT ───────────────────────────────────────────────────────────────────
  let stt = 0;
  if (instrument === "equity" || instrument === "etf") {
    if (segment === "intraday") {
      stt = sellValue * 0.00025; // 0.025% sell side
    } else {
      stt = (buyValue + sellValue) * 0.001; // 0.1% both sides delivery
    }
  } else if (instrument === "futures") {
    stt = sellValue * 0.0001; // 0.01% sell side
  } else if (instrument === "options") {
    stt = sellValue * 0.0013; // 0.125% on sell premium
  } else if (instrument === "commodity") {
    stt = 0; // commodity traded on MCX — no STT
  }

  // ── Exchange Transaction Charges ─────────────────────────────────────────
  let etc = 0;
  if (instrument === "equity" || instrument === "etf") {
    etc = exchange === "NSE" ? turnover * 0.0000297 : turnover * 0.0000375;
  } else if (instrument === "futures") {
    etc = turnover * 0.000019;
  } else if (instrument === "options") {
    etc = turnover * 0.0005;
  } else if (instrument === "commodity") {
    etc = turnover * 0.000026;
  }

  // ── SEBI Turnover Charges ─────────────────────────────────────────────────
  // ₹10 per crore = 0.000001
  const sebiCharges = turnover * 0.000001;

  // ── Stamp Duty (buy side only) ────────────────────────────────────────────
  let stampDuty = 0;
  if (instrument === "equity" || instrument === "etf") {
    stampDuty = segment === "intraday"
      ? buyValue * 0.00003   // 0.003%
      : buyValue * 0.00015;  // 0.015% delivery
  } else if (instrument === "futures") {
    stampDuty = buyValue * 0.00002;
  } else if (instrument === "options" || instrument === "commodity") {
    stampDuty = buyValue * 0.00003;
  }

  // ── DP Charges (delivery/MTF sell side) ──────────────────────────────────
  const dpCharges =
    (segment === "delivery" || segment === "mtf") && instrument === "equity"
      ? 13.5
      : 0;

  // ── IPFT ─────────────────────────────────────────────────────────────────
  const ipft = instrument !== "commodity" ? turnover * 0.000001 : 0;

  // ── GST (18% on brokerage + ETC + SEBI + IPFT) ───────────────────────────
  const gstBase = brokerage + etc + sebiCharges + ipft;
  const gst = gstBase * 0.18;

  // ── Totals ────────────────────────────────────────────────────────────────
  const totalCharges =
    brokerage + stt + etc + dpCharges + sebiCharges + stampDuty + ipft + gst;

  const charges: ChargesBreakdown = {
    turnover,
    brokerage,
    exchangeTransactionCharges: etc,
    dpCharges,
    stt,
    sebiCharges,
    ipft,
    stampDuty,
    gst,
    totalCharges,
  };

  const grossPnl = sellValue - buyValue;
  const netPnl = grossPnl - totalCharges;
  const returnPct = buyValue > 0 ? (netPnl / buyValue) * 100 : 0;
  const profitMargin = sellValue > 0 ? (netPnl / sellValue) * 100 : 0;
  const breakevenPrice =
    buyValue > 0 ? (buyValue + totalCharges) / quantity : 0;

  return {
    buyValue,
    sellValue,
    grossPnl,
    netPnl,
    returnPct,
    profitMargin,
    breakevenPrice,
    charges,
  };
}

export function formatINR(value: number, signed = false): string {
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs);

  if (signed) {
    const sign = value >= 0 ? "+" : "-";
    return `${sign}₹${formatted}`;
  }
  return `₹${formatted}`;
}
