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

import { ShareAccessRights, ShareRights } from "../../enums";
import type { TTranslation } from "../../types";

import {
  getLinkAccessRightOptions,
  getRoomLinkAccessOptions,
} from "./Share.helpers";

const t: TTranslation = (key) => key;

describe("getLinkAccessRightOptions", () => {
  it("builds the options from the available rights of a non-primary link", () => {
    const { options, selectedOption } = getLinkAccessRightOptions(
      t,
      ShareAccessRights.ReadOnly,
      {
        ExternalLink: [ShareRights.Editing, ShareRights.Read],
        PrimaryExternalLink: [ShareRights.Comment],
      },
    );

    expect(options.map((option) => option.key)).toEqual(["editing", "viewing"]);
    expect(selectedOption?.access).toBe(ShareAccessRights.ReadOnly);
    expect(selectedOption?.disabled).toBeUndefined();
  });

  it("reads the primary list for a primary link", () => {
    const { options } = getLinkAccessRightOptions(
      t,
      ShareAccessRights.Comment,
      {
        ExternalLink: [ShareRights.Editing],
        PrimaryExternalLink: [ShareRights.Comment],
      },
      true,
    );

    expect(options.map((option) => option.key)).toEqual(["commenting"]);
  });

  it("appends the current access as a disabled option when it is no longer available", () => {
    const { options, selectedOption } = getLinkAccessRightOptions(
      t,
      ShareAccessRights.Editing,
      { ExternalLink: [ShareRights.Read] },
    );

    expect(options.map((option) => option.key)).toEqual(["viewing", "editing"]);
    expect(selectedOption?.access).toBe(ShareAccessRights.Editing);
    expect(selectedOption?.disabled).toBe(true);
  });

  it("keeps the current access even when no right is available at all", () => {
    const { options, selectedOption } = getLinkAccessRightOptions(
      t,
      ShareAccessRights.ReadOnly,
      {},
    );

    expect(options).toHaveLength(1);
    expect(selectedOption?.access).toBe(ShareAccessRights.ReadOnly);
    expect(selectedOption?.disabled).toBe(true);
  });

  it("leaves no selected option for an access links cannot carry", () => {
    const { options, selectedOption } = getLinkAccessRightOptions(
      t,
      ShareAccessRights.RoomManager,
      { ExternalLink: [ShareRights.Read] },
    );

    expect(options.map((option) => option.key)).toEqual(["viewing"]);
    expect(selectedOption).toBeUndefined();
  });
});

describe("getRoomLinkAccessOptions", () => {
  it("uses the room labels and drops rights without a room option", () => {
    const { options, selectedOption } = getRoomLinkAccessOptions(
      t,
      ShareAccessRights.Editing,
      { ExternalLink: [ShareRights.Editing, ShareRights.CustomFilter] },
    );

    expect(options.map((option) => option.key)).toEqual(["editing"]);
    expect(selectedOption?.label).toBe("Common:Editor");
  });

  it("appends the current access as a disabled option when it is no longer available", () => {
    const { options, selectedOption } = getRoomLinkAccessOptions(
      t,
      ShareAccessRights.ReadOnly,
      { ExternalLink: [ShareRights.Editing] },
    );

    expect(options.map((option) => option.key)).toEqual(["editing", "viewing"]);
    expect(selectedOption?.disabled).toBe(true);
  });
});
