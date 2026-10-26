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

import type { ReactNode } from "react";
import { beforeEach, describe, expect, test, vi, type Mock } from "vitest";

const request = vi.hoisted(() => ({ filter: "" }));

vi.mock("next/headers", () => ({
  headers: async () =>
    new Headers({
      "x-sdk-config-filter": request.filter,
      "x-pathname": "/private",
    }),
}));

vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/api/people", () => ({ getSelf: vi.fn() }));
vi.mock("./_components/not-available", () => ({ default: () => null }));
vi.mock("./_components/opt-in/PrivateRoomsOptInSource", () => ({
  default: ({ children }: { children: ReactNode }) => children,
}));

import { getSelf } from "@/api/people";

import PrivateRoomsNotAvailable from "./_components/not-available";
import PrivateRoomsOptInSource from "./_components/opt-in/PrivateRoomsOptInSource";
import PrivateLayout from "./layout";

describe("private layout opt-in gate", () => {
  beforeEach(() => {
    (getSelf as Mock).mockResolvedValue({ id: "user-1" });
  });

  test("SDK route without the flag", async () => {
    request.filter = "theme=Dark";

    const element = await PrivateLayout({ children: "page" });

    expect(element.type).toBe(PrivateRoomsNotAvailable);
    expect(getSelf).not.toHaveBeenCalled();
  });

  test("Host passes the opt-in", async () => {
    request.filter = "privateRooms=true&theme=Dark";

    const element = await PrivateLayout({ children: "page" });

    expect(element.type).toBe(PrivateRoomsOptInSource);
    expect(element.props.children).toBe("page");
  });
});
