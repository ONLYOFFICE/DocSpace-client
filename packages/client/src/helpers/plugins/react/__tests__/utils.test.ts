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


import { describe, it, expect } from "vitest";

import { RoomsType } from "@docspace/shared/enums";
import { RoomsType as PluginRoomsType } from "@onlyoffice/docspace-plugin-sdk";
import type { TFile, TFolder } from "@docspace/shared/api/files/types";
import type { TRoom } from "@docspace/shared/api/rooms/types";

import { toCurrentFile } from "SRC_DIR/helpers/plugins/react/utils";

const file = { id: 1, title: "Report.docx", fileExst: ".docx" } as TFile;
const folder = { id: 2, title: "Drafts", isFolder: true } as TFolder;
const room = {
  id: 3,
  title: "Team",
  isFolder: true,
  isRoom: true,
  roomType: RoomsType.CustomRoom,
} as unknown as TRoom;

describe("toCurrentFile", () => {
  it("describes a file", () => {
    expect(toCurrentFile(file)).toEqual({
      id: 1,
      title: "Report.docx",
      fileExst: ".docx",
      isFolder: false,
      isRoom: false,
      roomType: undefined,
    });
  });

  it("describes a folder", () => {
    expect(toCurrentFile(folder)).toMatchObject({
      isFolder: true,
      isRoom: false,
      roomType: undefined,
    });
  });

  it("does not report a room as a folder", () => {
    expect(toCurrentFile(room)).toMatchObject({
      isFolder: false,
      isRoom: true,
    });
  });

  it.each([
    [RoomsType.FormRoom, PluginRoomsType.FormRoom],
    [RoomsType.EditingRoom, PluginRoomsType.EditingRoom],
    [RoomsType.CustomRoom, PluginRoomsType.CustomRoom],
    [RoomsType.PublicRoom, PluginRoomsType.PublicRoom],
    [RoomsType.VirtualDataRoom, PluginRoomsType.VirtualDataRoom],
  ])("reports room type %s as the SDK value %s", (roomType, expected) => {
    expect(toCurrentFile({ ...room, roomType }).roomType).toBe(expected);
  });

  it("keeps the portal number for a room type the SDK has no value for", () => {
    expect(toCurrentFile({ ...room, roomType: RoomsType.AIRoom }).roomType).toBe(
      String(RoomsType.AIRoom),
    );
  });
});
