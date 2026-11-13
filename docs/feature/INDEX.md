# 功能文件索引 (Feature Documentation Index)

本目錄包含 VS Code Stock Explorer 擴充功能的所有功能規格與需求文件。

## 功能文件清單

| 編號 | 功能名稱 | 文件路徑 | 說明 |
| --- | --- | --- | --- |
| 1 | 股票狀態清單 (list) | [list/README.md](./list/README.md) | 在 View Container 的 Tree View 中顯示股票即時行情與未實現損益 |
| 2 | 自動輪詢與狀態更新 (update) | [update/README.md](./update/README.md) | 視圖聚焦時依設定秒數自動輪詢更新（含載入進度條顯示），隱藏時停止更新 |
| 3 | 新增股票 (add stock) | [add-stock/README.md](./add-stock/README.md) | 透過 QuickPick 搜尋股票並加入追蹤清單 |
| 4 | 移除股票 (remove stock) | [remove-stock/README.md](./remove-stock/README.md) | 從追蹤清單中刪除股票（包含二次確認對話框機制） |
| 5 | 買進股票 (buy stock) | [buy-stock/README.md](./buy-stock/README.md) | 輸入買進數量與單價，更新 `settings.json` 持股明細 |
| 6 | 賣出股票 (sell stock) | [sell-stock/README.md](./sell-stock/README.md) | 輸入賣出數量，依 FIFO 原則扣減 `settings.json` 持股明細 |
| 7 | 拖曳重新排序 (reorder stock) | [reorder-stock/README.md](./reorder-stock/README.md) | 在 Tree View 中透過拖曳調整股票項目的顯示順序，並同步更新設定檔 |
