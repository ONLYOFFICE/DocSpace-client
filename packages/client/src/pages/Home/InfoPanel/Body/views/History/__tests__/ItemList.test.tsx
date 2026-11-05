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

import { act, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "mobx-react";
import { describe, expect, it, vi } from "vitest";

import { FeedAction } from "@docspace/shared/api/rooms/types";
import { rememberEncryptedFilename } from "@docspace/shared/services/encryption/filename-cache";

const mocks = vi.hoisted(() => ({
  getCached: vi.fn(),
  requireUnlock: vi.fn(),
  recoverEncryptedFilenames: vi.fn(async () => {}),
  getFileInfo: vi.fn(),
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

vi.mock("@docspace/shared/api/files", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  getFileInfo: mocks.getFileInfo,
}));

import HistoryItemList from "../HistoryBlockContent/ItemList";

const ROOM_ID = 10;
const identity = { publicKey: "pk" };

const createdFeed = (fileId: number) =>
  ({
    id: 1,
    action: { id: 1, key: "FileCreated" },
    date: "2026-10-22T10:00:00",
    initiator: { id: "user-1" },
    data: { id: fileId, title: `opaque-${fileId}.docx`, parentId: ROOM_ID },
    related: [],
  }) as never;

const renderHistory = (fileId: number) =>
  render(
    <Provider
      infoPanelStore={{
        getInfoPanelItemIcon: () => "icon.svg",
        infoPanelRoomSelection: { id: ROOM_ID, private: true },
      }}
      filesActionsStore={{
        nameWithoutExtension: (title: string) => title.replace(/\.[^.]+$/, ""),
        checkAndOpenLocationAction: vi.fn(),
        openItemAction: vi.fn(),
      }}
      filesStore={{ getFileInfo: vi.fn(), getFolderInfo: vi.fn() }}
      selectedFolderStore={{ id: ROOM_ID }}
      userStore={{ user: { id: "user-1" } }}
    >
      <HistoryItemList
        feed={createdFeed(fileId)}
        actionType={FeedAction.Create}
        targetType="file"
      />
    </Provider>,
  );

describe("History — encrypted names", () => {
  it("History tab", async () => {
    mocks.getCached.mockReturnValue(identity);
    mocks.getFileInfo.mockResolvedValue({ id: 701, viewUrl: "http://x/701" });

    renderHistory(701);

    await waitFor(() =>
      expect(mocks.recoverEncryptedFilenames).toHaveBeenCalledWith(
        [{ id: 701, viewUrl: "http://x/701" }],
        "user-1",
        identity,
        ROOM_ID,
      ),
    );
    expect(mocks.getFileInfo).toHaveBeenCalledWith(701);
    act(() => rememberEncryptedFilename(701, "Budget plan.xlsx"));
    expect(await screen.findByText("Budget plan")).toBeInTheDocument();
  });

  it("Identity locked", () => {
    mocks.getCached.mockReturnValue(null);

    renderHistory(702);

    expect(screen.getByText("opaque-702")).toBeInTheDocument();
    expect(mocks.getFileInfo).not.toHaveBeenCalled();
    expect(mocks.recoverEncryptedFilenames).not.toHaveBeenCalled();
    expect(mocks.requireUnlock).not.toHaveBeenCalled();
  });
});
