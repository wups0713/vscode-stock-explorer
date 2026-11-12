# 功能需求：股票狀態清單與檢視 (List Stock State)

## 1. 功能描述與目標

本功能旨在 VS Code 的 View Container 中，以樹狀結構（Tree View）呈現使用者追蹤的股票即時行情與個人持股部位狀態。使用者可自由切換行情模式與損益模式，以快速掌握市場走勢或個人投資組合績效。

## 2. 使用者價值與業務背景

開發人員在工作過程中需要簡潔、不干擾工作流程的即時股市資訊與投資組合管理工具。提供可切換的樹狀視圖，可大幅提升資訊讀取效率並維持介面乾淨。

## 3. 功能需求清單

- **樹狀結構展現：**
  - 第一層（股票主節點）：
    - **版面呈現方式：** 採用 VS Code Tree View 的 Label 與 Description/Badge 樣式。左側（Label）顯示 `[股票代碼/名稱]`，右側（Description）顯示數據資訊。
    - **行情模式（Quote Mode）：** 
      - 左側 (Label)：`[股票代碼/名稱]`
      - 右側 (Description)：`當前股價 | 當日漲跌 (漲跌幅%)`
    - **損益模式（Profit/Loss Mode）：** 
      - 左側 (Label)：`[股票代碼/名稱]`
      - 右側 (Description)：`未實現損益 | 未實現損益率%`
  - 第二層（詳細資訊子節點）：
    - 顯示該股票的持股數量 (Shares/Amount)。
    - 顯示加權平均成本 (Average Cost)。
    - 顯示總投資成本 (Total Cost)。
    - 顯示當前總市值 (Current Market Value)。
- **漲跌顏色設定（Color Settings）：**
  - **設定項目：**
    - `stockExplorer.riseColor`：漲價標示顏色，預設值為 `red`，提供常見顏色，也可輸入色碼 `#ffffff`，無法解析時則不設定顏色。
    - `stockExplorer.fallColor`：跌價標示顏色，預設值為 `green`，提供常見顏色，也可輸入色碼 `#ffffff`，無法解析時則不設定顏色。
  - 亦支援使用者自由調整（例如習慣美股紅跌綠漲者可自訂對調）。
- **模式切換控制：**
  - 於 View Container 的標題列（Title Bar）提供切換按鈕，點擊可於「行情模式」與「損益模式」間切換。
- **計算邏輯規範：**
  - 總持股數量 $N = \sum \text{holding.amount}$
  - 持股總成本 $C = \sum (\text{holding.amount} \times \text{holding.price})$
  - 平均持股成本 $P_{avg} = \frac{C}{N}$
  - 未實現損益 = $(\text{當前股價} - P_{avg}) \times N$
  - 未實現損益率(%) = $\frac{\text{未實現損益}}{C} \times 100\%$

## 4. 主要使用場景與範例

- **場景 A：快速瀏覽市場行情**
  - 使用者在 View Container 標題列選擇行情模式，第一層節點即時顯示如 `tse_2330.tw 台積電 | 580.0 | +5.0 (+0.87%)`。
- **場景 B：檢視個人投資組合績效**
  - 使用者切換至損益模式，第一層節點顯示 `tse_2330.tw 台積電 | +15,000 | +5.17%`。
  - 使用者展開子節點，檢視具體持股張數、平均買進成本與總市值。

## 5. 預期成果與交付物

- 功能需求規格文件：`docs/feature/list/README.md`
- 註冊於 `docs/feature/INDEX.md`

## 6. 約束條件與限制

- 股票清單資料需讀取自 `settings.json` 中的 `stockExplorer.stocks`。
