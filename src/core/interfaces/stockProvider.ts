import { Stock } from "../components/configuration";
import { StockQuote } from "./stockQuote";

export interface StockProvider {
  get name(): string;

  getStocks(): Promise<Stock[]>;
  getStockQuote(id: string): Promise<StockQuote>;
  getStockQuotes(...ids: string[]): Promise<StockQuote[]>;
}