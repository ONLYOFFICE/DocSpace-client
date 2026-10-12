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

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildRecoveryKitHtml,
  downloadRecoveryKitHtml,
  escapeHtml,
  type RecoveryKitParams,
} from "../recovery-kit";

const WORDS = Array.from({ length: 24 }, (_, i) => `word${i + 1}`);

const baseParams = (): RecoveryKitParams => ({
  words: WORDS,
  createdDate: "01/01/2026",
  lang: "en",
  dir: "ltr",
  accountLabel: "user@example.com",
  strings: {
    title: "DocSpace recovery kit",
    subtitle: "Keep this document safe.",
    createdLabel: "Created",
    accountLabel: "Account",
    phraseLabel: "Recovery phrase",
    whatTitle: "What is this?",
    whatText: "This 24-word phrase restores access.",
    howTitle: "How to use it",
    howText: "Enter the words in order.",
    storageTitle: "How to store it",
    storageText: "Print and keep it safe.",
    warning: "Never share it.",
    footer: "Generated on your device.",
  },
});

describe("escapeHtml", () => {
  it("escapes all HTML-sensitive characters", () => {
    expect(escapeHtml(`<img src=x onerror="a" & 'b'>`)).toBe(
      "&lt;img src=x onerror=&quot;a&quot; &amp; &#39;b&#39;&gt;",
    );
  });
});

describe("buildRecoveryKitHtml", () => {
  it("renders the phrase as one plain space-separated line (matches the restore input)", () => {
    const html = buildRecoveryKitHtml(baseParams());
    expect(html).toContain(WORDS.join(" "));
  });

  it("contains every localized string and the account label", () => {
    const params = baseParams();
    const html = buildRecoveryKitHtml(params);
    Object.values(params.strings).forEach((value) => {
      expect(html).toContain(value);
    });
    expect(html).toContain("user@example.com");
    expect(html).toContain("01/01/2026");
  });

  it("omits the account row when accountLabel is absent", () => {
    const params = baseParams();
    delete params.accountLabel;
    const html = buildRecoveryKitHtml(params);
    expect(html).not.toContain("user@example.com");
    expect(html).not.toContain(">Account:");
  });

  it("uses the title as the document <title> (default PDF filename)", () => {
    const html = buildRecoveryKitHtml(baseParams());
    expect(html).toContain("<title>DocSpace recovery kit</title>");
  });

  it("sets lang and dir on the root element", () => {
    const params = baseParams();
    params.lang = "ar-SA";
    params.dir = "rtl";
    const html = buildRecoveryKitHtml(params);
    expect(html).toContain(`<html lang="ar-SA" dir="rtl">`);
    expect(html).toContain(`class="words" dir="ltr"`);
  });

  it("escapes malicious dynamic values", () => {
    const params = baseParams();
    params.accountLabel = `<script>alert(1)</script>`;
    params.strings.title = `<img src=x onerror=alert(1)>`;
    const html = buildRecoveryKitHtml(params);
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;script&gt;");
  });

  it("includes a CSP meta tag and references no external resources", () => {
    const html = buildRecoveryKitHtml(baseParams());
    expect(html).toContain(
      `http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"`,
    );
    expect(html).not.toMatch(/src\s*=\s*["']https?:/i);
    expect(html).not.toMatch(/href\s*=\s*["']https?:/i);
    expect(html).not.toMatch(/url\(/i);
  });
});

describe("downloadRecoveryKitHtml", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("downloads a blob link with the given filename and revokes the URL", () => {
    vi.useFakeTimers();
    const createObjectURL = vi.fn(
      (_source: Blob | MediaSource) => "blob:mock-url",
    );
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL,
      revokeObjectURL,
    });

    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    downloadRecoveryKitHtml("<!doctype html>", "DocSpace-recovery-kit.html");

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    const blob = createObjectURL.mock.calls[0][0] as Blob;
    expect(blob.type).toBe("text/html;charset=utf-8");

    expect(revokeObjectURL).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    expect(document.querySelector("a[download]")).toBeNull();
  });
});
