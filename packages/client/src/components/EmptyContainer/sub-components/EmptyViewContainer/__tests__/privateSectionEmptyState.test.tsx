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

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  FolderType,
  RoomsType,
  ShareAccessRights,
} from "@docspace/shared/enums";

vi.mock("SRC_DIR/i18n", () => ({ default: { t: (key: string) => key } }));

import {
  getDescription,
  getIcon,
  getOptions,
  getTitle,
} from "../EmptyViewContainer.helpers";
import type { OptionActions } from "../EmptyViewContainer.types";

const t = ((key: string) => key) as never;
const CAN_CREATE = ShareAccessRights.None;
const CANNOT_CREATE = ShareAccessRights.ReadOnly;

const actions = new Proxy({}, { get: () => vi.fn() }) as OptionActions;

const sectionOptions = (access: ShareAccessRights, isPrivateScope: boolean) =>
  getOptions(
    RoomsType.CustomRoom,
    null,
    t,
    access as never,
    false,
    null,
    null,
    false,
    true,
    FolderType.Rooms,
    actions,
    "",
    false,
    false,
    "personal",
    false,
    false,
    true,
    true,
    isPrivateScope,
  );

const sectionDescription = (
  access: ShareAccessRights,
  isPrivateScope: boolean,
) =>
  getDescription(
    RoomsType.CustomRoom,
    t,
    access as never,
    false,
    null,
    null,
    false,
    true,
    FolderType.Rooms,
    false,
    null,
    false,
    null,
    isPrivateScope,
  );

const sectionIcon = (isPrivateScope: boolean) =>
  render(
    getIcon(
      RoomsType.CustomRoom,
      true,
      CAN_CREATE as never,
      false,
      null,
      null,
      true,
      FolderType.Rooms,
      false,
      isPrivateScope,
    ),
  ).container.innerHTML;

const optionsOf = (list: ReturnType<typeof getOptions>) =>
  (Array.isArray(list) ? list : []) as { title?: string; key?: string }[];

// Spec: private-rooms/sidebar-section, "Section empty state"
describe("Empty state of the Private section", () => {
  it("Room admin without private rooms", () => {
    expect(
      getTitle(
        RoomsType.CustomRoom,
        t,
        CAN_CREATE as never,
        false,
        null,
        null,
        false,
        true,
        FolderType.Rooms,
        false,
        false,
        true,
      ),
    ).toBe("EmptyView:EmptyRootPrivateRoomsTitle");
    expect(sectionDescription(CAN_CREATE, true)).toBe(
      "Common:PrivateRoomsListEmptyDescription",
    );

    const options = optionsOf(sectionOptions(CAN_CREATE, true));
    expect(options.map((option) => option.title)).toEqual([
      "Common:CreatePrivateRoom",
    ]);
  });

  it("User without private rooms", () => {
    expect(sectionDescription(CANNOT_CREATE, true)).toBe(
      "EmptyView:EmptyRootPrivateRoomsUserDescription",
    );
    expect(optionsOf(sectionOptions(CANNOT_CREATE, true))).toEqual([]);
  });

  it("Illustration of the section", () => {
    const privateIcon = sectionIcon(true);
    const roomsIcon = sectionIcon(false);

    expect(privateIcon).not.toBe("");
    expect(privateIcon).not.toBe(roomsIcon);
  });

  it("Rooms section unchanged", () => {
    expect(sectionDescription(CAN_CREATE, false)).not.toBe(
      "Common:PrivateRoomsListEmptyDescription",
    );

    const titles = optionsOf(sectionOptions(CAN_CREATE, false)).map(
      (option) => option.title,
    );
    expect(titles).toContain("EmptyView:CreateRoomTitleOption");
    expect(titles).not.toContain("Common:CreatePrivateRoom");
  });
});
