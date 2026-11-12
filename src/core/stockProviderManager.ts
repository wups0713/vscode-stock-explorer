import * as vscode from 'vscode';
import { TwseStockProvider } from "../stockProviders/twse/twseStockProvider";
import { Stock } from './components/configuration';
import { StockProvider } from "./interfaces/stockProvider";
import { StockQuote } from './interfaces/stockQuote';

export class StockProviderManager {
  private readonly stockProviders: Map<string, StockProvider>;

  constructor(
    private readonly outputChannel: vscode.OutputChannel
  ) {
    this.stockProviders = this.createStockProviders();
  }

  public async getStocks(): Promise<Stock[]> {
    let stocks: Stock[] = [];

    for (const stockProvider of this.stockProviders.values()) {
      stocks.push(...await stockProvider.getStocks());
    }

    return stocks;
  }

  public async getStockQuote(provider: string, id: string): Promise<StockQuote> {
    const stockProvider = this.stockProviders.get(provider);

    if (!stockProvider) {
      throw new Error(`Stock provider '${provider}' not found.`);
    }

    return await stockProvider.getStockQuote(id);
  }

  public async getStockQuotes(provider: string, ...ids: string[]): Promise<StockQuote[]> {
    const stockProvider = this.stockProviders.get(provider);

    if (!stockProvider) {
      throw new Error(`Stock provider '${provider}' not found.`);
    }

    return await stockProvider.getStockQuotes(...ids);
  }

  private createStockProviders(): Map<string, StockProvider> {
    return new Map([
      new TwseStockProvider(this.outputChannel) as StockProvider
    ].map(provider => [ provider.name, provider ] as const));
  }
}