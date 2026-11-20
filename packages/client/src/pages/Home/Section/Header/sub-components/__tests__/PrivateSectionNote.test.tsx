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
import { describe, expect, it } from "vitest";

import { CategoryType } from "@docspace/shared/constants";

import { isPrivateRoomsSectionRoot } from "SRC_DIR/helpers/privateRoomsSection";

import PrivateSectionNote from "../PrivateSectionNote";

describe("PrivateSectionNote", () => {
  it("Private list: the line stands with the encryption mark", () => {
    render(<PrivateSectionNote isSectionRoot />);

    const note = screen.getByTestId("private_section_note");
    expect(note).toHaveTextContent("Common:PrivateRoomsSectionNote");
    expect(note.querySelector("svg, [aria-hidden='true']")).not.toBeNull();
  });

  it("Inside a room: no line", () => {
    render(<PrivateSectionNote isSectionRoot={false} />);

    expect(screen.queryByTestId("private_section_note")).toBeNull();
  });
});

describe("isPrivateRoomsSectionRoot", () => {
  const at = (pathname: string) => ({ pathname });

  it("Private list: the list and its Archive are the roots of the section", () => {
    expect(
      isPrivateRoomsSectionRoot(at("/private/filter"), true, false),
    ).toBe(true);
    expect(
      isPrivateRoomsSectionRoot(at("/private/archived/filter"), false, true),
    ).toBe(true);
  });

  it("Inside a room: a room or a folder is not a root", () => {
    expect(
      isPrivateRoomsSectionRoot(at("/private/15/filter"), false, false),
    ).toBe(false);
    // The list address names a room in its query while that room loads.
    expect(
      isPrivateRoomsSectionRoot(at("/private/filter"), false, false),
    ).toBe(false);
  });

  it("is not a root outside the section", () => {
    expect(
      isPrivateRoomsSectionRoot(at("/rooms/shared/filter"), true, false),
    ).toBe(false);
    expect(CategoryType.PrivateRooms).toBeDefined();
  });
});
