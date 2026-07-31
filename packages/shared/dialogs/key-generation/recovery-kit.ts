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

export type RecoveryKitStrings = {
  title: string;
  subtitle: string;
  createdLabel: string;
  accountLabel: string;
  phraseLabel: string;
  whatTitle: string;
  whatText: string;
  howTitle: string;
  howText: string;
  storageTitle: string;
  storageText: string;
  warning: string;
  footer: string;
};

export type RecoveryKitParams = {
  words: string[];
  strings: RecoveryKitStrings;
  createdDate: string;
  lang: string;
  dir: "ltr" | "rtl";
  accountLabel?: string;
};

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const KIT_CSS = `
  @page { size: A4; margin: 20mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: #1f2229;
    background: #fff;
  }
  header {
    border-bottom: 2px solid #1f2229;
    padding-bottom: 12px;
    margin-bottom: 20px;
  }
  h1 { font-size: 22px; margin: 0 0 4px; }
  h2 { font-size: 15px; margin: 20px 0 6px; }
  p { margin: 0; }
  .subtitle { color: #444; margin-bottom: 12px; }
  .meta { font-size: 13px; color: #444; }
  .meta-label { font-weight: 600; }
  .words {
    border: 1px solid #999;
    border-radius: 8px;
    padding: 16px;
    margin-top: 8px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.8;
    overflow-wrap: break-word;
  }
  .warning {
    border: 2px solid #b00020;
    border-radius: 8px;
    padding: 12px 16px;
    font-weight: 600;
    margin-top: 24px;
    break-inside: avoid;
  }
  footer {
    margin-top: 24px;
    padding-top: 8px;
    border-top: 1px solid #ccc;
    color: #555;
    font-size: 12px;
  }
`;

export function buildRecoveryKitHtml(params: RecoveryKitParams): string {
  const { words, strings, createdDate, lang, dir, accountLabel } = params;

  const phraseText = escapeHtml(words.join(" "));

  const accountRow = accountLabel
    ? `<div><span class="meta-label">${escapeHtml(strings.accountLabel)}:</span> ${escapeHtml(accountLabel)}</div>`
    : "";

  return `<!doctype html>
<html lang="${escapeHtml(lang)}" dir="${dir === "rtl" ? "rtl" : "ltr"}">
<head>
<meta charset="utf-8" />
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'" />
<title>${escapeHtml(strings.title)}</title>
<style>${KIT_CSS}</style>
</head>
<body>
<header>
  <h1>${escapeHtml(strings.title)}</h1>
  <p class="subtitle">${escapeHtml(strings.subtitle)}</p>
  <div class="meta">
    <div><span class="meta-label">${escapeHtml(strings.createdLabel)}:</span> ${escapeHtml(createdDate)}</div>
    ${accountRow}
  </div>
</header>
<section>
  <h2>${escapeHtml(strings.phraseLabel)}</h2>
  <div class="words" dir="ltr">${phraseText}</div>
</section>
<section>
  <h2>${escapeHtml(strings.whatTitle)}</h2>
  <p>${escapeHtml(strings.whatText)}</p>
</section>
<section>
  <h2>${escapeHtml(strings.howTitle)}</h2>
  <p>${escapeHtml(strings.howText)}</p>
</section>
<section>
  <h2>${escapeHtml(strings.storageTitle)}</h2>
  <p>${escapeHtml(strings.storageText)}</p>
</section>
<div class="warning">${escapeHtml(strings.warning)}</div>
<footer>${escapeHtml(strings.footer)}</footer>
</body>
</html>`;
}

const PRINT_CLEANUP_TIMEOUT_MS = 3 * 60 * 1000;

export function printRecoveryKit(html: string): void {
  const iframe = document.createElement("iframe");
  iframe.style.cssText =
    "position:fixed;top:-10000px;left:-10000px;width:210mm;height:297mm;border:0;";
  iframe.setAttribute("aria-hidden", "true");
  iframe.setAttribute("tabindex", "-1");

  let cleanedUp = false;
  let timeoutId: number | undefined;
  let sawBlur = false;
  const onWindowBlur = () => {
    sawBlur = true;
  };
  const onWindowFocus = () => {
    if (sawBlur) cleanup();
  };
  const cleanup = () => {
    if (cleanedUp) return;
    cleanedUp = true;
    window.clearTimeout(timeoutId);
    window.removeEventListener("blur", onWindowBlur);
    window.removeEventListener("focus", onWindowFocus);
    iframe.remove();
  };

  iframe.addEventListener(
    "load",
    () => {
      const frameWindow = iframe.contentWindow;
      if (!frameWindow) {
        cleanup();
        return;
      }
      frameWindow.addEventListener("afterprint", cleanup);
      window.addEventListener("blur", onWindowBlur);
      window.addEventListener("focus", onWindowFocus);
      timeoutId = window.setTimeout(cleanup, PRINT_CLEANUP_TIMEOUT_MS);
      try {
        frameWindow.focus();
        frameWindow.print();
      } catch {
        cleanup();
      }
    },
    { once: true },
  );

  iframe.srcdoc = html;
  document.body.appendChild(iframe);
}

export function downloadRecoveryKitHtml(html: string, filename: string): void {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
