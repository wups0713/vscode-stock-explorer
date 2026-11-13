# VS Code Stock Explorer

VS Code Stock Explorer 是一款專為 VS Code 設計的股票即時行情與投資組合追蹤擴充功能。使用者可以直接在編輯器側邊欄中瀏覽股票動態、維護持股明細並計算投資損益。

## 主要功能

- **即時行情檢視**：於 VS Code 側邊欄（Activity Bar）的「股票總覽」視圖中顯示股票即時報價、漲跌幅與詳細行情。
- **自動輪詢更新**：當股票總覽視圖處於顯示狀態時，自動依設定間隔時間（預設 15 秒）輪詢更新價格；視圖隱藏時自動暫停更新以節省網路流量。
- **投資組合管理**：
  - **新增股票**：透過 QuickPick 搜尋股票並加入追蹤清單。
  - **買入股票**：輸入買入數量與單價，記錄持股成本。
  - **賣出股票**：輸入賣出數量，依先進先出（FIFO）原則扣減持股明細。
  - **刪除股票**：從追蹤清單中移除指定股票（具備二次確認機制）。
- **顯示模式切換**：支援切換資訊顯示模式，輕鬆調整資訊展現方式。
- **自訂顏色樣式**：提供上漲與下跌顏色的自訂設定（預設支援紅漲綠跌模式）。

## 設定選項

本套件提供以下設定項目，可於 VS Code 設定選單中搜尋 `stockExplorer` 或直接在 `settings.json` 中配置：

| 設定名稱 | 型別 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `stockExplorer.stocks` | Array | `[]` | 追蹤的股票清單與持股明細設定 |
| `stockExplorer.updateInterval` | Number | `15` | 股票行情自動更新間隔時間（秒） |
| `stockExplorer.riseColor` | String | `"red"` | 股票價格上漲時顯示的顏色 |
| `stockExplorer.fallColor` | String | `"green"` | 股票價格下跌時顯示的顏色 |

## 指令說明

| 指令 ID | 指令名稱 | 說明 |
| --- | --- | --- |
| `stockExplorer.addStock` | 新增股票 | 搜尋並將股票加入追蹤清單 |
| `stockExplorer.removeStock` | 刪除股票 | 將選定的股票從追蹤清單中刪除 |
| `stockExplorer.buyStock` | 買入股票 | 紀錄指定股票的買入數量與單價 |
| `stockExplorer.sellStock` | 賣出股票 | 依 FIFO 原則紀錄賣出股票數量 |
| `stockExplorer.toggleDisplayMode` | 切換顯示模式 | 切換 Tree View 資訊顯示樣式 |
| `stockExplorer.refresh` | 重新整理 | 手動觸發股票行情更新 |

## 開發與測試

### 安裝依賴

```bash
npm install
```

### 開發常用指令

- **編譯專案**：`npm run compile`
- **監聽變更並自動編譯**：`npm run watch`
- **語法與規範檢查**：`npm run lint`
- ** TypeScript 型別檢查**：`npm run check-types`
- **執行測試**：`npm test`
- **打包套件**：`npm run package`
- **打包為 `.vsix` 檔案**：`npx @vscode/vsce package`
