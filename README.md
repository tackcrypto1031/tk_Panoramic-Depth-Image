# tk_Panoramic-Depth-Image

https://github.com/tackcrypto1031/tk_Panoramic-Depth-Image/raw/main/video/tool-intro/tk_depthimg_intro_final.mp4

A local, single-user web viewer for **equirectangular panoramas with optional depth maps**. Upload a panorama (and, if you have it, a depth map), and view it in the browser with:

- 360° orbit-drag rotation
- Depth-based sphere displacement (geometric 3D)
- **Depth Mode** — locks the view and turns mouse movement into a camera-translation parallax for a strong "3D photo" feel

[中文說明 / Chinese README](./README.zh-TW.md)

---

## Quick start (Windows)

Double-click `start.bat`. On first run it will:

1. Check Node.js (v20+ required)
2. `npm install` dependencies
3. Initialize the `data/` directory
4. Build front-end + server (`npm run build`)
5. Start the server on `127.0.0.1:3001` and open your browser

Every subsequent run reuses the build if source files haven't changed. Closing the `start.bat` window terminates the server.

### Manual start (any OS)

```bash
npm install
npm run build
node dist/server/index.js
```

Then open `http://localhost:3001`.

## Development mode

```bash
npm run dev
```

- Vite dev server on `5173` with HMR
- Express API on `3001` via `tsx watch`
- Open `http://localhost:5173`

On Windows you can double-click `dev.bat`.

## Data layout

All user data lives under `./data/` (gitignored):

```
data/
├── items.json        # metadata index
├── uploads/<id>/     # panorama + optional depth per item
├── thumbs/           # item thumbnails
├── .trash/           # soft-delete staging (7-day retention)
└── logs/             # pino server logs
```

## Viewer controls

| Control | Effect |
| --- | --- |
| Drag | Rotate view (disabled in Depth Mode) |
| Mouse wheel | Zoom (FOV) |
| Depth Mode toggle | Locks view; mouse movement drives parallax |
| Depth strength | Geometric sphere displacement amount |
| Invert depth | Flip near/far convention (white=near by default) |
| Parallax strength | Camera translation range in Depth Mode |
| Auto-rotate | Slow continuous rotation |

### Keyboard shortcuts

- **Home:** `/` focus search
- **Viewer:** `Esc` back · `F` fullscreen · `Space` toggle auto-rotate · `R` reset settings · `?` shortcut help

## Tech stack

Node 20+ · Express · React 18 · Vite · TypeScript · react-three-fiber · three.js · Sharp · Zustand

## Testing

```bash
npm test          # unit + component tests (vitest)
npm run test:e2e  # end-to-end smoke tests (playwright)
```

## License

See [LICENSE](./LICENSE) (to be added — open-source license TBD).
