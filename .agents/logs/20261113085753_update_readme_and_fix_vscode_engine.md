# 工作日誌

## 工作目標
- 於 README.md 新增 `.vsix` 打包說明。
- 修正打包時出現的 `@types/vscode` 與 `engines.vscode` 版本不匹配錯誤。

## 執行結果
- 更新 `README.md` 新增打包為 `.vsix` 檔案之指令。
- 更新 `package.json` 中的 `engines.vscode` 與 `@types/vscode` 版本為 `^1.90.0`。
- 執行 `npm run check-types` 驗證型別無誤。
- 經使用者確認後提交 commit。

## 遇到的問題與解決方案
- **問題**：執行打包工具時回報 `ERROR @types/vscode ^1.140.0 greater than engines.vscode ^1.80.0`。
- **解決方案**：將 `package.json` 中的 `engines.vscode` 與 `@types/vscode` 版本一致調整為 `^1.90.0`。
