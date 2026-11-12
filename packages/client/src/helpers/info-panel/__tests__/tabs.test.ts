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

import { describe, expect, it } from "vitest";
import {
  FilesSecurity,
  RoomsType as PluginRoomsType,
  Security,
} from "@onlyoffice/docspace-plugin-sdk";
import { FolderType, RoomsType } from "@docspace/shared/enums";
import type { TFile } from "@docspace/shared/api/files/types";

import { getAvailableInfoPanelTabs } from "SRC_DIR/helpers/info-panel/tabs";
import type { IInfoPanelItemClient } from "SRC_DIR/helpers/plugins/types";
import {
  listItemOf,
  privateRoomDto,
} from "SRC_DIR/store/filesStore/__tests__/listItem.fixture";

import { InfoPanelView } from "../index";

describe("getAvailableInfoPanelTabs", () => {
  it("Private room selected in a list", () => {
    const { tabs, useRoomsView } = getAvailableInfoPanelTabs({
      selection: listItemOf(privateRoomDto()),
      isTrash: false,
      isRecentFolder: false,
      isPrivacyFolder: false,
      enablePlugins: false,
      infoPanelItemsList: [],
    });

    expect(tabs).not.toContain(InfoPanelView.infoShare);
    expect(tabs).toEqual([
      InfoPanelView.infoMembers,
      InfoPanelView.infoHistory,
      InfoPanelView.infoDetails,
    ]);
    expect(useRoomsView).toBe(true);
  });
});

const TAB = "info_plugin-qr";
const RIGHTS = [FilesSecurity.CopyLink, Security.EditAccess];

const file = (security: Record<string, boolean> = {}) =>
  ({ id: 1, isFile: true, fileExst: ".docx", security }) as unknown as TFile;

const room = (roomType: RoomsType) =>
  ({
    id: 7,
    isRoom: true,
    roomType,
    rootFolderType: FolderType.Rooms,
    security: {},
  }) as unknown as TFile;

const tabsFor = (
  selection: TFile,
  item: Partial<IInfoPanelItemClient>,
  { isPrivacyFolder = false } = {},
) =>
  getAvailableInfoPanelTabs({
    selection,
    isTrash: false,
    isRecentFolder: false,
    isPrivacyFolder,
    enablePlugins: true,
    infoPanelItemsList: [
      {
        key: "qr",
        value: { subMenu: { name: "QR" }, ...item } as IInfoPanelItemClient,
      },
    ],
  }).tabs;

describe("getAvailableInfoPanelTabs: plugin itemSecurity", () => {
  it("shows a tab that lists no rights", () => {
    expect(tabsFor(file({ CopyLink: false }), {})).toContain(TAB);
  });

  it("shows a tab when every listed right is granted", () => {
    expect(
      tabsFor(file({ CopyLink: true, EditAccess: true }), {
        itemSecurity: RIGHTS,
      }),
    ).toContain(TAB);
  });

  it("hides a tab when one listed right is missing", () => {
    expect(
      tabsFor(file({ CopyLink: true, EditAccess: false }), {
        itemSecurity: RIGHTS,
      }),
    ).not.toContain(TAB);
  });
});

describe("getAvailableInfoPanelTabs: plugin itemId", () => {
  it("shows a tab for a listed id, numeric or written as a string", () => {
    expect(tabsFor(file(), { itemId: [1] })).toContain(TAB);
    expect(tabsFor(file(), { itemId: ["1"] })).toContain(TAB);
  });

  it("hides a tab for an id that is not listed", () => {
    expect(tabsFor(file(), { itemId: [2] })).not.toContain(TAB);
  });
});

describe("getAvailableInfoPanelTabs: plugin roomType", () => {
  const roomType = [PluginRoomsType.PublicRoom];

  it("shows a tab for a room of a listed type", () => {
    expect(tabsFor(room(RoomsType.PublicRoom), { roomType })).toContain(TAB);
  });

  it("hides a tab for a room of another type", () => {
    expect(tabsFor(room(RoomsType.EditingRoom), { roomType })).not.toContain(
      TAB,
    );
  });

  it("does not check a file against it", () => {
    expect(tabsFor(file(), { roomType })).toContain(TAB);
  });
});

describe("getAvailableInfoPanelTabs: plugin tabs and private rooms", () => {
  const folder = () =>
    ({
      id: 30,
      isFolder: true,
      rootFolderType: FolderType.Rooms,
      security: {},
    }) as unknown as TFile;

  it("Info panel of a private room", () => {
    const privateRoom = listItemOf(privateRoomDto()) as unknown as TFile;

    expect(tabsFor(privateRoom, {})).not.toContain(TAB);
  });

  it("Info panel of a folder inside a private room", () => {
    expect(tabsFor(folder(), {}, { isPrivacyFolder: true })).not.toContain(
      TAB,
    );
  });

  it("Info panel of an encrypted file", () => {
    const encryptedFile = { ...file(), encrypted: true } as unknown as TFile;

    expect(tabsFor(encryptedFile, {})).not.toContain(TAB);
  });

  it.each([
    ["room", () => room(RoomsType.CustomRoom)],
    ["folder", folder],
    ["file", () => file()],
  ])("Info panel of an item outside private rooms (%s)", (_, item) => {
    expect(tabsFor(item(), {})).toContain(TAB);
  });
});
