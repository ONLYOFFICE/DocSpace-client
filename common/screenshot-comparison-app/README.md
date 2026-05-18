# Screenshot Comparison Tool

An interactive tool for pixel-by-pixel comparison of DocSpace screenshots against Figma designs.

## How it works

Opens a Chromium browser via Playwright with a control panel and an iframe where you can:

- Load DocSpace by URL, log in, and navigate to the page, modal, or panel you need
- Load a Figma design as a PNG
- Select a specific area to compare or compare the full page
- See the result: diff, overlap view, and mismatch percentage

Results are saved to `./images/`: `page.png`, `diff.png`.

## Setup and run

### Mac / Linux

```bash
cd common/screenshot-comparison-app
chmod +x run.screenshot-comparison.sh
./run.screenshot-comparison.sh
```

### Windows

```cmd
cd common\screenshot-comparison-app
run.screenshot-comparison.bat
```

### Manual

```bash
cd common/screenshot-comparison-app
npm install
npx playwright install chromium
npm run compare
```

## Usage

1. Enter a DocSpace URL in the top input and press Enter
2. Log in and navigate to the page you need (open a modal or panel if necessary)
3. Click **Load Design** and select a PNG file from Figma
4. Optionally click **Select Area** and drag to select a region
5. Click **Compare**
6. The result opens in a side panel with tabs: Diff, Screenshot, Design, Overlap

## Important

- Export Figma designs at **1x** scale (PNG)
- Browser zoom must be **100%** (Cmd+0 / Ctrl+0) — non-standard zoom distorts the CSS-to-pixel ratio and produces inaccurate results
