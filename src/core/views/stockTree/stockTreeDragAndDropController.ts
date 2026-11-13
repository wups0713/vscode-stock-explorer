import * as vscode from 'vscode';
import { Configuration, Stock } from '../../components/configuration';
import { StockTreeQuoteItem } from './items/stockTreeQuoteItem';
import { StockTreeItem } from './stockTreeItem';

export class StockTreeDragAndDropController implements vscode.TreeDragAndDropController<StockTreeItem> {
  public static readonly dragMimeType = 'application/vnd.code.tree.stockExplorerContainer.stockTree';
  public readonly dragMimeTypes = [StockTreeDragAndDropController.dragMimeType];
  public readonly dropMimeTypes = [StockTreeDragAndDropController.dragMimeType];

  constructor(
    private readonly configuration: Configuration
  ) {}

  public handleDrag(
    source: readonly StockTreeItem[],
    dataTransfer: vscode.DataTransfer,
    token: vscode.CancellationToken
  ): void {
    void token;
    const quoteItems = source.filter((item): item is StockTreeQuoteItem => item instanceof StockTreeQuoteItem);

    if (quoteItems.length === 0) {
      return;
    }

    dataTransfer.set(
      StockTreeDragAndDropController.dragMimeType,
      new vscode.DataTransferItem(quoteItems)
    );
  }

  public handleDrop(
    target: StockTreeItem | undefined,
    dataTransfer: vscode.DataTransfer,
    token: vscode.CancellationToken
  ): void {
    void token;
    const transferItem = dataTransfer.get(StockTreeDragAndDropController.dragMimeType);

    if (!transferItem) {
      return;
    }

    const draggedItems: StockTreeQuoteItem[] = transferItem.value;

    if (!Array.isArray(draggedItems) || draggedItems.length === 0) {
      return;
    }

    const draggedStocks = draggedItems
      .map((item) => item.stock)
      .filter((s): s is Stock => s !== undefined && s !== null);

    if (draggedStocks.length === 0) {
      return;
    }

    const currentStocks = this.configuration.stocks;

    const remainingStocks = currentStocks.filter(
      (s) => !draggedStocks.some((ds) => ds.id === s.id && ds.provider === s.provider)
    );

    const targetStock = target?.stock;

    if (targetStock) {
      const targetIndex = remainingStocks.findIndex(
        (s) => s.id === targetStock.id && s.provider === targetStock.provider
      );

      if (targetIndex !== -1) {
        remainingStocks.splice(targetIndex, 0, ...draggedStocks);
      } else {
        remainingStocks.push(...draggedStocks);
      }
    } else {
      remainingStocks.push(...draggedStocks);
    }

    this.configuration.stocks = remainingStocks;
  }
}
