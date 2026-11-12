import { StockQuote } from "../../core/interfaces/stockQuote";

export class TwseStockQuote implements StockQuote {
  constructor(
    public readonly id: string,
    public readonly provider: string,
    public readonly currentPrice: number | null,
    public readonly closePrice: number | null,
    public readonly openPrice: number | null,
    public readonly highPrice: number | null,
    public readonly lowPrice: number | null,
    public readonly change: number | null,
    public readonly changePercent: number | null,
    public readonly error: string | null,
  ) {}
}