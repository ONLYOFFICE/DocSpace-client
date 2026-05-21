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
// @ts-nocheck

import { TextDecoder, TextEncoder } from "util";
import React from "react";
import { vi } from "vitest";
import "@testing-library/jest-dom/vitest";

import enCommon from "PUBLIC_DIR/locales/en/Common.json";

(
  window as unknown as {
    i18n: {
      t: (key: string) => string;
      loaded: Record<string, { data: Record<string, string> }>;
    };
  }
).i18n = {
  t: (key: string) => enCommon[key as keyof typeof enCommon] ?? key,
  loaded: { "en/Common.json": { data: enCommon } },
};

class MockDOMRect {
  static fromRect(other?: DOMRectInit): DOMRect {
    const rect = other || { x: 0, y: 0, width: 0, height: 0 };
    return new MockDOMRect(rect.x, rect.y, rect.width, rect.height);
  }

  bottom: number;

  height: number;

  left: number;

  right: number;

  top: number;

  width: number;

  x: number;

  y: number;

  constructor(x = 0, y = 0, width = 0, height = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.top = y;
    this.right = x + width;
    this.bottom = y + height;
    this.left = x;
  }

  toJSON() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      top: this.top,
      right: this.right,
      bottom: this.bottom,
      left: this.left,
    };
  }
}

// Mock DOMRect globally
global.DOMRect = MockDOMRect;

interface TransProps {
  t: (key: string, values?: Record<string, unknown>) => string;
  i18nKey: string;
  values?: Record<string, unknown>;
  components?: Record<string, React.ReactElement>;
  ns?: string;
  children?: React.ReactNode;
}

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: () => new Promise(() => {}),
    },
    ready: true,
  }),
  Trans: ({ t, i18nKey, values }: TransProps) => {
    return t(i18nKey, { ...values });
  },
}));

vi.mock("../utils/image-helpers", () => ({
  iconSize24: new Map(),
  iconSize32: new Map(),
  iconSize64: new Map(),
  iconSize96: new Map(),
}));

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// @tanem/svg-injector uses SVGSVGElement which jsdom doesn't provide
if (typeof SVGSVGElement === "undefined") {
  global.SVGSVGElement = class SVGSVGElement {} as unknown as typeof SVGSVGElement;
}

// Node.js 22+ exposes a built-in `localStorage` that lacks standard Web Storage
// methods (clear, setItem, etc.), which shadows the jsdom implementation.
// Provide a spec-compliant in-memory Storage mock so that tests calling
// `vi.spyOn(Storage.prototype, ...)` work correctly.
class MockStorage {
  store: Record<string, string> = {};

  getItem(key: string): string | null {
    return key in this.store ? this.store[key] : null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }

  get length(): number {
    return Object.keys(this.store).length;
  }
}

Object.defineProperty(globalThis, "Storage", {
  value: MockStorage,
  writable: true,
});
Object.defineProperty(globalThis, "localStorage", {
  value: new MockStorage(),
  writable: true,
});
Object.defineProperty(globalThis, "sessionStorage", {
  value: new MockStorage(),
  writable: true,
});

if (typeof Blob !== "undefined" && !Blob.prototype.arrayBuffer) {
  // biome-ignore lint/suspicious/noExplicitAny: polyfilling missing DOM API
  (Blob.prototype as any).arrayBuffer = function arrayBuffer() {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(this);
    });
  };
}

// ---------------------------------------------------------------------------
// Silent-failure guard for `[ENCRYPTION] ...` console.error
// ---------------------------------------------------------------------------
// The encryption wrap chain (UploadDataStore, room-encryption) historically
// caught all errors and only console.error-ed them. Vitest does not fail on
// console.error by default, so a silent server rejection (e.g. 403 on
// PUT /files/{id}/access) used to slip through tests.
//
// This guard captures every console.error call whose formatted output contains
// "[ENCRYPTION]" and fails the test in afterEach unless it was explicitly
// whitelisted via `allowConsoleError(/pattern/ | "substring")`.
import { beforeEach as _beforeEach, afterEach as _afterEach } from "vitest";

const unexpectedEncryptionErrors: string[] = [];
const allowedErrorPatterns: (RegExp | string)[] = [];

const originalConsoleError = console.error.bind(console);
console.error = (...args: unknown[]) => {
  const formatted = args
    .map((a) => {
      if (a instanceof Error) return `${a.message} ${a.stack ?? ""}`;
      if (typeof a === "string") return a;
      try {
        return JSON.stringify(a);
      } catch {
        return String(a);
      }
    })
    .join(" ");
  if (formatted.includes("[ENCRYPTION]")) {
    const allowed = allowedErrorPatterns.some((p) =>
      typeof p === "string" ? formatted.includes(p) : p.test(formatted),
    );
    if (!allowed) {
      unexpectedEncryptionErrors.push(formatted);
    }
  }
  originalConsoleError(...args);
};

(globalThis as Record<string, unknown>).allowConsoleError = (
  matcher: RegExp | string,
) => {
  allowedErrorPatterns.push(matcher);
};

_beforeEach(() => {
  unexpectedEncryptionErrors.length = 0;
  allowedErrorPatterns.length = 0;
});

_afterEach(() => {
  if (unexpectedEncryptionErrors.length > 0) {
    const messages = unexpectedEncryptionErrors.slice();
    unexpectedEncryptionErrors.length = 0;
    throw new Error(
      "Unexpected `[ENCRYPTION]` console.error in test (silent-failure guard):\n  " +
        messages.join("\n  ") +
        "\nIf this is intentional, call `allowConsoleError(/pattern/)` at the start of the test.",
    );
  }
});
