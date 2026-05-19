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
