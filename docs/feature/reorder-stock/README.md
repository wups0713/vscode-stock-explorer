# 功能需求：股票清單拖曳重新排序 (Reorder Stock)

## 1. 功能描述與目標

本功能允許使用者在 View Container 的 Tree View 中透過拖曳（Drag and Drop）調整股票項目的顯示順序，並將新的順序持久化儲存至 `settings.json` 全域設定檔。

## 2. 使用者價值與背景

提供直覺的拖放體驗，讓使用者自由排列關心的股票順序（例如將重要持股移至頂端），無需手動變更 JSON 設定檔中的陣列順序。

## 3. 功能需求清單

- **拖放對象與限制：**
  - 僅允許拖曳第一層股票項目（`StockTreeQuoteItem`）。
  - 不允許拖曳第二層持股明細項目（`StockTreeDetailItem`）。
  - 支援按住 `Ctrl` / `Shift` 鍵的多選拖曳，被選取的股票將保持相對順序整體移動。
- **放置目標與位置邏輯：**
  - 若放置在目標股票項目上，拖曳項目將移動至該目標股票之前。
  - 若放置在持股明細項目上，系統自動識別該明細所屬的父級股票項目，並將拖曳項目移動至該父股票之前。
  - 若放置在空白處（`target` 為 `undefined`），拖曳項目將移動至股票清單的最末端。
- **資料持久化與介面同步：**
  - 完成拖放後，自動更新 `settings.json` 全域設定中的 `stockExplorer.stocks` 陣列順序。
  - 設定更新後自動刷新 Tree View 視圖。

## 4. 主要使用場景與範例

- **場景 A：調整股票顯示順序**
  - 使用者在 Tree View 中將排名第三的股票拖曳並放置於第一支股票上。
  - 該股票變更至第一位，`settings.json` 全域設定中的 `stockExplorer.stocks` 陣列順序同步更動，Tree View 隨即呈現最新順序。

## 5. 預期成果與交付物

- 功能需求規格文件：`docs/feature/reorder-stock/README.md`
- 註冊於 `docs/feature/INDEX.md`
