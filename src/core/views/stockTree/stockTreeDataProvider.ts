import * as vscode from 'vscode';
import { Configuration, Stock } from '../../components/configuration';
import { StockQuote } from '../../interfaces/stockQuote';
import { StockTreeQuoteItem } from './items/stockTreeQuoteItem';
import { StockTreeItem } from './stockTreeItem';

export type DisplayMode = 'quote' | 'profit';

export class StockTreeDataProvider implements vscode.TreeDataProvider<StockTreeItem> {
  private _displayMode: DisplayMode = 'quote';
  private _onDidChangeTreeData: vscode.EventEmitter<StockTreeItem | undefined | null | void> = new vscode.EventEmitter<StockTreeItem | undefined | null | void>();

  public readonly onDidChangeTreeData: vscode.Event<StockTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

  private items: StockTreeQuoteItem[] = [];

  constructor(
    private readonly configuration: Configuration
  ) {}

  get displayMode(): DisplayMode {
    return this._displayMode;
  }

  set displayMode(value: DisplayMode) {
    if (this._displayMode !== value) {
      this._displayMode = value;

      const riseColor = this.configuration.riseColor;
      const fallColor = this.configuration.fallColor;

      for (const item of this.items) {
        item.displayMode = value;
        item.riseColor = riseColor;
        item.fallColor = fallColor;
        item.update();

        this._onDidChangeTreeData.fire(item);
      }
    }
  }

  public getTreeItem(element: StockTreeItem): vscode.TreeItem {
    return element;
  }

  public getChildren(element?: StockTreeItem): StockTreeItem[] {
    if (!element) {
      return this.items;
    }

    return element.getChildren();
  }

  public set(stocks: Array<[stock: Stock, quote: StockQuote]>): void {
    let newItems: StockTreeQuoteItem[] = [];

    const displayMode = this.displayMode;
    const riseColor = this.configuration.riseColor;
    const fallColor = this.configuration.fallColor;

    for (const [stock, quote] of stocks) {
      newItems.push(new StockTreeQuoteItem(stock, quote, displayMode, riseColor, fallColor));
    }

    this.items = newItems;
    this._onDidChangeTreeData.fire();
  }

  public remove(stock: Stock | StockTreeItem): void {
    if (stock instanceof Stock) {
      const index = this.items.findIndex(i => i.stock.id === stock.id && i.stock.provider === stock.provider);
  
      if (index >= 0) {
        this.items.splice(index, 1);
        this._onDidChangeTreeData.fire();
      }
    }

    if (stock instanceof StockTreeQuoteItem) {
      const index = this.items.findIndex(i => i.stock.id === stock.stock.id && i.stock.provider === stock.stock.provider);
  
      if (index >= 0) {
        this.items.splice(index, 1);
        this._onDidChangeTreeData.fire();
      }
    }
  }

  public update(stock: Stock, quote: StockQuote): void {
    const item = this.items.find(i => i.stock.id === stock.id && i.stock.provider === stock.provider);

    if (item) {
      item.stock = stock;
      item.quote = quote;
      item.displayMode = this.displayMode;
      item.riseColor = this.configuration.riseColor;
      item.fallColor = this.configuration.fallColor;
      item.update();

      this._onDidChangeTreeData.fire(item);
    }
  }
}