// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// eslint-disable @typescript-eslint/no-unused-vars

import { TextDecoder, TextEncoder } from "util";
import React from "react";

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

jest.mock("react-i18next", () => ({
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

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
