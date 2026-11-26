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

import { describe, expect, it, vi } from "vitest";

import { ValidationStatus } from "@docspace/shared/enums";

import { publicPreviewLoader } from "../PublicPreview.helpers";

const validatePublicRoomKey = vi.hoisted(() => vi.fn());

vi.mock("@docspace/shared/api/rooms", () => ({ validatePublicRoomKey }));
vi.mock("@docspace/shared/api/files", () => ({
  getSettingsFiles: vi.fn(async () => ({})),
}));

const load = (address: string) =>
  publicPreviewLoader({
    request: new Request(`https://portal.example${address}`),
    params: {},
  } as never);

describe("publicPreviewLoader", () => {
  it("Link of a private item", async () => {
    validatePublicRoomKey.mockResolvedValue({
      status: ValidationStatus.Password,
      isPrivate: true,
    });

    const response = (await load("/share/preview/9?share=k")) as Response;

    expect(response.headers.get("Location")).toBe("/share/private?key=k");
  });

  it("leaves an ordinary link with a password to its own form", async () => {
    validatePublicRoomKey.mockResolvedValue({
      status: ValidationStatus.Password,
    });

    const data = (await load("/share/preview/9?share=k")) as { key: string };

    expect(data.key).toBe("k");
  });
});
