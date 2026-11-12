export interface StockQuote {
  get id(): string;
  get provider(): string;

  get currentPrice(): number | null;
  get closePrice(): number | null;
  get openPrice(): number | null;
  get highPrice(): number | null;
  get lowPrice(): number | null;
  get change(): number | null;
  get changePercent(): number | null;
  get error(): string | null;
}