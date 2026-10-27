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

import { FeedActionKeys } from "@docspace/shared/api/rooms/types";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const identity = { publicKey: new Uint8Array() };

const mocks = vi.hoisted(() => ({
  recoverEncryptedFilenames: vi.fn(async () => {}),
  getFileInfo: vi.fn(async (id: number) => ({ viewUrl: `/view/${id}` })),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
  Trans: () => null,
}));

vi.mock("next/navigation", () => ({ usePathname: () => "/private/10" }));

vi.mock("@docspace/shared/api/files", () => ({
  getFileInfo: mocks.getFileInfo,
}));

vi.mock("@docspace/shared/services/encryption/secret-storage", async (io) => {
  const actual = (await io()) as { SecretStorage: Record<string, unknown> };
  return {
    ...actual,
    SecretStorage: { ...actual.SecretStorage, getCached: () => identity },
  };
});

vi.mock(
  "@docspace/shared/services/private-room/encrypted-filename-recovery",
  async (io) => ({
    ...((await io()) as Record<string, unknown>),
    recoverEncryptedFilenames: mocks.recoverEncryptedFilenames,
  }),
);

vi.mock("@docspace/shared/context/encryption/EncryptionContext", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  useEncryptionOptional: () => ({ isUnlocked: true }),
}));

vi.mock("@/app/(docspace)/_hooks/useItemIcon", () => ({
  default: () => ({ getIcon: () => "" }),
}));
vi.mock("@/app/(docspace)/_hooks/useFolderActions", () => ({
  default: () => ({ openLocation: vi.fn() }),
}));
vi.mock("@/app/(personal-files)/_store/DocsSettingsStore", () => ({
  useDocsSettingsStore: () => ({ filesSettings: null }),
}));
vi.mock("@/app/(personal-files)/_store/DocsUserStore", () => ({
  useDocsUserStore: () => ({ user: { id: "me" } }),
}));
vi.mock("./useFeedTranslation", () => ({
  useFeedTranslation: () => ({ getFeedTranslation: () => null }),
}));

import {
  EncryptedFileActionsContext,
  type EncryptedFileActions,
} from "@/app/(docspace)/_contexts/EncryptedFileActionsContext";
import HistoryBlock from "./HistoryBlock";

const fileFeed = (id: number) => ({
  action: { key: FeedActionKeys.FileCreated },
  date: "2026-10-20T09:00:00.000Z",
  initiator: { id: "me", displayName: "Me" },
  data: { id, title: `opaque-${id}.docx`, parentId: 10 },
});

describe("HistoryBlock in a private room", () => {
  let root: Root | null = null;

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("recovers the names of a history entry and of its related entries", async () => {
    const feed = { ...fileFeed(7), related: [fileFeed(8)] };
    root = createRoot(document.createElement("div"));
    await act(async () => {
      root?.render(
        <EncryptedFileActionsContext.Provider
          value={{ roomId: 10 } as EncryptedFileActions}
        >
          <HistoryBlock feed={feed as never} isLastEntity />
        </EncryptedFileActionsContext.Provider>,
      );
    });

    expect(mocks.getFileInfo).toHaveBeenCalledWith(7);
    expect(mocks.getFileInfo).toHaveBeenCalledWith(8);
    expect(mocks.recoverEncryptedFilenames).toHaveBeenCalledWith(
      [
        { id: 7, viewUrl: "/view/7" },
        { id: 8, viewUrl: "/view/8" },
      ],
      "me",
      identity,
      10,
    );
  });
});
