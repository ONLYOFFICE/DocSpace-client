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

vi.mock("next/headers", () => ({
  headers: async () => ({ get: () => null }),
}));

vi.mock("@/api/files", () => ({
  getFilesSettings: vi.fn(async () => ({})),
  getFolderPath: vi.fn(),
}));

vi.mock("../../../logger.mjs", () => ({ logger: { info: () => {} } }));

vi.mock("./page.client", () => ({ default: () => null }));
vi.mock("./page.oauth.client", () => ({ default: () => null }));
vi.mock("@/components/PrivateTargetNotAvailable", () => ({
  default: () => null,
}));

import { getFilesSettings, getFolderPath } from "@/api/files";
import PrivateTargetNotAvailable from "@/components/PrivateTargetNotAvailable";

import UploaderClient from "./page.client";
import Page from "./page";

const open = (sp: Record<string, string>) =>
  Page({ searchParams: Promise.resolve(sp) }) as Promise<{ type: unknown }>;

describe("uploader page", () => {
  beforeEach(() => {
    vi.mocked(getFolderPath).mockReset();
    vi.mocked(getFilesSettings).mockClear();
  });

  it("Uploader aimed at a private folder", async () => {
    vi.mocked(getFolderPath).mockResolvedValue([
      { id: 2, title: "Rooms" },
      { id: 7001, title: "Private", roomType: 5, private: true },
      { id: 7020, title: "Drafts" },
    ] as never);

    const element = await open({ targetId: "7020" });

    expect(element.type).toBe(PrivateTargetNotAvailable);
    expect(getFolderPath).toHaveBeenCalledWith("7020");
    expect(getFilesSettings).not.toHaveBeenCalled();
  });

  it("Folder outside private rooms", async () => {
    vi.mocked(getFolderPath).mockResolvedValue([
      { id: 2, title: "Rooms" },
      { id: 50, title: "Shared", roomType: 6, private: false },
    ] as never);

    const element = await open({ targetId: "50" });

    expect(element.type).toBe(UploaderClient);
  });

  it("an uploader without a target makes no path request", async () => {
    const element = await open({});

    expect(element.type).toBe(UploaderClient);
    expect(getFolderPath).not.toHaveBeenCalled();
  });
});
