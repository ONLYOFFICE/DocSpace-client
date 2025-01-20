/* @ts-nocheck */

/* eslint-disable @typescript-eslint/no-unused-vars */

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
