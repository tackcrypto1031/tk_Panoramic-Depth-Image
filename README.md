# tk_depthimg

本地單人全景 + 深度圖檢視器。上傳 equirectangular 全景圖（必填）與深度圖（可選），在瀏覽器中呈現球面 displacement + 滑鼠 translation 視差效果。

## 快速開始（Windows）

雙擊 `start.bat` 即可。第一次執行會自動：

1. 檢查 Node.js（需 v20+）
2. 安裝依賴（`npm install`）
3. 初始化 `data/` 資料夾
4. 建置前後端（`npm run build`）
5. 啟動 server（`127.0.0.1:3001`）
6. 開啟預設瀏覽器

之後每次雙擊：偵測到 server 已在執行就只開瀏覽器新 tab。

## 開發模式

雙擊 `dev.bat` 或手動 `npm run dev`：

- Vite dev server（5173，HMR）+ Express API（3001，tsx watch）
- 瀏覽器打開 `http://localhost:5173`

## 強制重建

`rebuild.bat`（刪 `dist/` 後重 build）。

## 資料儲存

全部儲存在 `./data/`（不進 git）：

```
data/
├── items.json  # metadata
├── uploads/<id>/  # panorama + depth
├── thumbs/  # 縮圖
├── .trash/  # 軟刪除暫存 7 天
└── logs/  # pino 日誌
```

## 設計文件

- 設計：[`docs/superpowers/specs/2026-04-23-panorama-depth-viewer-design.md`](docs/superpowers/specs/2026-04-23-panorama-depth-viewer-design.md)
- 實作計畫：[`docs/superpowers/plans/2026-04-23-panorama-depth-viewer.md`](docs/superpowers/plans/2026-04-23-panorama-depth-viewer.md)

## 快捷鍵

- 首頁：`/` 聚焦搜尋
- Viewer：`Esc` 返回 / `F` 全螢幕 / `Space` 切換自動旋轉 / `R` 重設參數 / `?` 說明

## 技術棧

Node 20+ / Express / React 18 / Vite / TypeScript / react-three-fiber / Sharp / zustand

## 測試

```bash
npm test         # 單元 + component 測試（vitest）
npm run test:e2e # playwright smoke
```

## License

Private / internal tool.
