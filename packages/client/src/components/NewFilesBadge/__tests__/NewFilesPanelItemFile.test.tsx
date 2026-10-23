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

import { NewFilesPanelItemFile } from "../sub-components/NewFilesPanelItemFile";

const ROOM_ID = 10;
const identity = { publicKey: "pk" };

const renderItem = (fileId: number) =>
  render(
    <Provider
      settingsStore={{ currentDeviceType: "desktop", setArticleOpen: vi.fn() }}
      filesSettingsStore={{
        displayFileExtension: false,
        getIcon: () => "icon.svg",
      }}
      filesActionsStore={{
        checkAndOpenLocationAction: vi.fn(),
        markAsRead: vi.fn(),
        openItemAction: vi.fn(),
      }}
      filesStore={{ openDocEditor: vi.fn() }}
      userStore={{ user: { id: "user-1" } }}
    >
      <NewFilesPanelItemFile
        item={
          {
            id: fileId,
            title: `opaque-${fileId}.docx`,
            fileExst: ".docx",
            encrypted: true,
            viewUrl: `http://x/${fileId}`,
          } as never
        }
        isRooms={false}
        onClose={vi.fn()}
        roomId={ROOM_ID}
      />
    </Provider>,
  );

describe("NewFilesPanelItemFile — encrypted names", () => {
  it("New files panel", async () => {
    mocks.getCached.mockReturnValue(identity);

    renderItem(501);

    await waitFor(() =>
      expect(mocks.recoverEncryptedFilenames).toHaveBeenCalledWith(
        [{ id: 501, viewUrl: "http://x/501" }],
        "user-1",
        identity,
        ROOM_ID,
      ),
    );
    act(() => rememberEncryptedFilename(501, "Quarterly report.docx"));
    expect(await screen.findByText("Quarterly report")).toBeInTheDocument();
  });

  it("Identity locked", () => {
    mocks.getCached.mockReturnValue(null);

    renderItem(502);

    expect(screen.getByText("opaque-502")).toBeInTheDocument();
    expect(mocks.recoverEncryptedFilenames).not.toHaveBeenCalled();
    expect(mocks.requireUnlock).not.toHaveBeenCalled();
  });
});
