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

import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { rememberEncryptedFilename } from "@docspace/shared/services/encryption/filename-cache";

const mocks = vi.hoisted(() => ({
  getCached: vi.fn(),
  requireUnlock: vi.fn(),
  recoverEncryptedFilenames: vi.fn(async () => {}),
}));

vi.mock("@docspace/shared/services/encryption/secret-storage", async (io) => {
  const actual = (await io()) as {
    SecretStorage: Record<string, unknown>;
  };
  return {
    ...actual,
    SecretStorage: { ...actual.SecretStorage, getCached: mocks.getCached },
    requireUnlock: mocks.requireUnlock,
  };
});

vi.mock(
  "@docspace/shared/services/private-room/encrypted-filename-recovery",
  async (io) => ({
    ...((await io()) as Record<string, unknown>),
    recoverEncryptedFilenames: mocks.recoverEncryptedFilenames,
  }),
);

import { usePickerFileTitles } from "../usePickerFileTitles";

const DEST_ROOM_ID = 60;
const identity = { publicKey: "pk" };

const encryptedFile = (id: number) => ({
  id,
  title: `opaque-${id}.docx`,
  fileExst: ".docx",
  encrypted: true,
  viewUrl: `http://x/${id}`,
});

const loadIntoPrivateRoom = (
  onFilesLoaded: ReturnType<typeof usePickerFileTitles>["onFilesLoaded"],
  file: ReturnType<typeof encryptedFile>,
) =>
  act(() =>
    onFilesLoaded([file], {
      folderId: DEST_ROOM_ID,
      roomId: DEST_ROOM_ID,
      isInsidePrivateRoom: true,
    }),
  );

describe("usePickerFileTitles", () => {
  it("Destination picker in a private room", async () => {
    mocks.getCached.mockReturnValue(identity);
    const file = encryptedFile(801);

    const { result } = renderHook(() => usePickerFileTitles("user-1"));
    expect(result.current.resolveItemTitle(file)).toBe("opaque-801.docx");

    loadIntoPrivateRoom(result.current.onFilesLoaded, file);

    await waitFor(() =>
      expect(mocks.recoverEncryptedFilenames).toHaveBeenCalledWith(
        [{ id: 801, viewUrl: "http://x/801" }],
        "user-1",
        identity,
        DEST_ROOM_ID,
      ),
    );

    const versionBefore = result.current.itemTitlesVersion;
    act(() => rememberEncryptedFilename(801, "Plan.docx"));

    expect(result.current.itemTitlesVersion).not.toBe(versionBefore);
    expect(result.current.resolveItemTitle(file)).toBe("Plan.docx");
    expect(
      result.current.resolveItemTitle({ ...file, id: 802, encrypted: false }),
    ).toBeUndefined();
  });

  it("recovers a page of files in one batch for its room", async () => {
    mocks.getCached.mockReturnValue(identity);

    const { result } = renderHook(() => usePickerFileTitles("user-1"));
    act(() =>
      result.current.onFilesLoaded([encryptedFile(811), encryptedFile(812)], {
        folderId: DEST_ROOM_ID,
        roomId: DEST_ROOM_ID,
        isInsidePrivateRoom: true,
      }),
    );

    await waitFor(() =>
      expect(mocks.recoverEncryptedFilenames).toHaveBeenCalledTimes(1),
    );
    expect(mocks.recoverEncryptedFilenames).toHaveBeenCalledWith(
      [
        { id: 811, viewUrl: "http://x/811" },
        { id: 812, viewUrl: "http://x/812" },
      ],
      "user-1",
      identity,
      DEST_ROOM_ID,
    );
  });

  it("Picker while locked", () => {
    mocks.getCached.mockReturnValue(null);
    const file = encryptedFile(803);

    const { result } = renderHook(() => usePickerFileTitles("user-1"));
    loadIntoPrivateRoom(result.current.onFilesLoaded, file);

    expect(result.current.resolveItemTitle(file)).toBe("opaque-803.docx");
    expect(mocks.recoverEncryptedFilenames).not.toHaveBeenCalled();
    expect(mocks.requireUnlock).not.toHaveBeenCalled();
  });
});
