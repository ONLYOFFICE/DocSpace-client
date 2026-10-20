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

import { afterEach, describe, expect, it, vi } from "vitest";

import type { TUser } from "../api/people/types";
import { regDesktop } from "./desktop";

const user = {
  id: "u1",
  displayName: "Desktop User",
  email: "user@example.com",
} as unknown as TUser;

// Only the members the test touches; the global Window type declares more.
type TDesktopWindow = {
  AscDesktopEditor?: { execCommand: (key: string, value: string) => void };
  cloudCryptoCommand?: unknown;
};

describe("regDesktop", () => {
  afterEach(() => {
    const w = window as unknown as TDesktopWindow;
    delete w.AscDesktopEditor;
    delete w.cloudCryptoCommand;
  });

  it("Desktop login: the login data carries no encryption keys and no key command handler is registered", async () => {
    const execCommand = vi.fn();
    (window as unknown as TDesktopWindow).AscDesktopEditor = { execCommand };

    await regDesktop(user);

    expect(execCommand).toHaveBeenCalledTimes(1);
    const [command, payload] = execCommand.mock.calls[0];
    expect(command).toBe("portal:login");
    const data = JSON.parse(payload);
    expect(data).toMatchObject({ userId: "u1", email: "user@example.com" });
    expect(data).not.toHaveProperty("encryptionKeys");
    expect((window as unknown as TDesktopWindow).cloudCryptoCommand).toBeUndefined();
  });
});
