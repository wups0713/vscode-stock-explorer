import * as vscode from 'vscode';
import { Stock } from '../../core/components/configuration';
import { StockProvider } from "../../core/interfaces/stockProvider";
import { StockQuote } from '../../core/interfaces/stockQuote';
import { TwseStockQuote } from './twseStockQuote';

interface TwseStockItem {
  '公司代號'?: string;
  '公司簡稱'?: string;
}

interface TpexStockItem {
  SecuritiesCompanyCode?: string;
  CompanyAbbreviation?: string;
}

interface TwseEtfItem {
  '基金代號'?: string;
  '基金簡稱'?: string;
}

interface MisStockInfoItem {
  c?: string;
  n?: string;
  nf?: string;
  ex?: string;
  ch?: string;
  z?: string;
  y?: string;
  o?: string;
  h?: string;
  l?: string;
  d?: string;
  t?: string;
  trade?: {
    t?: string;
    v?: number;
    z?: string;
    ft?: number;
  }
}

interface MisResponse {
  msgArray?: MisStockInfoItem[];
  rtcode?: string;
  rtmessage?: string;
}

export class TwseStockProvider implements StockProvider {
  private static readonly NAME: string = "tse";

  constructor(
    private readonly outputChannel: vscode.OutputChannel
  ) {}

  get name(): string {
    return TwseStockProvider.NAME;
  }

  public async getStocks(): Promise<Stock[]> {
    const twseUrl = "https://openapi.twse.com.tw/v1/opendata/t187ap03_L";
    const tpexUrl = "https://www.tpex.org.tw/openapi/v1/mopsfin_t187ap03_O";
    const etfUrl = "https://openapi.twse.com.tw/v1/opendata/t187ap47_L";

    const [twseResponse, tpexResponse, etfResponse] = await Promise.all([
      fetch(twseUrl),
      fetch(tpexUrl),
      fetch(etfUrl)
    ]);

    if (!twseResponse.ok) {
      throw new Error(`Failed to fetch TWSE stocks: ${twseResponse.statusText}`);
    }
    if (!tpexResponse.ok) {
      throw new Error(`Failed to fetch TPEx stocks: ${tpexResponse.statusText}`);
    }
    if (!etfResponse.ok) {
      throw new Error(`Failed to fetch ETF stocks: ${etfResponse.statusText}`);
    }

    const [twseData, tpexData, etfData] = await Promise.all([
      twseResponse.json() as Promise<TwseStockItem[]>,
      tpexResponse.json() as Promise<TpexStockItem[]>,
      etfResponse.json() as Promise<TwseEtfItem[]>
    ]);

    const stocks: Stock[] = [];

    for (const item of twseData) {
      const symbol = (item['公司代號'] ?? '').trim();
      const displayName = (item['公司簡稱'] ?? '').trim();
      if (symbol && displayName) {
        const stock = new Stock();
        stock.provider = this.name;
        stock.id = `tse_${symbol}.tw`;
        stock.symbol = symbol;
        stock.displayName = displayName;
        stock.holdings = [];
        stocks.push(stock);
      }
    }

    for (const item of tpexData) {
      const symbol = (item.SecuritiesCompanyCode ?? '').trim();
      const displayName = (item.CompanyAbbreviation ?? '').trim();
      if (symbol && displayName) {
        const stock = new Stock();
        stock.provider = this.name;
        stock.id = `otc_${symbol}.tw`;
        stock.symbol = symbol;
        stock.displayName = displayName;
        stock.holdings = [];
        stocks.push(stock);
      }
    }

    for (const item of etfData) {
      const symbol = (item['基金代號'] ?? '').trim();
      const displayName = (item['基金簡稱'] ?? '').trim();
      if (symbol && displayName) {
        const stock = new Stock();
        stock.provider = this.name;
        stock.id = `tse_${symbol}.tw`;
        stock.symbol = symbol;
        stock.displayName = displayName;
        stock.holdings = [];
        stocks.push(stock);
      }
    }

    return stocks;
  }

  public async getStockQuote(id: string): Promise<StockQuote> {
    const quotes = await this.getStockQuotes(id);

    return quotes[0] ?? new TwseStockQuote(
      id,
      TwseStockProvider.NAME,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      `Stock quote not found for ${id}`
    );
  }

  public async getStockQuotes(...ids: string[]): Promise<StockQuote[]> {
    if (ids.length === 0) {
      return [];
    }

    try {
      const url = `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=${ids.join('|')}`;
      const response = await fetch(url);

      if (!response.ok) {
        return ids.map(id => new TwseStockQuote(
          id,
          TwseStockProvider.NAME,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          `Failed to fetch stock quote: ${response.statusText}`
        ));
      }

      const data = await response.json() as MisResponse;
      const map = new Map<string, MisStockInfoItem>();

      if (Array.isArray(data.msgArray)) {
        for (const item of data.msgArray) {
          if (item.ex && item.ch) {
            map.set(`${item.ex}_${item.ch}`, item);
          }
        }
      }

      return ids.map(id => {
        const item = map.get(id);

        if (!item) {
          return new TwseStockQuote(
            id,
            TwseStockProvider.NAME,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            `Stock quote not found for ${id}`
          );
        }

        const currentPrice = this.parseNumber(item.z) ?? this.parseNumber(item.trade?.z) ?? this.parseNumber(item.y);
        const closePrice = this.parseNumber(item.y);
        const openPrice = this.parseNumber(item.o);
        const highPrice = this.parseNumber(item.h);
        const lowPrice = this.parseNumber(item.l);
        const change = (currentPrice !== null && closePrice !== null) ? currentPrice - closePrice : null;
        const changePercent = (change !== null && closePrice !== null && closePrice !== 0) ? (change / closePrice) * 100 : null;

        return new TwseStockQuote(
          id,
          TwseStockProvider.NAME,
          currentPrice,
          closePrice,
          openPrice,
          highPrice,
          lowPrice,
          change,
          changePercent,
          null
        );
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return ids.map(id => new TwseStockQuote(
        id,
        TwseStockProvider.NAME,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        message
      ));
    }
  }

  private parseNumber(val: string | undefined | null): number | null {
    if (!val || val === '-') {
      return null;
    }
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
  }
}