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

import { beforeEach, describe, expect, it, vi } from "vitest";

import { FolderType } from "@docspace/shared/enums";

import { isOAuthFrame } from "@docspace/shared/utils/oauthToken";

import {
  getDefaultStartPageUrl,
  getEffectiveDefaultFolderType,
} from "../defaultStartPage";

vi.mock("@docspace/shared/utils/oauthToken", () => ({
  isOAuthFrame: vi.fn(() => false),
}));

const mockedIsOAuthFrame = vi.mocked(isOAuthFrame);

beforeEach(() => {
  mockedIsOAuthFrame.mockReturnValue(false);
});

// FolderType.DEFAULT is 0, so every fallback has to be written with ?? rather
// than ||: Home is a real choice, not an absent one.
describe("getEffectiveDefaultFolderType", () => {
  it("falls back to Home when the portal has no stored value", () => {
    expect(getEffectiveDefaultFolderType(undefined)).toBe(FolderType.DEFAULT);
  });

  it("keeps Home when it is the stored value", () => {
    expect(getEffectiveDefaultFolderType(FolderType.DEFAULT)).toBe(
      FolderType.DEFAULT,
    );
  });

  it("keeps a section that is still available", () => {
    expect(
      getEffectiveDefaultFolderType(FolderType.AIAgents, {
        aiServicesEnabled: true,
      }),
    ).toBe(FolderType.AIAgents);
  });

  it("falls back to Home when AI services are off", () => {
    expect(
      getEffectiveDefaultFolderType(FolderType.AIAgents, {
        aiServicesEnabled: false,
      }),
    ).toBe(FolderType.DEFAULT);
  });

  it("falls back to Home for a guest whose value is the Files section", () => {
    expect(
      getEffectiveDefaultFolderType(FolderType.USER, { isGuest: true }),
    ).toBe(FolderType.DEFAULT);
  });
});

describe("getDefaultStartPageUrl", () => {
  it("opens the Overview when the value is Home", () => {
    expect(getDefaultStartPageUrl(FolderType.DEFAULT)).toBe("/dashboard");
  });

  it("opens the chosen section", () => {
    expect(getDefaultStartPageUrl(FolderType.Rooms)).toBe(
      "/rooms/shared/filter",
    );
  });

  // The setting hides AI Agents once the portal switch is off; entry routing
  // has to agree, because /ai-agents/* sits behind requireAIServices and would
  // answer 404.
  it("does not route to AI Agents once AI services are off", () => {
    expect(
      getDefaultStartPageUrl(FolderType.AIAgents, {
        aiServicesEnabled: false,
      }),
    ).toBe("/dashboard");
  });

  it("does not route a guest to the Files section", () => {
    expect(getDefaultStartPageUrl(FolderType.USER, { isGuest: true })).toBe(
      "/dashboard",
    );
  });

  it("opens Rooms instead of the Overview inside an OAuth frame", () => {
    mockedIsOAuthFrame.mockReturnValue(true);

    expect(getDefaultStartPageUrl(undefined)).toBe("/rooms/shared/filter");
  });

  it("honours an explicit section inside an OAuth frame", () => {
    mockedIsOAuthFrame.mockReturnValue(true);

    expect(getDefaultStartPageUrl(FolderType.Forms)).toBe("/forms/filter");
  });
});
