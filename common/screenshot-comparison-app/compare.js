/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const path = require("path");
const http = require("http");
const fs = require("fs");
const { chromium } = require("playwright");
const pixelmatch = require("pixelmatch").default;
const PNG = require("pngjs").PNG;

const IMAGES_DIR = path.resolve(__dirname, "images");
const UI_PATH = path.resolve(__dirname, "ui.html");

// ───────────────────── helpers ─────────────────────

/**
 * Resize a PNG image to the target dimensions using bilinear interpolation.
 * Returns a new PNG object with the resized data.
 */
function resizeImage(src, targetW, targetH) {
  const dst = new PNG({ width: targetW, height: targetH });
  const srcW = src.width;
  const srcH = src.height;
  const xRatio = srcW / targetW;
  const yRatio = srcH / targetH;

  for (let y = 0; y < targetH; y++) {
    const srcY = y * yRatio;
    const y0 = Math.floor(srcY);
    const y1 = Math.min(y0 + 1, srcH - 1);
    const yLerp = srcY - y0;

    for (let x = 0; x < targetW; x++) {
      const srcX = x * xRatio;
      const x0 = Math.floor(srcX);
      const x1 = Math.min(x0 + 1, srcW - 1);
      const xLerp = srcX - x0;

      const i00 = (y0 * srcW + x0) * 4;
      const i10 = (y0 * srcW + x1) * 4;
      const i01 = (y1 * srcW + x0) * 4;
      const i11 = (y1 * srcW + x1) * 4;
      const di = (y * targetW + x) * 4;

      for (let c = 0; c < 4; c++) {
        const top = src.data[i00 + c] * (1 - xLerp) + src.data[i10 + c] * xLerp;
        const bot = src.data[i01 + c] * (1 - xLerp) + src.data[i11 + c] * xLerp;
        dst.data[di + c] = Math.round(top * (1 - yLerp) + bot * yLerp);
      }
    }
  }

  return dst;
}

/**
 * Scale an image proportionally to cover the target size, then crop to fit.
 * Preserves aspect ratio — no stretching / distortion.
 * Crops from top-left (natural alignment for web pages).
 */
function fitAndCrop(src, targetW, targetH) {
  const scaleX = targetW / src.width;
  const scaleY = targetH / src.height;
  const scale = Math.max(scaleX, scaleY);

  const scaledW = Math.round(src.width * scale);
  const scaledH = Math.round(src.height * scale);

  const scaled = resizeImage(src, scaledW, scaledH);

  const cropX = 0;
  const out = new PNG({ width: targetW, height: targetH });

  for (let y = 0; y < targetH; y++) {
    for (let x = 0; x < targetW; x++) {
      const si = (y * scaledW + (x + cropX)) * 4;
      const di = (y * targetW + x) * 4;
      out.data[di] = scaled.data[si];
      out.data[di + 1] = scaled.data[si + 1];
      out.data[di + 2] = scaled.data[si + 2];
      out.data[di + 3] = scaled.data[si + 3];
    }
  }

  return out;
}

/**
 * Blend two images with 50 % opacity to produce an "overlap" view.
 * Both images must have identical dimensions.
 */
function createOverlapImage(imgA, imgB, width, height) {
  const out = new PNG({ width, height });

  for (let i = 0; i < imgA.data.length; i += 4) {
    out.data[i] = (imgA.data[i] + imgB.data[i]) >> 1;
    out.data[i + 1] = (imgA.data[i + 1] + imgB.data[i + 1]) >> 1;
    out.data[i + 2] = (imgA.data[i + 2] + imgB.data[i + 2]) >> 1;
    out.data[i + 3] = 255;
  }

  return PNG.sync.write(out);
}

// ───────────────────── main ────────────────────────

async function run() {
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  if (!fs.existsSync(UI_PATH)) {
    console.error("ui.html not found next to compare.js");
    process.exit(1);
  }

  const uiHtml = fs.readFileSync(UI_PATH, "utf-8");

  const server = http.createServer((req, res) => {
    if (req.url === "/") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(uiHtml);
    } else {
      res.writeHead(404);
      res.end("Not found");
    }
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  const uiUrl = `http://127.0.0.1:${port}`;

  console.log("Launching browser...\n");

  const browser = await chromium.launch({
    headless: false,
    args: [
      "--start-maximized",
      "--disable-web-security",
      "--disable-features=IsolateOrigins,site-per-process",
    ],
  });

  const context = await browser.newContext({
    viewport: null,
  });

  // Strip X-Frame-Options / CSP so DocSpace loads inside the iframe
  await context.route("**/*", async (route) => {
    try {
      const response = await route.fetch();
      const headers = { ...response.headers() };
      delete headers["x-frame-options"];
      delete headers["content-security-policy"];
      delete headers["content-security-policy-report-only"];
      await route.fulfill({ response, headers });
    } catch {
      await route.continue();
    }
  });

  const page = await context.newPage();

  // Save design file to images/design.png
  await page.exposeFunction("__saveDesign", async (designBase64) => {
    try {
      const buffer = Buffer.from(designBase64, "base64");
      const designPath = path.join(IMAGES_DIR, "design.png");
      fs.writeFileSync(designPath, buffer);
      console.log("Design saved to images/design.png");
      return JSON.stringify({ success: true });
    } catch (err) {
      console.error("Failed to save design:", err.message);
      return JSON.stringify({ error: err.message });
    }
  });

  // UI visibility helpers
  function hideUI() {
    return page.evaluate(() => {
      const panel = document.getElementById("comparison-panel");
      const overlay = document.getElementById("selection-overlay");
      const selBox = document.getElementById("selection-box");
      const resultPanel = document.getElementById("result-panel");
      if (panel) panel.style.visibility = "hidden";
      if (overlay) overlay.style.display = "none";
      if (selBox) selBox.style.display = "none";
      if (resultPanel) resultPanel.style.visibility = "hidden";
    });
  }

  function restoreUI() {
    return page.evaluate(() => {
      const panel = document.getElementById("comparison-panel");
      const resultPanel = document.getElementById("result-panel");
      if (panel) panel.style.visibility = "visible";
      if (resultPanel) resultPanel.style.visibility = "visible";
    });
  }

  // Take a screenshot
  // Mode A (no clip): CDP viewport override — for full-page comparison
  // Mode B (with clip): direct iframe screenshot — for modals, tooltips, panels
  await page.exposeFunction("__takeScreenshot", async (argsJSON) => {
    const args = argsJSON ? JSON.parse(argsJSON) : {};
    const clip = args.clip || null;
    const designW = args.designWidth || null;
    const designH = args.designHeight || null;

    // Mode B: direct iframe screenshot (Select Area — captures modals)
    if (clip) {
      const iframeEl = await page.$("#docspace-iframe");
      if (!iframeEl) {
        return JSON.stringify({ error: "Iframe element not found" });
      }

      const box = await iframeEl.boundingBox();
      if (!box) {
        return JSON.stringify({ error: "Cannot determine iframe position" });
      }

      const dpr = await page.evaluate(() => window.devicePixelRatio || 1);

      await hideUI();
      await page.waitForTimeout(60);

      const rawBuffer = await page.screenshot({
        clip: {
          x: box.x + clip.x,
          y: box.y + clip.y,
          width: clip.width,
          height: clip.height,
        },
      });

      await restoreUI();

      // Normalize to 1x if on a HiDPI / Retina display.
      // Design-fitting is handled later by __runComparison (fitAndCrop).
      let finalBuffer = rawBuffer;
      let outW = Math.round(clip.width);
      let outH = Math.round(clip.height);

      if (dpr > 1) {
        const rawImg = PNG.sync.read(rawBuffer);
        const targetW = Math.round(rawImg.width / dpr);
        const targetH = Math.round(rawImg.height / dpr);
        console.log(
          `DPR=${dpr}: normalizing ${rawImg.width}×${rawImg.height} → ${targetW}×${targetH}`,
        );
        finalBuffer = PNG.sync.write(resizeImage(rawImg, targetW, targetH));
        outW = targetW;
        outH = targetH;
      }

      fs.writeFileSync(path.join(IMAGES_DIR, "page.png"), finalBuffer);

      return JSON.stringify({
        base64: finalBuffer.toString("base64"),
        width: outW,
        height: outH,
      });
    }

    // Mode A: CDP viewport override (captures current state incl. modals)
    if (!designW || !designH) {
      return JSON.stringify({ error: "Design dimensions are required" });
    }

    const PANEL_H = 48;
    const vpH = designH + PANEL_H;

    console.log(
      `CDP override: ${designW}×${vpH} (design ${designW}×${designH})`,
    );

    const cdp = await page.context().newCDPSession(page);

    try {
      await cdp.send("Emulation.setDeviceMetricsOverride", {
        width: designW,
        height: vpH,
        deviceScaleFactor: 1,
        mobile: false,
      });

      await hideUI();
      await page.waitForTimeout(800);

      const iframeBox = await page.evaluate(() => {
        const iframe = document.getElementById("docspace-iframe");
        if (!iframe) return null;
        const rect = iframe.getBoundingClientRect();
        return {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        };
      });

      if (!iframeBox) {
        return JSON.stringify({ error: "Iframe element not found" });
      }

      const { data } = await cdp.send("Page.captureScreenshot", {
        format: "png",
        clip: { ...iframeBox, scale: 1 },
      });

      const buffer = Buffer.from(data, "base64");
      const img = PNG.sync.read(buffer);

      console.log(`Screenshot saved: ${img.width}×${img.height}`);
      fs.writeFileSync(path.join(IMAGES_DIR, "page.png"), buffer);

      return JSON.stringify({
        base64: data,
        width: img.width,
        height: img.height,
      });
    } catch (err) {
      return JSON.stringify({ error: "Screenshot failed: " + err.message });
    } finally {
      await cdp.send("Emulation.clearDeviceMetricsOverride");
      await restoreUI();

      // Force full reflow so page re-renders at actual window size
      await page.evaluate(() => {
        document.documentElement.style.display = "none";
        void document.documentElement.offsetHeight;
        document.documentElement.style.display = "";
      });

      await cdp.detach();
    }
  });

  // Run pixelmatch comparison
  await page.exposeFunction(
    "__runComparison",
    async (designBase64, screenshotBase64) => {
      const designImg = PNG.sync.read(Buffer.from(designBase64, "base64"));
      let pageImg = PNG.sync.read(Buffer.from(screenshotBase64, "base64"));

      let resizedFrom = null;

      if (
        designImg.width !== pageImg.width ||
        designImg.height !== pageImg.height
      ) {
        resizedFrom = `${pageImg.width}×${pageImg.height}`;
        console.log(
          `Auto-fit: screenshot ${resizedFrom} → ${designImg.width}×${designImg.height} (scale + crop)`,
        );
        pageImg = fitAndCrop(pageImg, designImg.width, designImg.height);
      }

      const { width, height } = designImg;
      const diff = new PNG({ width, height });

      const diffPixels = pixelmatch(
        designImg.data,
        pageImg.data,
        diff.data,
        width,
        height,
        { threshold: 0.1 },
      );

      const diffBuffer = PNG.sync.write(diff);
      fs.writeFileSync(path.join(IMAGES_DIR, "diff.png"), diffBuffer);

      const overlapBuffer = createOverlapImage(
        designImg,
        pageImg,
        width,
        height,
      );

      const totalPixels = width * height;
      const diffPercent = ((diffPixels / totalPixels) * 100).toFixed(2);

      console.log(
        `Comparison: ${width}×${height}, diff ${diffPercent}% (${diffPixels.toLocaleString()} px)`,
      );

      return JSON.stringify({
        diffBase64: diffBuffer.toString("base64"),
        overlapBase64: overlapBuffer.toString("base64"),
        width,
        height,
        totalPixels,
        diffPixels,
        diffPercent,
        resizedFrom,
      });
    },
  );

  // Open the UI
  await page.goto(uiUrl);

  const cleanup = () => {
    server.close();
    browser.close().catch(() => {});
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  await new Promise((resolve) => browser.on("disconnected", resolve));
  server.close();
}

run().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});

