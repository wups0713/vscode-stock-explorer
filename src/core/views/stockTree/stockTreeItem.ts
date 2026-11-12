import * as vscode from 'vscode';
import { Stock } from '../../components/configuration';

export abstract class StockTreeItem extends vscode.TreeItem {
  constructor(
    label: string | vscode.TreeItemLabel,
    collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None
  ) {
    super(label, collapsibleState);
  }

  public abstract get stock(): Stock | undefined;
  public abstract getChildren(): StockTreeItem[];
}
