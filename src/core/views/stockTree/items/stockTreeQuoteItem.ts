import * as vscode from 'vscode';
import { Stock } from '../../../components/configuration';
import { StockQuote } from '../../../interfaces/stockQuote';
import { DisplayMode } from '../stockTreeDataProvider';
import { StockTreeItem } from '../stockTreeItem';
import { StockTreeDetailItem } from './stockTreeDetailItem';

export class StockTreeQuoteItem extends StockTreeItem {
  public readonly parent: StockTreeItem | undefined;

  constructor(
    public stock: Stock,
    public quote: StockQuote,
    public displayMode: DisplayMode,
    public riseColor: string,
    public fallColor: string,
  ) {
    super(
      `${stock.symbol} ${stock.displayName}`,
      vscode.TreeItemCollapsibleState.Collapsed
    );

    this.contextValue = 'stockItem';
    this.update();
  }

  public update(): void {
    if (this.quote.error) {
      this.description = this.quote.error;
      this.tooltip = this.description;
      this.iconPath = new vscode.ThemeIcon('error');
      return;
    }

    const totalShares = this.calculateTotalShares();
    const totalCost = this.calculateTotalCost();
    const currentPrice = this.quote.currentPrice;
    const change = this.quote.change;
    const changePercent = this.quote.changePercent;
    const profit = currentPrice === null || currentPrice === undefined ? null : currentPrice * totalShares - totalCost;
    const profitPercent = profit === null || profit === undefined ? null : totalCost > 0 ? (profit / totalCost) * 100 : 0;

    switch (this.displayMode) {
      case 'quote':
        this.description = this.getQuoteDescription(currentPrice, change, changePercent);
        this.tooltip = this.description;
        this.iconPath = this.getIcon(change);
        break;
      case 'profit':
        this.description = this.getProfitDescription(currentPrice, profit, profitPercent);
        this.tooltip = this.description;
        this.iconPath = this.getIcon(profit);
        break;
    }
  }

  public getChildren(): StockTreeItem[] {
    const totalShares = this.calculateTotalShares();
    const totalCost = this.calculateTotalCost();
    const avgCost = totalShares > 0 ? totalCost / totalShares : 0;
    const currentPrice = this.quote.currentPrice ?? 0;
    const marketValue = currentPrice * totalShares;

    return [
      new StockTreeDetailItem(
        vscode.l10n.t('Shares'),
        this.formatNumber(totalShares, 0, 0),
        this.stock,
        this
      ),
      new StockTreeDetailItem(
        vscode.l10n.t('Avg Cost'),
        this.formatNumber(avgCost, 0, 2),
        this.stock,
        this
      ),
      new StockTreeDetailItem(
        vscode.l10n.t('Total Cost'),
        this.formatNumber(totalCost, 0, 0),
        this.stock,
        this
      ),
      new StockTreeDetailItem(
        vscode.l10n.t('Market Value'),
        this.formatNumber(marketValue, 0, 2),
        this.stock,
        this
      )
    ];
  }

  private getQuoteDescription(currentPrice: number | null, change: number | null, changePercent: number | null): string {
    const currentPriceString = currentPrice === null || currentPrice === undefined ? vscode.l10n.t('N/A') : this.formatNumber(currentPrice, 0, 2);
    const changeString = change === null || change === undefined ? '-' : this.formatSignedNumber(change, 0, 2);
    const changePercentString = changePercent === null || changePercent === undefined ? '-%' : this.formatSignedPercent(changePercent);

    return `${currentPriceString} | ${changeString} (${changePercentString})`;
  }

  private getProfitDescription(currentPrice: number | null, profit: number | null, profitPercent: number | null): string {
    const currentPriceString = currentPrice === null || currentPrice === undefined ? vscode.l10n.t('N/A') : this.formatNumber(currentPrice, 0, 2);
    const profitString = profit === null || profit === undefined ? '-' : this.formatSignedNumber(profit, 0, 0);
    const profitPercentString = profitPercent === null || profitPercent === undefined ? '-%' : this.formatSignedPercent(profitPercent);

    return `${currentPriceString} | ${profitString} (${profitPercentString})`;
  }

  private getIcon(value: number | null): vscode.ThemeIcon {
    if (value === null || value === undefined) {
      return new vscode.ThemeIcon('circle-outline');
    } else if (value > 0) {
      return new vscode.ThemeIcon('triangle-up', new vscode.ThemeColor(this.riseColor));
    } else if (value < 0) {
      return new vscode.ThemeIcon('triangle-down', new vscode.ThemeColor(this.fallColor));
    } else {
      return new vscode.ThemeIcon('dash');
    }
  }

  private formatNumber(value: number, minimumFractionDigits: number, maximumFractionDigits: number): string {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: minimumFractionDigits,
      maximumFractionDigits: maximumFractionDigits
    });
  }

  private formatSignedNumber(value: number, minimumFractionDigits: number, maximumFractionDigits: number): string {
    const formatted = value.toLocaleString('en-US', {
      minimumFractionDigits: minimumFractionDigits,
      maximumFractionDigits: maximumFractionDigits
    });

    return value > 0 ? `+${formatted}` : formatted;
  }

  private formatSignedPercent(value: number): string {
    const formatted = value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    return value > 0 ? `+${formatted}%` : `${formatted}%`;
  }

  private calculateTotalShares(): number {
    if (!this.stock.holdings) {
      return 0;
    }

    return this.stock.holdings.reduce((sum, h) => sum + (h.amount || 0), 0);
  }

  private calculateTotalCost(): number {
    if (!this.stock.holdings) {
      return 0;
    }

    return this.stock.holdings.reduce((sum, h) => sum + (h.amount || 0) * (h.price || 0), 0);
  }
}

