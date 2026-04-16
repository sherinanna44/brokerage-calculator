export type Instrument = "equity" | "futures" | "options" | "commodity" | "etf";
export type Exchange = "NSE" | "BSE";
export type Segment = "intraday" | "delivery" | "mtf";

export interface CalcInput {
  symbol: string;
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  exchange: Exchange;
  instrument: Instrument;
  segment: Segment;
}

export interface ChargesBreakdown {
  turnover: number;
  brokerage: number;
  exchangeTransactionCharges: number;
  dpCharges: number;
  stt: number;
  sebiCharges: number;
  ipft: number;
  stampDuty: number;
  gst: number;
  totalCharges: number;
}

export interface CalcResult {
  buyValue: number;
  sellValue: number;
  grossPnl: number;
  netPnl: number;
  returnPct: number;
  profitMargin: number;
  breakevenPrice: number;
  charges: ChargesBreakdown;
}
