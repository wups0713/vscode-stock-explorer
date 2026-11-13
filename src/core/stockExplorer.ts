import * as vscode from 'vscode';
import { Configuration, Stock } from './components/configuration';
import { StockQuote } from './interfaces/stockQuote';
import { StockProviderManager } from './stockProviderManager';
import { StockTreeDataProvider } from './views/stockTree/stockTreeDataProvider';
import { StockTreeItem } from './views/stockTree/stockTreeItem';

export class StockExplorer implements vscode.Disposable {
  private readonly subscriptions: vscode.Disposable[] = [];
  private readonly configuration: Configuration;
  private readonly stockProviderManager: StockProviderManager;
  private readonly treeDataProvider: StockTreeDataProvider;
  private readonly treeView: vscode.TreeView<StockTreeItem>;
  private isUpdating: boolean = false;
  private timer: NodeJS.Timeout | undefined;
  private cachedQuotes: Map<string, StockQuote> = new Map<string, StockQuote>();

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly outputChannel: vscode.OutputChannel,
  ) {
    this.configuration = new Configuration();
    this.stockProviderManager = new StockProviderManager(outputChannel);
    this.treeDataProvider = new StockTreeDataProvider(this.configuration);
    this.treeView = vscode.window.createTreeView('stockExplorerContainer.stockTree', {
      treeDataProvider: this.treeDataProvider
    });

    this.subscriptions.push(this.treeView);

    this.subscriptions.push(
      this.treeView.onDidChangeVisibility(async (e) => {
        if (e.visible) {
          await this.update(true);
          this.startTimer();
        } else {
          this.stopTimer();
        }
      })
    );

    this.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration(async (e) => {
        if (e.affectsConfiguration('stockExplorer')) {
          if (this.treeView.visible) {
            await this.update(true);
            this.startTimer();
          } else {
            this.stopTimer();
          }
        }
      })
    );

    if (this.treeView.visible) {
      this.update(true);
      this.startTimer();
    }
  }

  public onToggleDisplayModeCommand = (): void => {
    switch (this.treeDataProvider.displayMode) {
      case 'profit':
        this.treeDataProvider.displayMode = 'quote';
        break;
      case 'quote':
        this.treeDataProvider.displayMode = 'profit';
        break;
    }
  };

  public async onAddStockCommand(): Promise<void> {
    try {
      const availableStocks = await this.stockProviderManager.getStocks();
      const currentStocks = this.configuration.stocks;

      interface StockQuickPickItem extends vscode.QuickPickItem {
        stock: Stock;
        isAdded: boolean;
      }

      const items: StockQuickPickItem[] = availableStocks.map((stock) => {
        const isAdded = currentStocks.some((s) => s.id === stock.id && s.provider === stock.provider);

        return {
          label: `${stock.symbol} ${stock.displayName}`,
          description: isAdded ? vscode.l10n.t('Added') : stock.provider,
          stock,
          isAdded,
        };
      });

      const selectedItem = await vscode.window.showQuickPick(items, {
        placeHolder: vscode.l10n.t('Search stock by symbol or name'),
      });

      if (!selectedItem) {
        return;
      }

      if (selectedItem.isAdded) {
        vscode.window.showInformationMessage(vscode.l10n.t('Stock is already in tracking list'));
        return;
      }

      const newStock: Stock = {
        id: selectedItem.stock.id,
        provider: selectedItem.stock.provider,
        symbol: selectedItem.stock.symbol,
        displayName: selectedItem.stock.displayName,
        holdings: [],
      };

      this.configuration.stocks = [...currentStocks, newStock];
    } catch (error) {
      this.outputChannel.appendLine(`Error adding stock: ${error}`);
      throw error;
    }
  }

  public async onRemoveStockCommand(item?: StockTreeItem): Promise<void> {
    try {
      let stock: Stock | undefined;

      if (item) {
        stock = item.stock;
      } else {
        const currentStocks = this.configuration.stocks;

        if (currentStocks.length === 0) {
          return;
        }

        interface StockQuickPickItem extends vscode.QuickPickItem {
          stock: Stock;
        }

        const items: StockQuickPickItem[] = currentStocks.map((stock) => ({
          label: `${stock.symbol} ${stock.displayName}`,
          description: stock.provider,
          stock,
        }));

        const selectedItem = await vscode.window.showQuickPick(items, {
          placeHolder: vscode.l10n.t('Select stock to remove'),
        });

        stock = selectedItem?.stock;
      }

      if (!stock) {
        return;
      }

      const confirmItem = vscode.l10n.t('Confirm Remove');
      const choice = await vscode.window.showWarningMessage(
        vscode.l10n.t('Are you sure you want to remove {0} from tracking list?', `${stock.symbol} ${stock.displayName}`),
        { modal: true },
        confirmItem
      );

      if (choice !== confirmItem) {
        return;
      }

      this.configuration.stocks = this.configuration.stocks.filter((s) => !(s.id === stock.id && s.provider === stock.provider));

      vscode.window.showInformationMessage(vscode.l10n.t('{0} has been removed from tracking list', `${stock.symbol} ${stock.displayName}`));
    } catch (error) {
      this.outputChannel.appendLine(`Error removing stock: ${error}`);
      throw error;
    }
  }

  public async onBuyStockCommand(item?: StockTreeItem): Promise<void> {
    try {
      let stock: Stock | undefined;

      if (item) {
        stock = item.stock;
      } else {
        const currentStocks = this.configuration.stocks;

        if (currentStocks.length === 0) {
          return;
        }

        interface StockQuickPickItem extends vscode.QuickPickItem {
          stock: Stock;
        }

        const items: StockQuickPickItem[] = currentStocks.map((stock) => ({
          label: `${stock.symbol} ${stock.displayName}`,
          description: stock.provider,
          stock,
        }));

        const selectedItem = await vscode.window.showQuickPick(items, {
          placeHolder: vscode.l10n.t('Select stock to buy'),
        });

        stock = selectedItem?.stock;
      }

      if (!stock) {
        return;
      }

      const amountInput = await vscode.window.showInputBox({
        prompt: vscode.l10n.t('Enter buy amount'),
        validateInput: (value) => {
          const num = Number(value);
          if (!value || !Number.isInteger(num) || num <= 0) {
            return vscode.l10n.t('Amount must be a positive integer');
          }
          return null;
        },
      });

      if (!amountInput) {
        return;
      }

      const priceInput = await vscode.window.showInputBox({
        prompt: vscode.l10n.t('Enter buy price'),
        validateInput: (value) => {
          const num = Number(value);
          if (!value || isNaN(num) || num <= 0) {
            return vscode.l10n.t('Price must be a positive number');
          }
          return null;
        },
      });

      if (!priceInput) {
        return;
      }

      const amount = parseInt(amountInput, 10);
      const price = parseFloat(priceInput);

      const stocks = this.configuration.stocks;
      const updatedStocks = stocks.map((s) => {
        if (s.id === stock.id && s.provider === stock.provider) {
          return {
            ...s,
            holdings: [...(s.holdings || []), { amount, price }],
          };
        }
        return s;
      });

      this.configuration.stocks = updatedStocks;
    } catch (error) {
      this.outputChannel.appendLine(`Error buying stock: ${error}`);
      throw error;
    }
  }

  public async onSellStockCommand(item?: StockTreeItem): Promise<void> {
    try {
      let stock: Stock | undefined;

      if (item) {
        stock = item.stock;
      } else {
        const currentStocks = this.configuration.stocks;

        if (currentStocks.length === 0) {
          return;
        }

        interface StockQuickPickItem extends vscode.QuickPickItem {
          stock: Stock;
        }

        const items: StockQuickPickItem[] = currentStocks.map((stock) => ({
          label: `${stock.symbol} ${stock.displayName}`,
          description: stock.provider,
          stock,
        }));

        const selectedItem = await vscode.window.showQuickPick(items, {
          placeHolder: vscode.l10n.t('Select stock to sell'),
        });

        stock = selectedItem?.stock;
      }

      if (!stock) {
        return;
      }

      const currentHoldings = stock.holdings || [];
      const totalShares = currentHoldings.reduce((sum, h) => sum + h.amount, 0);

      if (totalShares <= 0) {
        vscode.window.showErrorMessage(vscode.l10n.t('No holdings available to sell'));
        return;
      }

      const amountInput = await vscode.window.showInputBox({
        prompt: vscode.l10n.t('Enter sell amount'),
        validateInput: (value) => {
          const num = Number(value);
          if (!value || !Number.isInteger(num) || num <= 0) {
            return vscode.l10n.t('Amount must be a positive integer');
          }
          if (num > totalShares) {
            return vscode.l10n.t('Sell amount exceeds current holdings (current: {0})', totalShares);
          }
          return null;
        },
      });

      if (!amountInput) {
        return;
      }

      let remainingToSell = parseInt(amountInput, 10);
      const newHoldings: typeof currentHoldings = [];

      for (const holding of currentHoldings) {
        if (remainingToSell <= 0) {
          newHoldings.push(holding);
        } else if (holding.amount <= remainingToSell) {
          remainingToSell -= holding.amount;
        } else {
          newHoldings.push({
            amount: holding.amount - remainingToSell,
            price: holding.price,
          });
          remainingToSell = 0;
        }
      }

      const stocks = this.configuration.stocks;
      const updatedStocks = stocks.map((s) => {
        if (s.id === stock.id && s.provider === stock.provider) {
          return {
            ...s,
            holdings: newHoldings,
          };
        }
        return s;
      });

      this.configuration.stocks = updatedStocks;
    } catch (error) {
      this.outputChannel.appendLine(`Error selling stock: ${error}`);
      throw error;
    }
  }

  public async onRefreshCommand(): Promise<void> {
    await this.update(true);
  }

  private async update(updateQuote: boolean): Promise<void> {
    if (this.isUpdating) {
      return;
    }

    this.isUpdating = true;

    try {
      await vscode.window.withProgress(
        {
          location: { viewId: 'stockExplorerContainer.stockTree' }
        },
        async () => {
          await this.performUpdate(updateQuote);
        }
      );
    } finally {
      this.isUpdating = false;
    }
  }

  private async performUpdate(updateQuote: boolean): Promise<void> {
    this.outputChannel.appendLine(`Update data (updateQuote = ${updateQuote})`);

    const currentStocks = this.configuration.stocks;
    const stocks: Array<[stock: Stock, quote: StockQuote]> = [];
    const updateStockGroups: Map<string, Stock[]> = new Map<string, Stock[]>();
    const newCachedQuotes: Map<string, StockQuote> = new Map<string, StockQuote>();

    for (const stock of currentStocks) {
      let quote = this.cachedQuotes.get(`${stock.id}-${stock.provider}`);

      if (!quote || updateQuote) {
        let updateStocks = updateStockGroups.get(stock.provider);

        if (!updateStocks) {
          updateStockGroups.set(stock.provider, [ stock ]);
        } else {
          updateStocks.push(stock);
        }
      }
    }

    for (const [provider, updateStocks] of updateStockGroups) {
      try {
        let quotes = await this.stockProviderManager.getStockQuotes(provider, ...updateStocks.map((s) => s.id));

        for (const quote of quotes) {
          this.cachedQuotes.set(`${quote.id}-${quote.provider}`, quote);
        }
      } catch (error) {
        this.outputChannel.appendLine(`Error getting stock quotes for provider '${provider}': ${error}`);
      }
    }

    for (const stock of currentStocks) {
      let quote = this.cachedQuotes.get(`${stock.id}-${stock.provider}`);

      if (quote) {
        stocks.push([ stock, quote ]);
        newCachedQuotes.set(`${stock.id}-${stock.provider}`, quote);
      }
    }

    this.treeDataProvider.set(stocks);
    this.cachedQuotes = newCachedQuotes;
  }

  private startTimer(): void {
    const interval = this.configuration.updateInterval;

    this.stopTimer();

    if (interval > 0) {
      this.timer = setInterval(async () => { await this.update(true); }, interval * 1000);
    }
  }

  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  public dispose(): void {
    this.stopTimer();

    for (const sub of this.subscriptions) {
      sub.dispose();
    }
  }
}
