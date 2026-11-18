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

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// PermanentSettings reaches the app's i18n instance through filesUtils.
vi.mock("SRC_DIR/i18n", () => ({ default: { t: (key: string) => key } }));

import { RoomsType, RoomsTypePrivate } from "@docspace/shared/enums";

import { getDisplayedRoomType } from "../displayedRoomType";
import PermanentSettings from "../PermanentSettings";

const t = ((key: string) => key) as never;

// Spec: private-rooms/room-membership, "Private badge in permanent settings"
describe("Room type block of a private room", () => {
  it("Edit dialog of a private room", () => {
    // The edit dialog holds the stored type, Custom, and the private setting.
    expect(
      getDisplayedRoomType({ type: RoomsType.CustomRoom, isPrivate: true }),
    ).toBe(RoomsTypePrivate);
  });

  it("Create dialog of a private room", () => {
    expect(
      getDisplayedRoomType({ type: RoomsTypePrivate, isPrivate: true }),
    ).toBe(RoomsTypePrivate);
  });

  it("Edit dialog of an ordinary Custom room", () => {
    expect(
      getDisplayedRoomType({ type: RoomsType.CustomRoom, isPrivate: false }),
    ).toBe(RoomsType.CustomRoom);
    expect(getDisplayedRoomType({ type: RoomsType.PublicRoom })).toBe(
      RoomsType.PublicRoom,
    );
  });

  it("shows no second private-room block among the permanent settings", () => {
    render(
      <PermanentSettings
        t={t}
        isThirdparty={false}
        storageLocation={{} as never}
      />,
    );

    expect(screen.queryByText("Common:PrivateRoomTitle")).toBeNull();
    expect(screen.queryByText("Common:PrivateRoomDescription")).toBeNull();
  });
});
