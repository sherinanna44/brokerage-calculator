import { NextRequest, NextResponse } from "next/server";

const YAHOO_CHART = "https://query1.finance.yahoo.com/v8/finance/chart";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  }

  try {
    const url = `${YAHOO_CHART}/${encodeURIComponent(symbol)}?interval=1d&range=1d`;

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        Accept: "application/json",
      },
      // Short cache — prices update frequently
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      return NextResponse.json({ price: null });
    }

    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    const price: number | null = meta?.regularMarketPrice ?? null;
    const currency: string = meta?.currency ?? "INR";
    const previousClose: number | null = meta?.previousClose ?? null;

    return NextResponse.json({ price, currency, previousClose });
  } catch (err) {
    console.error("[/api/stock/quote]", err);
    return NextResponse.json({ price: null });
  }
}
