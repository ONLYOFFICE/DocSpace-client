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

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type Mock,
} from "vitest";

vi.mock("@docspace/shared/utils/common", () => ({
  frameCallCommand: vi.fn(),
}));

import { frameCallCommand } from "@docspace/shared/utils/common";
import {
  externalStorageGet,
  externalStorageSet,
  isExternalStorageAvailable,
  __resetExternalStorageForTests,
} from "./externalStorage";

const frameCallCommandMock = frameCallCommand as Mock;

let fakeParent: Window;
let originalParent: PropertyDescriptor | undefined;

const setIframeContext = (inIframe: boolean) => {
  if (!inIframe) {
    if (originalParent) {
      Object.defineProperty(window, "parent", originalParent);
      originalParent = undefined;
    }
    return;
  }
  if (!originalParent) {
    originalParent = Object.getOwnPropertyDescriptor(window, "parent");
  }
  fakeParent = {} as Window;
  Object.defineProperty(window, "parent", {
    value: fakeParent,
    configurable: true,
  });
};

const dispatchReturn = (callId: number, data: unknown) => {
  const event = new MessageEvent("message", {
    data: JSON.stringify({
      frameId: "test-frame",
      type: "onExternalDataReturn",
      callId,
      data,
    }),
    source: fakeParent,
  });
  window.dispatchEvent(event);
};

const lastCommandData = (): { key: string; callId: number } => {
  const calls = frameCallCommandMock.mock.calls;
  const last = calls[calls.length - 1];
  return last[1] as { key: string; callId: number };
};

describe("externalStorage", () => {
  beforeEach(() => {
    __resetExternalStorageForTests();
    frameCallCommandMock.mockClear();
    setIframeContext(true);
  });

  afterEach(() => {
    setIframeContext(false);
    __resetExternalStorageForTests();
  });

  describe("externalStorageGet", () => {
    it("sends getExternalData command with key and callId", async () => {
      const promise = externalStorageGet("foo");
      expect(frameCallCommandMock).toHaveBeenCalledTimes(1);
      const [name, payload] = frameCallCommandMock.mock.calls[0];
      expect(name).toBe("getExternalData");
      expect((payload as { key: string }).key).toBe("foo");
      expect(typeof (payload as { callId: number }).callId).toBe("number");

      const { callId } = payload as { callId: number };
      dispatchReturn(callId, { hello: "world" });
      await expect(promise).resolves.toEqual({ hello: "world" });
    });

    it("returns null on timeout", async () => {
      vi.useFakeTimers();
      try {
        const promise = externalStorageGet("foo", 100);
        await vi.advanceTimersByTimeAsync(101);
        await expect(promise).resolves.toBeNull();
      } finally {
        vi.useRealTimers();
      }
    });

    it("matches parallel responses by callId", async () => {
      const p1 = externalStorageGet<string>("a");
      const id1 = lastCommandData().callId;

      const p2 = externalStorageGet<string>("b");
      const id2 = lastCommandData().callId;

      expect(id1).not.toBe(id2);

      dispatchReturn(id2, "B");
      dispatchReturn(id1, "A");

      await expect(p1).resolves.toBe("A");
      await expect(p2).resolves.toBe("B");
    });

    it("ignores messages with mismatched callId", async () => {
      vi.useFakeTimers();
      try {
        const promise = externalStorageGet("foo", 200);
        const { callId } = lastCommandData();
        dispatchReturn(callId + 999, "wrong");
        await vi.advanceTimersByTimeAsync(201);
        await expect(promise).resolves.toBeNull();
      } finally {
        vi.useRealTimers();
      }
    });

    it("ignores messages with wrong type", async () => {
      vi.useFakeTimers();
      try {
        const promise = externalStorageGet("foo", 200);
        const { callId } = lastCommandData();
        const event = new MessageEvent("message", {
          data: JSON.stringify({
            type: "somethingElse",
            callId,
            data: "x",
          }),
          source: fakeParent,
        });
        window.dispatchEvent(event);
        await vi.advanceTimersByTimeAsync(201);
        await expect(promise).resolves.toBeNull();
      } finally {
        vi.useRealTimers();
      }
    });

    it("ignores messages from a different source", async () => {
      vi.useFakeTimers();
      try {
        const promise = externalStorageGet("foo", 200);
        const { callId } = lastCommandData();
        const event = new MessageEvent("message", {
          data: JSON.stringify({
            type: "onExternalDataReturn",
            callId,
            data: "x",
          }),
          source: {} as Window,
        });
        window.dispatchEvent(event);
        await vi.advanceTimersByTimeAsync(201);
        await expect(promise).resolves.toBeNull();
      } finally {
        vi.useRealTimers();
      }
    });

    it("returns null immediately when not in iframe", async () => {
      setIframeContext(false);
      const result = await externalStorageGet("foo");
      expect(result).toBeNull();
      expect(frameCallCommandMock).not.toHaveBeenCalled();
    });
  });

  describe("externalStorageSet", () => {
    it("sends setExternalData command with key and value", async () => {
      await externalStorageSet("foo", { x: 1 });
      expect(frameCallCommandMock).toHaveBeenCalledWith("setExternalData", {
        key: "foo",
        value: { x: 1 },
      });
    });

    it("does nothing when not in iframe", async () => {
      setIframeContext(false);
      await externalStorageSet("foo", { x: 1 });
      expect(frameCallCommandMock).not.toHaveBeenCalled();
    });

    it("swallows errors thrown by frameCallCommand", async () => {
      frameCallCommandMock.mockImplementationOnce(() => {
        throw new Error("postMessage failed");
      });
      await expect(externalStorageSet("foo", "bar")).resolves.toBeUndefined();
    });
  });

  describe("isExternalStorageAvailable", () => {
    it("resolves to true when probe response arrives (any value)", async () => {
      const promise = isExternalStorageAvailable();
      const { callId } = lastCommandData();
      dispatchReturn(callId, null);
      await expect(promise).resolves.toBe(true);
    });

    it("resolves to false on timeout", async () => {
      vi.useFakeTimers();
      try {
        const promise = isExternalStorageAvailable();
        await vi.advanceTimersByTimeAsync(2000);
        await expect(promise).resolves.toBe(false);
      } finally {
        vi.useRealTimers();
      }
    });

    it("caches the result", async () => {
      const promise = isExternalStorageAvailable();
      const { callId } = lastCommandData();
      dispatchReturn(callId, null);
      await promise;

      frameCallCommandMock.mockClear();
      await expect(isExternalStorageAvailable()).resolves.toBe(true);
      expect(frameCallCommandMock).not.toHaveBeenCalled();
    });
  });
});
