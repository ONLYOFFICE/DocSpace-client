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

import { layoutRoomOptions } from "../helpers";

const option = (key: string) => ({ key, label: key });
const separator = (key: string) => ({ key, isSeparator: true });

describe("layoutRoomOptions", () => {
  it("ends the main block with More options, then custom actions, then the exit group", () => {
    const keys = layoutRoomOptions(
      [
        option("select"),
        separator("separator0"),
        option("link-for-room-members"),
        option("more-options"),
        option("create-group"),
        separator("separator1"),
        option("edit-index"),
        option("leave-room"),
        option("archive-room"),
        option("delete"),
      ],
      [option("custom-action")],
    ).map(({ key }) => key);

    expect(keys).toEqual([
      "select",
      "separator0",
      "link-for-room-members",
      "create-group",
      "separator1",
      "edit-index",
      "more-options",
      "separator-custom-actions",
      "custom-action",
      "separator-after-custom-actions",
      "leave-room",
      "archive-room",
      "delete",
    ]);
  });

  it("treats Remove from list and Restore as part of the exit group", () => {
    const keys = layoutRoomOptions(
      [
        option("room-info"),
        option("remove-shared-room"),
        option("download"),
        option("unarchive-room"),
        option("delete"),
        option("more-options"),
      ],
      [],
    ).map(({ key }) => key);

    expect(keys).toEqual([
      "room-info",
      "download",
      "more-options",
      "separator-custom-actions",
      "separator-after-custom-actions",
      "remove-shared-room",
      "unarchive-room",
      "delete",
    ]);
  });

  it("attaches More options to the last visible row of the main block", () => {
    const keys = layoutRoomOptions(
      [
        option("link-for-room-members"),
        separator("separator1"),
        { key: "room-info", disabled: true },
        option("leave-room"),
        option("more-options"),
      ],
      [],
    ).map(({ key }) => key);

    expect(keys).toEqual([
      "link-for-room-members",
      "more-options",
      "separator-custom-actions",
      "separator-after-custom-actions",
      "leave-room",
    ]);
  });
});
