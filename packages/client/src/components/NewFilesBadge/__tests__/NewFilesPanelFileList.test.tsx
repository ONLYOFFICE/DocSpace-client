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

import type React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
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

// The shared mock renders only the children of Trans; the "show more" link
// is one of its components.
vi.mock("react-i18next", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  Trans: ({ components }: { components: Record<number, React.ReactNode> }) =>
    components[1],
}));

import { NewFilesPanelFileList } from "../sub-components/NewFilesPanelFileList";

const ROOM_ID = 10;
const identity = { publicKey: "pk" };

const file = (id: number, encrypted = true) => ({
  id,
  title: `opaque-${id}.docx`,
  fileExst: ".docx",
  encrypted,
  viewUrl: `http://x/${id}`,
});

const renderList = (items: ReturnType<typeof file>[]) =>
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
      <NewFilesPanelFileList
        items={items as never}
        isRooms={false}
        onClose={vi.fn()}
        roomId={ROOM_ID}
      />
    </Provider>,
  );

describe("NewFilesPanelFileList — encrypted names", () => {
  it("New files panel", async () => {
    mocks.getCached.mockReturnValue(identity);

    const { container } = renderList([
      file(601),
      file(602),
      file(603, false),
      file(604, false),
      file(605),
    ]);

    await waitFor(() =>
      expect(mocks.recoverEncryptedFilenames).toHaveBeenCalledWith(
        [
          { id: 601, viewUrl: "http://x/601" },
          { id: 602, viewUrl: "http://x/602" },
        ],
        "user-1",
        identity,
        ROOM_ID,
      ),
    );
    act(() => rememberEncryptedFilename(601, "Quarterly report.docx"));
    expect(await screen.findByText("Quarterly report")).toBeInTheDocument();

    fireEvent.click(container.querySelector(".more-items__link")!);

    await waitFor(() =>
      expect(mocks.recoverEncryptedFilenames).toHaveBeenCalledTimes(2),
    );
    expect(mocks.recoverEncryptedFilenames).toHaveBeenLastCalledWith(
      [{ id: 605, viewUrl: "http://x/605" }],
      "user-1",
      identity,
      ROOM_ID,
    );
  });

  it("Identity locked", () => {
    mocks.getCached.mockReturnValue(null);

    renderList([file(701), file(702)]);

    expect(screen.getByText("opaque-701")).toBeInTheDocument();
    expect(mocks.recoverEncryptedFilenames).not.toHaveBeenCalled();
    expect(mocks.requireUnlock).not.toHaveBeenCalled();
  });
});
