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

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { RoomsType } from "@docspace/shared/enums";
import type { TTranslation } from "@docspace/shared/types";

import type { TUploadTarget } from "SRC_DIR/store/uploadDataStore/helpers";

import { useSectionDrop } from "../useSectionDrop";

const t = ((key: string) => key) as unknown as TTranslation;
const files = [{ name: "plan.txt" }] as never;

const privateRoomOpen: TUploadTarget = {
  folderId: 50,
  isPrivate: true,
  roomType: RoomsType.CustomRoom,
  encryptionRoomId: 50,
};

const ordinaryRoomOpen: TUploadTarget = {
  folderId: 70,
  isPrivate: false,
  roomType: RoomsType.EditingRoom,
  encryptionRoomId: 70,
};

const renderSectionDrop = (canUpload = true) => {
  let open = privateRoomOpen;
  const createFoldersTree = vi.fn(async () => files);
  const startUpload = vi.fn();

  const { result } = renderHook(() =>
    useSectionDrop({
      t,
      canUpload,
      disableDrag: false,
      dragging: false,
      setDragging: vi.fn(),
      resolveOpenFolderTarget: () => open,
      createFoldersTree: createFoldersTree as never,
      startUpload,
    }),
  );

  return {
    ...result.current,
    createFoldersTree,
    startUpload,
    openFolder: (next: TUploadTarget) => {
      open = next;
    },
  };
};

describe("useSectionDrop", () => {
  it("uploads into the folder that was open at the native drop event", async () => {
    const section = renderSectionDrop();

    section.onDropCapture();
    section.openFolder(ordinaryRoomOpen);
    section.onDrop(files);

    await vi.waitFor(() =>
      expect(section.startUpload).toHaveBeenCalledWith(
        files,
        privateRoomOpen,
        t,
      ),
    );
    expect(section.createFoldersTree).toHaveBeenCalledWith(
      t,
      files,
      privateRoomOpen,
      false,
    );
  });

  it("takes each drop's own snapshot", async () => {
    const section = renderSectionDrop();

    section.onDropCapture();
    section.onDrop(files);
    section.openFolder(ordinaryRoomOpen);
    section.onDrop(files);

    await vi.waitFor(() => expect(section.startUpload).toHaveBeenCalledTimes(2));
    expect(section.startUpload.mock.calls.map(([, target]) => target)).toEqual([
      privateRoomOpen,
      ordinaryRoomOpen,
    ]);
  });

  it("uploads nothing where the open folder takes no uploads", () => {
    const section = renderSectionDrop(false);

    section.onDropCapture();
    section.onDrop(files);

    expect(section.createFoldersTree).not.toHaveBeenCalled();
    expect(section.startUpload).not.toHaveBeenCalled();
  });
});
