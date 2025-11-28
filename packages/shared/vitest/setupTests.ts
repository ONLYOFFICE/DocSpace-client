// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
// @ts-nocheck

import { TextDecoder, TextEncoder } from "util";
import React from "react";
import { vi } from "vitest";
import "@testing-library/jest-dom/vitest";

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
