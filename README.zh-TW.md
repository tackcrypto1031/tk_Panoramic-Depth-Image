# tk_Panoramic-Depth-Image

https://github.com/tackcrypto1031/tk_Panoramic-Depth-Image/raw/main/video/tool-intro/tk_depthimg_intro_final.mp4

本地單人使用的 Web 檢視器,支援 **equirectangular 全景圖 + 可選的深度圖**。上傳全景圖(以及深度圖,如果有的話),在瀏覽器中以下列方式呈現:

- 360° 拖曳旋轉
- 基於深度圖的球面 displacement(幾何層面的 3D)
- **深度效果模式** — 鎖住視角,滑鼠移動觸發相機位移視差,產生強烈的「3D 照片」感

[English README](./README.md)

---

## 快速開始(Windows)

雙擊 `start.bat`,第一次執行會自動:

1. 檢查 Node.js(需 v20+)
2. `npm install` 安裝依賴
3. 初始化 `data/` 資料夾
4. 建置前後端(`npm run build`)
5. 在 `127.0.0.1:3001` 啟動 server 並開啟瀏覽器

之後每次重跑會偵測原始碼變更,沒變就直接用舊 build。**關掉 `start.bat` 視窗 = 停止 server**。

### 手動啟動(其他作業系統)

```bash
npm install
npm run build
node dist/server/index.js
```

然後打開 `http://localhost:3001`。

## 開發模式

```bash
npm run dev
```

- Vite dev server 在 `5173`(HMR)
- Express API 在 `3001`(`tsx watch`)
- 打開 `http://localhost:5173`

Windows 可直接雙擊 `dev.bat`。

## 資料存放

所有使用者資料都在 `./data/`(不進 git):

```
data/
├── items.json        # metadata 索引
├── uploads/<id>/     # 每個項目的全景圖 + 深度圖
├── thumbs/           # 縮圖
├── .trash/           # 軟刪除暫存(7 天)
└── logs/             # pino server 日誌
```

## Viewer 操作

| 控制 | 效果 |
| --- | --- |
| 拖曳 | 旋轉視角(深度模式時停用) |
| 滾輪 | 縮放(改變 FOV) |
| 深度效果模式 | 鎖住視角,滑鼠移動產生視差 |
| 深度強度 | 球面凹凸幅度 |
| 反轉深度 | 切換近/遠的顏色約定(預設白=近) |
| 視差強度 | 深度模式下相機位移幅度 |
| 自動旋轉 | 緩慢連續旋轉 |

### 快捷鍵

- **首頁:** `/` 聚焦搜尋
- **Viewer:** `Esc` 返回 · `F` 全螢幕 · `Space` 切換自動旋轉 · `R` 重設參數 · `?` 快捷鍵說明

## 技術棧

Node 20+ · Express · React 18 · Vite · TypeScript · react-three-fiber · three.js · Sharp · Zustand

## 測試

```bash
npm test          # 單元 + component 測試(vitest)
npm run test:e2e  # 端對端煙霧測試(playwright)
```

## License

見 [LICENSE](./LICENSE)(將補上開源授權)。
