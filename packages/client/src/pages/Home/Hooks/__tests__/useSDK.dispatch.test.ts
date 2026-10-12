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


import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@docspace/shared/utils/common", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  frameCallbackData: vi.fn(),
  frameCallCommand: vi.fn(),
  frameHandlePing: () => false,
  toFrameMethodError: (err: unknown) => ({ error: String(err) }),
}));

import { frameCallbackData } from "@docspace/shared/utils/common";

import useSDK from "../useSDK";

const hostWindow = { postMessage: vi.fn() } as unknown as Window;

const files = [{ id: 1, title: "Report.docx" }];

const renderSdk = (props: Record<string, unknown> = {}) =>
  renderHook(() =>
    useSDK({
      frameConfig: { frameId: "ds-frame" },
      setFrameConfig: vi.fn(),
      setFrameCustomActions: vi.fn(),
      selectedFolderStore: { id: 7, title: "Deal", settingsStore: {}, getIcon: () => "" },
      folders: [],
      files,
      filesList: files,
      selection: [],
      isLoading: true,
      ...props,
    } as Parameters<typeof useSDK>[0]),
  );

const callMethod = async (methodName: string, callId: number, data?: unknown) => {
  await act(async () => {
    window.dispatchEvent(
      new MessageEvent("message", {
        data: JSON.stringify({ data: { methodName, callId, data } }),
        source: hostWindow,
      }),
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
};

describe("useSDK method dispatch in Manager mode", () => {
  beforeEach(() => {
    vi.spyOn(window, "parent", "get").mockReturnValue(hostWindow);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.mocked(frameCallbackData).mockClear();
  });

  it("answers a method of another mode with the wrong-mode reply", async () => {
    renderSdk();

    await callMethod("navigateSection", 1, { section: "trash" });

    expect(frameCallbackData).toHaveBeenCalledWith(
      "Wrong method for this mode",
      1,
    );
  });

  it("resolves a Manager method with its data", async () => {
    renderSdk();

    await callMethod("getFiles", 2);

    expect(frameCallbackData).toHaveBeenCalledWith(files, 2);
  });

  it("answers with the method error when the handler throws", async () => {
    renderSdk({
      getRooms: vi.fn(async () => {
        throw new Error("Forbidden");
      }),
    });

    await callMethod("getRooms", 3);

    expect(frameCallbackData).toHaveBeenCalledWith(
      { error: "Error: Forbidden" },
      3,
    );
  });

  it("hands setCustomActions to the settings store", async () => {
    const setFrameCustomActions = vi.fn();
    renderSdk({ setFrameCustomActions });

    const config = { contextMenu: { file: [{ key: "send", label: "Send" }] } };
    await callMethod("setCustomActions", 4, config);

    expect(setFrameCustomActions).toHaveBeenCalledWith(config);
    expect(frameCallbackData).toHaveBeenCalledWith({}, 4);
  });

  it("answers getFolderInfo with a serializable folder without the store", async () => {
    renderSdk();

    await callMethod("getFolderInfo", 5);

    const [folder, callId] = vi.mocked(frameCallbackData).mock.calls[0];
    expect(callId).toBe(5);
    expect(folder).toEqual({ id: 7, title: "Deal" });
    expect(JSON.parse(JSON.stringify(folder))).toEqual(folder);
  });

  it("ignores messages that do not come from the host window", async () => {
    renderSdk();

    await act(async () => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: JSON.stringify({ data: { methodName: "getFiles", callId: 6 } }),
        }),
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(frameCallbackData).not.toHaveBeenCalled();
  });
});
