# 功能需求：移除股票 (Remove Stock)

## 1. 功能描述與目標

本功能允許使用者將不再關注的股票從追蹤清單中刪除，並同步自 `settings.json` 中移除對應設定與歷史持股紀錄。

## 2. 使用者價值與背景

維護簡潔的自訂股票清單，避免追蹤過多不相關標的，同時提供防呆確認機制以防誤刪重要的持股資料。

## 3. 功能需求清單

- **觸發入口：**
  - Tree Item 右側 Inline Action（垃圾桶圖示）。
  - Tree Item 右鍵上下文選單（Context Menu）：「刪除股票」。
  - 命令面板（Command Palette）：`Stock Explorer: Remove Stock` (`stockExplorer.removeStock`)。
- **二次確認防呆機制：**
  - **無論該股票是否有持股紀錄（Holdings）**，點擊移除時皆必須跳出二次確認對話框。
  - 對話框訊息內容：`確定要從追蹤列表中移除 [股票名稱/代碼] 嗎？`
  - 提供選項目：「確定移除」、「取消」。
- **資料更新與視圖刷新：**
  - 使用者點擊「確定移除」後，自 `settings.json` 的 `stockExplorer.stocks` 陣列中刪除該股票物件。
  - 成功刪除後跳出 Notification 提示，並立即刷新 Tree View 介面。

## 4. 主要使用場景與範例

- **場景 A：從 Tree Item 點擊垃圾桶按鈕**
  - 使用者將滑鼠懸停於 `tse_2330.tw` 股票節點，點擊右側垃圾桶圖示。
  - 系統彈出確認對話框，點擊「確定移除」後，該股票自列表中消失。

## 5. 預期成果與交付物

- 功能需求規格文件：`docs/feature/remove-stock/README.md`
- 註冊於 `docs/feature/INDEX.md`

## 6. 約束條件與限制

- 移除操作不可逆，必須確認對話框選擇「確定」後方可執行寫入 `settings.json`。
