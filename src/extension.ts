import * as vscode from 'vscode';
import { StockExplorer } from './core/stockExplorer';

export function activate(context: vscode.ExtensionContext) {
  const outputChannel = vscode.window.createOutputChannel('Stock Explorer');
  const stockExplorer = new StockExplorer(context, outputChannel);

  const toggleDisplayModeCommand = vscode.commands.registerCommand('stockExplorer.toggleDisplayMode', stockExplorer.onToggleDisplayModeCommand, stockExplorer);
  const addStockCommand = vscode.commands.registerCommand('stockExplorer.addStock', stockExplorer.onAddStockCommand, stockExplorer);
  const removeStockCommand = vscode.commands.registerCommand('stockExplorer.removeStock', stockExplorer.onRemoveStockCommand, stockExplorer);
  const buyStockCommand = vscode.commands.registerCommand('stockExplorer.buyStock', stockExplorer.onBuyStockCommand, stockExplorer);
  const sellStockCommand = vscode.commands.registerCommand('stockExplorer.sellStock', stockExplorer.onSellStockCommand, stockExplorer);
  const refreshCommand = vscode.commands.registerCommand('stockExplorer.refresh', stockExplorer.onRefreshCommand, stockExplorer);

  context.subscriptions.push(
    outputChannel,
    stockExplorer,
    toggleDisplayModeCommand,
    addStockCommand,
    removeStockCommand,
    buyStockCommand,
    sellStockCommand,
    refreshCommand
  );
}

export function deactivate() {}
