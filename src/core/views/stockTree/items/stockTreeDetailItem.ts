import * as vscode from 'vscode';
import { Stock } from '../../../components/configuration';
import { StockTreeItem } from '../stockTreeItem';
import { StockTreeQuoteItem } from './stockTreeQuoteItem';

export class StockTreeDetailItem extends StockTreeItem {
  constructor(
    public readonly label: string,
    public readonly value: string,
    public readonly stock: Stock,
    public readonly parent: StockTreeQuoteItem
  ) {
    super(
      label,
      vscode.TreeItemCollapsibleState.None
    );

    this.description = value;
    this.iconPath = new vscode.ThemeIcon('circle-outline');
  }

  public getChildren(): StockTreeItem[] {
    return [];
  }
}
