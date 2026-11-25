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

import build from "./build";

const os = {
  networkInterfaces: () => ({
    lo0: [
      { family: "IPv4", address: "127.0.0.1", internal: true },
      { family: "IPv6", address: "::1", internal: true },
    ],
    en0: [
      { family: "IPv6", address: "fe80::1", internal: false },
      { family: "IPv4", address: "192.168.3.6", internal: false },
    ],
  }),
};

describe("getAllLocalIps", () => {
  it("accepts localhost, its loopback address and the LAN addresses", () => {
    expect(build.getAllLocalIps(os)).toEqual([
      "localhost",
      "127.0.0.1",
      "*.dev.localhost",
      "192.168.3.6",
    ]);
  });
});
