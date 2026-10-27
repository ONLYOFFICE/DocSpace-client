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

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const mocks = vi.hoisted(() => ({
  selection: null as Record<string, unknown> | null,
  tabs: [] as { id: string }[],
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@onlyoffice/apps-ui-kit/components/aside", () => ({
  AsideHeader: () => null,
}));

vi.mock("@onlyoffice/apps-ui-kit/components/tabs", () => ({
  Tabs: ({ items }: { items: { id: string }[] }) => {
    mocks.tabs = items;
    return null;
  },
}));

vi.mock("@/app/(docspace)/_store/InfoPanelStore", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  useInfoPanelStore: () => ({
    selection: mocks.selection,
    fileView: "info_details",
    setView: vi.fn(),
    close: vi.fn(),
  }),
}));

import { InfoPanelHeader } from "@/app/(docspace)/_components/info-panel";
import { PrivateInfoPanelHeader } from ".";

describe("PrivateInfoPanelHeader", () => {
  let root: Root | null = null;

  const tabsFor = (
    selection: Record<string, unknown>,
    Header: React.ComponentType = PrivateInfoPanelHeader,
  ) => {
    mocks.selection = selection;
    mocks.tabs = [];
    root = createRoot(document.createElement("div"));
    act(() => root?.render(<Header />));
    const ids = mocks.tabs.map((tab) => tab.id);
    act(() => root?.unmount());
    root = null;
    return ids;
  };

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("Encrypted file selected", () => {
    const file = {
      id: 7,
      title: "memo.docx",
      fileExst: ".docx",
      encrypted: true,
      canShare: true,
    };

    expect(tabsFor(file)).toEqual(["info_history", "info_details"]);
    expect(tabsFor(file, InfoPanelHeader)).toContain("info_share");
  });

  it("Private room selected", () => {
    const privateRoom = { id: 10, title: "Vault", isRoom: true, private: true };

    expect(tabsFor(privateRoom)).toEqual([
      "info_members",
      "info_history",
      "info_details",
    ]);
  });
});
