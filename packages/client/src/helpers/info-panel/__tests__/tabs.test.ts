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
import type { TFile, TFolder } from "@docspace/shared/api/files/types";

import {
  canManageAgentMembers,
  getAvailableInfoPanelTabs,
} from "SRC_DIR/helpers/info-panel/tabs";
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

  const agentTabs = (selection: object, aiChatProjectId: number | null = null) =>
    getAvailableInfoPanelTabs({
      selection: selection as never,
      isTrash: false,
      isRecentFolder: false,
      isPrivacyFolder: false,
      enablePlugins: true,
      infoPanelItemsList: [],
      aiChatProjectId,
    }).tabs;

  it("An agent has Details and Context only, plugins or not, for a user who may not change its members", () => {
    const expected = [InfoPanelView.infoDetails, InfoPanelView.infoContext];
    expect(agentTabs({ id: 7, isAIProject: true, rootFolderType: FolderType.AiHub })).toEqual(expected);
    // A selection of the list is known by its room type alone.
    expect(agentTabs({ id: 7, roomType: RoomsType.AiProjectRoom, rootFolderType: FolderType.AiHub })).toEqual(expected);
  });

  it("An agent whose page is open has Content too, and no other agent has", () => {
    const agent = { id: 7, roomType: RoomsType.AiProjectRoom, rootFolderType: FolderType.AiHub };
    expect(agentTabs(agent, 7)).toEqual([
      InfoPanelView.infoDetails,
      InfoPanelView.infoContext,
      InfoPanelView.infoContent,
    ]);
    expect(agentTabs(agent, 8)).not.toContain(InfoPanelView.infoContent);
  });

  // Spec: ai-agent-info-panel, "Members of an agent"
  describe("the members of an agent", () => {
    const agent = (security: object, inRoom?: boolean) => ({
      id: 7,
      roomType: RoomsType.AiProjectRoom,
      rootFolderType: FolderType.AiHub,
      security,
      ...(inRoom === undefined ? {} : { inRoom }),
    });

    it("are a last tab for the owner and an Agent manager, who may change them", () => {
      expect(agentTabs(agent({ EditAccess: true }, true))).toEqual([
        InfoPanelView.infoDetails,
        InfoPanelView.infoContext,
        InfoPanelView.infoMembers,
      ]);
      // On the agent's page they come after Content.
      expect(agentTabs(agent({ EditAccess: true }, true), 7)).toEqual([
        InfoPanelView.infoDetails,
        InfoPanelView.infoContext,
        InfoPanelView.infoContent,
        InfoPanelView.infoMembers,
      ]);
    });

    it("are not offered to a Member", () => {
      expect(agentTabs(agent({ EditAccess: false }, true))).not.toContain(InfoPanelView.infoMembers);
      expect(agentTabs(agent({}, true))).not.toContain(InfoPanelView.infoMembers);
    });

    it("are not offered to a DocSpace admin who is not a member", () => {
      expect(agentTabs(agent({ EditAccess: true }, false))).not.toContain(InfoPanelView.infoMembers);
      expect(canManageAgentMembers(agent({ EditAccess: true }, false))).toBe(false);
    });

    it("are offered for a selection that does not say whether the caller is in it", () => {
      expect(canManageAgentMembers(agent({ EditAccess: true }))).toBe(true);
    });
  });

  it("A template of the Templates tab has Details and Context, whatever else is selected", () => {
    const templateTabs = (selection: object | null) =>
      getAvailableInfoPanelTabs({
        selection: selection as never,
        isTrash: false,
        isRecentFolder: false,
        isPrivacyFolder: false,
        enablePlugins: true,
        infoPanelItemsList: [],
        isAiTemplate: true,
      });
    const expected = {
      tabs: [InfoPanelView.infoDetails, InfoPanelView.infoContext],
      useRoomsView: true,
    };
    // The list's own folder is the selection on the Templates tab.
    expect(templateTabs({ id: 1, isFolder: true, rootFolderType: FolderType.AiHub })).toEqual(expected);
    expect(templateTabs(null)).toEqual(expected);
  });

  it("Encrypted file selected", () => {
    const selection = {
      id: 1,
      isFile: true,
      fileExst: ".docx",
      encrypted: true,
      canShare: true,
      rootFolderType: FolderType.Rooms,
      security: {},
    } as unknown as TFile;

    const { tabs } = getAvailableInfoPanelTabs({
      selection,
      isTrash: false,
      isRecentFolder: false,
      isPrivacyFolder: false,
      enablePlugins: false,
      infoPanelItemsList: [],
    });

    expect(tabs).not.toContain(InfoPanelView.infoShare);
    expect(
      getAvailableInfoPanelTabs({
        selection: { ...selection, encrypted: false } as TFile,
        isTrash: false,
        isRecentFolder: false,
        isPrivacyFolder: false,
        enablePlugins: false,
        infoPanelItemsList: [],
      }).tabs,
    ).toContain(InfoPanelView.infoShare);
  });

  it("Member who manages links", () => {
    const tabsOf = (selection: TFile | TFolder, isPrivacyFolder: boolean) =>
      getAvailableInfoPanelTabs({
        selection,
        isTrash: false,
        isRecentFolder: false,
        isPrivacyFolder,
        canManagePrivateLinks: true,
        enablePlugins: false,
        infoPanelItemsList: [],
      }).tabs;

    // As the server answers them: no right to share with the entry itself.
    const file = {
      id: 1,
      isFile: true,
      fileExst: ".docx",
      encrypted: true,
      canShare: false,
      rootFolderType: FolderType.Rooms,
      security: {},
    } as unknown as TFile;
    const folder = {
      id: 2,
      isFolder: true,
      canShare: false,
      rootFolderType: FolderType.Rooms,
      security: {},
    } as unknown as TFolder;

    expect(tabsOf(file, true)).toContain(InfoPanelView.infoShare);
    expect(tabsOf(folder, true)).toContain(InfoPanelView.infoShare);
    // Outside a private room the right of that room opens nothing.
    expect(tabsOf(folder, false)).not.toContain(InfoPanelView.infoShare);
  });

  it("Folder inside a private room selected", () => {
    const folderTabs = (isPrivacyFolder: boolean) =>
      getAvailableInfoPanelTabs({
        selection: {
          id: 2,
          isFolder: true,
          canShare: true,
          rootFolderType: FolderType.Rooms,
          security: {},
        } as unknown as TFolder,
        isTrash: false,
        isRecentFolder: false,
        isPrivacyFolder,
        enablePlugins: false,
        infoPanelItemsList: [],
      }).tabs;

    expect(folderTabs(true)).not.toContain(InfoPanelView.infoShare);
    expect(folderTabs(false)).toContain(InfoPanelView.infoShare);
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
