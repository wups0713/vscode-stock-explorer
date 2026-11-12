import * as vscode from 'vscode';
import { Stock } from '../../../components/configuration';
import { StockTreeItem } from '../stockTreeItem';

export class StockTreeDetailItem extends StockTreeItem {
  constructor(
    public readonly label: string,
    public readonly value: string
  ) {
    super(
      label,
      vscode.TreeItemCollapsibleState.None
    );

    this.description = value;
    this.iconPath = new vscode.ThemeIcon('circle-outline');
  }

  public get stock(): Stock | undefined {
    return undefined;
  }

  public getChildren(): StockTreeItem[] {
    return [];
  }
}
