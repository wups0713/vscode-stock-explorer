import * as vscode from 'vscode';

export class Stock {
  public provider: string = '';
  public id: string = '';
  public symbol: string = '';
  public displayName: string = '';
  public holdings: StockHolding[] = [];
}

export class StockHolding {
  public amount: number = 0;
  public price: number = 0;
}

export class Configuration {
  private static readonly SECTION = 'stockExplorer';
  private static readonly COLOR_NAME_MAP: Record<string, string> = {
    red: 'charts.red',
    blue: 'charts.blue',
    yellow: 'charts.yellow',
    orange: 'charts.orange',
    green: 'charts.green',
    purple: 'charts.purple'
  };

  get stocks(): Stock[] {
    return vscode.workspace.getConfiguration(Configuration.SECTION).get<Stock[]>('stocks', []);
  }

  set stocks(value: Stock[]) {
    vscode.workspace.getConfiguration(Configuration.SECTION).update('stocks', value, vscode.ConfigurationTarget.Global);
  }

  get updateInterval(): number {
    return vscode.workspace.getConfiguration(Configuration.SECTION).get<number>('updateInterval', 15);
  }

  get riseColor(): string {
    return this.formatColorCode(vscode.workspace.getConfiguration(Configuration.SECTION).get<string>('riseColor', 'red'), Configuration.COLOR_NAME_MAP['red']);
  }

  get fallColor(): string {
    return this.formatColorCode(vscode.workspace.getConfiguration(Configuration.SECTION).get<string>('fallColor', 'green'), Configuration.COLOR_NAME_MAP['green']);
  }

  private formatColorCode(color: string, defaultColor: string): string {
    if (!color) {
      return defaultColor;
    }

    const normalized = color.trim().toLowerCase();

    if (Configuration.COLOR_NAME_MAP[normalized]) {
      return Configuration.COLOR_NAME_MAP[normalized];
    }

    return defaultColor;
  }
}
