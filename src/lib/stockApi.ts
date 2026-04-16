export interface StockSuggestion {
  ticker: string;   // e.g. "RELIANCE.NS"
  name: string;     // e.g. "Reliance Industries Limited"
  exchange: string; // e.g. "NSE"
  type: string;     // e.g. "EQUITY"
}

export interface StockQuote {
  price: number | null;
  currency: string;
  previousClose: number | null;
}

// ── In-memory price cache (avoids duplicate fetches within a session) ─────────
const priceCache = new Map<string, { quote: StockQuote; fetchedAt: number }>();
const CACHE_TTL_MS = 30_000; // 30 seconds

/** Search for Indian stocks/ETFs matching `query`. */
export async function searchStocks(query: string): Promise<StockSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 1) return [];

  try {
    const res = await fetch(
      `/api/stock/search?q=${encodeURIComponent(trimmed)}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.suggestions as StockSuggestion[]) ?? [];
  } catch {
    return [];
  }
}

/** Fetch the current market price for a Yahoo Finance ticker symbol. */
export async function fetchStockQuote(ticker: string): Promise<StockQuote> {
  const cached = priceCache.get(ticker);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.quote;
  }

  try {
    const res = await fetch(
      `/api/stock/quote?symbol=${encodeURIComponent(ticker)}`
    );
    if (!res.ok) return { price: null, currency: "INR", previousClose: null };
    const quote: StockQuote = await res.json();
    priceCache.set(ticker, { quote, fetchedAt: Date.now() });
    return quote;
  } catch {
    return { price: null, currency: "INR", previousClose: null };
  }
}
