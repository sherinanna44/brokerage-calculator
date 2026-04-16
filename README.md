# Brokerage Calculator — Indian Markets

A production-grade **Next.js 15 + TypeScript** brokerage calculator for Indian stock markets (NSE / BSE). Calculates all charges and net P&L accurately for equity, futures, options, commodity, and ETF instruments.

## Features

- **5 instruments**: Equity, Futures, Options, Commodity, ETFs
- **3 segments**: Intraday, Delivery, MTF
- **NSE & BSE** exchange-specific rates
- Accurate charge calculations:
  - Brokerage (capped at ₹20/order)
  - STT (Securities Transaction Tax)
  - Exchange Transaction Charges
  - SEBI Turnover Charges
  - Stamp Duty
  - DP Charges (delivery)
  - IPFT
  - GST (18%)
- Net P&L, return %, profit margin, breakeven price
- Dark mode support via `prefers-color-scheme`
- Fully typed with TypeScript

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout (DM Sans font, metadata)
│   ├── page.tsx            # Main calculator page (client component)
│   └── globals.css         # Tailwind directives + base styles
├── components/
│   ├── InstrumentTabs.tsx  # Equity / Futures / Options / Commodity / ETFs
│   ├── InputPanel.tsx      # Symbol, buy/sell price, qty, exchange, segment
│   ├── SummaryCards.tsx    # Trade value, brokerage, P&L metric cards
│   └── ChargesTable.tsx    # Full charges breakdown + breakeven badge
├── lib/
│   └── calculations.ts     # Pure calculation logic + formatINR helper
└── types/
    └── calculator.ts       # TypeScript interfaces and enums
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Charge Rates Reference

| Charge | Equity Intraday | Equity Delivery | Futures | Options |
|--------|----------------|-----------------|---------|---------|
| Brokerage | 0.03% (max ₹20) | 0.03% (max ₹20) | 0.03% (max ₹20) | ₹20 flat |
| STT | 0.025% sell | 0.1% both sides | 0.01% sell | 0.125% sell |
| ETC (NSE) | 0.00297% | 0.00297% | 0.0019% | 0.05% |
| Stamp Duty | 0.003% buy | 0.015% buy | 0.002% buy | 0.003% buy |
| SEBI | ₹10/crore | ₹10/crore | ₹10/crore | ₹10/crore |
| GST | 18% on fees | 18% on fees | 18% on fees | 18% on fees |
| DP Charges | — | ₹13.5 | — | — |

## Extending

To add broker-specific profiles, modify `calculateBrokerage()` in `src/lib/calculations.ts`:

```typescript
// Example: Zerodha zero-brokerage delivery
if (broker === 'zerodha' && segment === 'delivery') {
  brokOnBuy = 0;
  brokOnSell = 0;
}
```

## Tech Stack

- [Next.js 15](https://nextjs.org) — App Router
- [TypeScript 5](https://www.typescriptlang.org)
- [Tailwind CSS 3](https://tailwindcss.com)
- [DM Sans](https://fonts.google.com/specimen/DM+Sans) — via `next/font/google`
