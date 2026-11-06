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

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { TFolder } from "@docspace/shared/api/files/types";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@docspace/shared/api/files", () => ({
  getPresignedUri: vi.fn(async () => ({
    url: "http://portal.test/presigned",
    filetype: "png",
    token: "",
  })),
  getReferenceData: vi.fn(),
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { error: vi.fn(), success: vi.fn(), info: vi.fn() },
}));

const insertImage = vi.fn();
vi.mock("@/utils", () => ({
  getDocEditor: () => ({ insertImage }),
}));

import { getPresignedUri } from "@docspace/shared/api/files";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

import useSelectFileDialog from "../useSelectFileDialog";

const ENCRYPTED_ID = 41;
const PLAIN_ID = 42;

describe("useSelectFileDialog", () => {
  let root: Root | null = null;
  let dialog: ReturnType<typeof useSelectFileDialog>;

  const render = () => {
    const Probe = () => {
      dialog = useSelectFileDialog({ instanceId: "1" });
      return null;
    };
    root = createRoot(document.createElement("div"));
    act(() => root?.render(<Probe />));
  };

  const loadRoomFiles = (isInsidePrivateRoom: boolean) =>
    act(() =>
      dialog.onFilesLoadedSelectFileDialog(
        [
          { id: ENCRYPTED_ID, title: "a1b2c3.png", encrypted: true },
          { id: PLAIN_ID, title: "logo.png" },
        ],
        { folderId: 10, roomId: 10, isInsidePrivateRoom },
      ),
    );

  const submit = (id: number, isInsidePrivateRoom: boolean) =>
    dialog.onSubmitSelectFileDialog(
      id,
      "",
      false,
      [],
      "",
      false,
      {} as TFolder,
      { id, title: "picked.png" },
      false,
      false,
      isInsidePrivateRoom,
    );

  const isDisabled = (id: number, isInsidePrivateRoom: boolean) =>
    dialog.getIsDisabledSelectFileDialog(
      false,
      false,
      id,
      "files",
      false,
      undefined,
      { id, title: "picked.png" },
      false,
      false,
      false,
      isInsidePrivateRoom,
    );

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("Encrypted file picked: it is disabled in the list and refused with Common:PrivateRoomEditorNotSupported", async () => {
    render();
    act(() => dialog.onSDKRequestInsertImage({ data: {} }));
    loadRoomFiles(false);

    expect(dialog.selectFileDialogDisabledItems).toEqual([ENCRYPTED_ID]);
    expect(isDisabled(ENCRYPTED_ID, false)).toBe(true);

    await act(async () => submit(ENCRYPTED_ID, false));

    expect(toastr.info).toHaveBeenCalledWith("Common:PrivateRoomEditorNotSupported");
    expect(getPresignedUri).not.toHaveBeenCalled();
    expect(insertImage).not.toHaveBeenCalled();
  });

  it("File picked inside a private room: the pick is refused whatever the list reported", async () => {
    render();
    act(() => dialog.onSDKRequestInsertImage({ data: {} }));

    expect(isDisabled(PLAIN_ID, true)).toBe(true);

    await act(async () => submit(PLAIN_ID, true));

    expect(toastr.info).toHaveBeenCalledWith("Common:PrivateRoomEditorNotSupported");
    expect(getPresignedUri).not.toHaveBeenCalled();
  });

  it("Plain file picked: the presigned address is handed to the editor", async () => {
    render();
    act(() => dialog.onSDKRequestInsertImage({ data: {} }));
    loadRoomFiles(false);

    expect(isDisabled(PLAIN_ID, false)).toBe(false);

    await act(async () => submit(PLAIN_ID, false));

    expect(getPresignedUri).toHaveBeenCalledWith(PLAIN_ID);
    expect(insertImage).toHaveBeenCalledWith(
      expect.objectContaining({ url: "http://portal.test/presigned" }),
    );
    expect(toastr.info).not.toHaveBeenCalled();
  });
});
