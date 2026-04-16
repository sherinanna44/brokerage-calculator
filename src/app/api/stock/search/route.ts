import { NextRequest, NextResponse } from "next/server";

const YAHOO_SEARCH =
  "https://query1.finance.yahoo.com/v1/finance/search";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");

  if (!q || q.trim().length < 1) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const url = new URL(YAHOO_SEARCH);
    url.searchParams.set("q", q);
    url.searchParams.set("lang", "en-IN");
    url.searchParams.set("region", "IN");
    url.searchParams.set("quotesCount", "10");
    url.searchParams.set("newsCount", "0");
    url.searchParams.set("listsCount", "0");
    url.searchParams.set("enableFuzzyQuery", "false");
    url.searchParams.set("enableNavLinks", "false");

    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        Accept: "application/json",
      },
      // cache for 60 s in Next.js data cache
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json({ suggestions: [] });
    }

    const data = await res.json();
    const quotes: Record<string, string>[] = data.quotes ?? [];

    // Prioritise Indian listings (.NS / .BO) and filter to tradeable types
    const allowedTypes = new Set(["EQUITY", "ETF", "MUTUALFUND", "FUTURE"]);
    const indianFirst = [...quotes].sort((a, b) => {
      const aIndian = /\.(NS|BO)$/.test(a.symbol) ? -1 : 1;
      const bIndian = /\.(NS|BO)$/.test(b.symbol) ? -1 : 1;
      return aIndian - bIndian;
    });

    const suggestions = indianFirst
      .filter((q) => allowedTypes.has(q.quoteType))
      .slice(0, 8)
      .map((q) => ({
        ticker: q.symbol,
        name: q.longname || q.shortname || q.symbol,
        exchange: q.exchDisp || q.exchange || "",
        type: q.quoteType,
      }));

    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error("[/api/stock/search]", err);
    return NextResponse.json({ suggestions: [] });
  }
}
