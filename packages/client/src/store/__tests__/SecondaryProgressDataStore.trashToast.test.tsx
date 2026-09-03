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

import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OPERATIONS_NAME } from "@docspace/shared/constants";
import { ROOMS_SECTION_FOLDER_TYPES } from "@docspace/shared/utils/rooms";
import { toastr } from "@docspace/ui-kit/components/toast";

import { createFolderNavigation } from "SRC_DIR/helpers/createFolderNavigation";

import SecondaryProgressDataStore from "../SecondaryProgressDataStore";

vi.mock("SRC_DIR/i18n", () => ({
  default: { t: (key: string) => key },
}));

vi.mock("@docspace/ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), error: vi.fn(), clear: vi.fn() },
}));

vi.mock("SRC_DIR/helpers/createFolderNavigation", () => ({
  createFolderNavigation: vi.fn(),
}));

const TRASH_FOLDER_ID = 2;

const trashFolderInfo = { id: TRASH_FOLDER_ID, title: "Trash" };

const createStore = () =>
  new SecondaryProgressDataStore({ trashFolderInfo } as never, {
    visible: false,
    setMediaViewerData: vi.fn(),
  } as never);

const clickToastLocationLink = () => {
  const toastNode = vi.mocked(toastr.success).mock.calls[0][0] as ReactElement<{
    components: Record<number, ReactElement<{ onClick: () => void }>>;
  }>;

  toastNode.props.components[1].props.onClick();
};

// Bug 83666: the trash folder is shared by every section, so the toast link
// built from the destination folder alone always opened the unscoped Files
// trash, even for a file deleted inside a room.
describe("SecondaryProgressDataStore trash toast", () => {
  let navigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    navigate = vi.fn();

    window.DocSpace = {
      navigate,
      location: { pathname: "/rooms/shared/12345/filter" },
    } as never;

    // clearMocks resets the factory implementation between tests
    vi.mocked(createFolderNavigation).mockImplementation(
      (async (item: { id: number; title: string }) => ({
        url: `/files/${item.id}/filter?folder=${item.id}`,
        state: { title: item.title },
      })) as never,
    );
  });

  it("opens the trash of the section the item was deleted from", async () => {
    const store = createStore();

    await store.showToast(
      {
        title: "Document.docx",
        itemsCount: 1,
        isFolder: false,
        destFolderInfo: trashFolderInfo as never,
      },
      OPERATIONS_NAME.trash,
    );

    clickToastLocationLink();

    expect(navigate).toHaveBeenCalledTimes(1);

    const [url] = navigate.mock.calls[0];
    const [path, search] = (url as string).split("?");
    const params = new URLSearchParams(search);

    expect(path).toBe("/rooms/trash/filter");
    expect(params.get("folder")).toBe(String(TRASH_FOLDER_ID));
    expect(params.getAll("folderType").map(Number)).toEqual(
      ROOMS_SECTION_FOLDER_TYPES,
    );
  });

  it("keeps the destination folder link for a move operation", async () => {
    const store = createStore();

    await store.showToast(
      {
        title: "Document.docx",
        itemsCount: 1,
        isFolder: false,
        destFolderInfo: { id: 55, title: "Reports" } as never,
      },
      OPERATIONS_NAME.move,
    );

    clickToastLocationLink();

    expect(navigate).toHaveBeenCalledWith("/files/55/filter?folder=55", {
      state: { title: "Reports" },
    });
  });
});
