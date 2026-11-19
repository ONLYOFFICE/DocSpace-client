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
  toFrameMethodError: (err: unknown) => ({ isError: true, message: String(err) }),
}));

vi.mock("@docspace/shared/services/private-room/upload-target", () => ({
  resolveFolderTarget: vi.fn(),
}));

import { frameCallbackData } from "@docspace/shared/utils/common";
import { resolveFolderTarget } from "@docspace/shared/services/private-room/upload-target";

import useSDK from "../useSDK";

const hostWindow = { postMessage: vi.fn() } as unknown as Window;
const PRIVATE = { folderId: 7020, isPrivate: true, encryptionRoomId: 7001 };
const PLAIN = { folderId: 50, isPrivate: false, encryptionRoomId: 50 };

const createFile = vi.fn(async () => ({ id: 1, title: "Plan.docx" }));
const createFolder = vi.fn(async () => ({ id: 2, title: "Drafts" }));
const refreshFiles = vi.fn();

const renderSdk = (isPrivateRoomsSectionAvailable: boolean) =>
  renderHook(() =>
    useSDK({
      frameConfig: { frameId: "ds-frame" },
      setFrameConfig: vi.fn(),
      setFrameCustomActions: vi.fn(),
      selectedFolderStore: { id: 7, title: "Deal" },
      folders: [],
      files: [],
      filesList: [],
      selection: [],
      isLoading: false,
      createFile,
      createFolder,
      refreshFiles,
      isPrivateRoomsSectionAvailable,
    } as unknown as Parameters<typeof useSDK>[0]),
  );

const callMethod = async (methodName: string, data: unknown) => {
  await act(async () => {
    window.dispatchEvent(
      new MessageEvent("message", {
        data: JSON.stringify({ data: { methodName, callId: 1, data } }),
        source: hostWindow,
      }),
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  return vi.mocked(frameCallbackData).mock.calls.at(-1)?.[0] as {
    isError?: boolean;
  };
};

describe("useSDK frame methods that create in a private room", () => {
  beforeEach(() => {
    vi.spyOn(window, "parent", "get").mockReturnValue(hostWindow);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.mocked(frameCallbackData).mockClear();
    createFile.mockClear();
    createFolder.mockClear();
    refreshFiles.mockClear();
    vi.mocked(resolveFolderTarget).mockReset();
  });

  it.each([true, false])(
    "File created into a private room through a frame method (opt-in: %s)",
    async (optIn) => {
      vi.mocked(resolveFolderTarget).mockResolvedValue(PRIVATE as never);
      renderSdk(optIn);

      const res = await callMethod("createFile", { folderId: 7020, title: "Plan" });

      expect(res.isError).toBe(true);
      expect(createFile).not.toHaveBeenCalled();
      expect(refreshFiles).not.toHaveBeenCalled();
    },
  );

  it("Folder created into a private room without the opt-in", async () => {
    vi.mocked(resolveFolderTarget).mockResolvedValue(PRIVATE as never);
    renderSdk(false);

    const res = await callMethod("createFolder", {
      parentFolderId: 7020,
      title: "Drafts",
    });

    expect(res.isError).toBe(true);
    expect(createFolder).not.toHaveBeenCalled();
    expect(refreshFiles).not.toHaveBeenCalled();
  });

  it("Folder created into a private room with the opt-in", async () => {
    vi.mocked(resolveFolderTarget).mockResolvedValue(PRIVATE as never);
    renderSdk(true);

    const res = await callMethod("createFolder", {
      parentFolderId: 7020,
      title: "Drafts",
    });

    expect(res).toEqual({ id: 2, title: "Drafts" });
    expect(createFolder).toHaveBeenCalledWith(7020, "Drafts");
  });

  it("Folder outside private rooms", async () => {
    vi.mocked(resolveFolderTarget).mockResolvedValue(PLAIN as never);
    renderSdk(false);

    expect(await callMethod("createFile", { folderId: 50, title: "Plan" })).toEqual(
      { id: 1, title: "Plan.docx" },
    );
    expect(
      await callMethod("createFolder", { parentFolderId: 50, title: "Drafts" }),
    ).toEqual({ id: 2, title: "Drafts" });
    expect(refreshFiles).toHaveBeenCalledTimes(2);
  });

  it("Folder outside private rooms: a section alias makes no path request", async () => {
    renderSdk(false);

    expect(await callMethod("createFile", { folderId: "@my", title: "Plan" })).toEqual(
      { id: 1, title: "Plan.docx" },
    );
    expect(resolveFolderTarget).not.toHaveBeenCalled();
    expect(createFile).toHaveBeenCalledWith("@my", "Plan", undefined, undefined);
  });

  it("a folder whose path cannot be read gets nothing created", async () => {
    vi.mocked(resolveFolderTarget).mockRejectedValue(new Error("403"));
    renderSdk(true);

    const res = await callMethod("createFolder", {
      parentFolderId: 7020,
      title: "Drafts",
    });

    expect(res.isError).toBe(true);
    expect(createFolder).not.toHaveBeenCalled();
  });
});
