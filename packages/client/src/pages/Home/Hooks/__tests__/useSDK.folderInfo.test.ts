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

import { describe, it, expect, vi } from "vitest";

vi.mock("@docspace/ui-kit/utils/socket", () => ({
  default: {
    emit: vi.fn(),
    socketSubscribers: new Set<string>(),
  },
  SocketCommands: {
    Subscribe: "subscribe",
    Unsubscribe: "unsubscribe",
  },
}));

vi.mock("../../../../helpers/utils", () => ({
  setDocumentTitle: vi.fn(),
}));

import type { SettingsStore } from "@docspace/shared/store/SettingsStore";

import SelectedFolderStore from "../../../../store/SelectedFolderStore";
import { toFolderInfo } from "../useSDK";

const settings = {
  tenantAlias: "portal",
  trustedDomains: ["example.com"],
  recaptchaPublicKey: "public-key",
} as unknown as SettingsStore;

const createRoom = () => {
  const store = new SelectedFolderStore(settings);

  store.setSelectedFolder({
    id: 15,
    title: "Deal room",
    isRoom: true,
    roomType: 6,
    rootRoomId: 15,
    quotaLimit: 1024,
    external: true,
    passwordProtected: false,
    security: { Read: true },
  });

  return store;
};

describe("toFolderInfo", () => {
  it("keeps every field the serialized store returned in 2.1 except the settings store", () => {
    const store = createRoom();

    const legacy = JSON.parse(JSON.stringify(store));
    expect(legacy.settingsStore.tenantAlias).toBe("portal");
    delete legacy.settingsStore;

    expect(JSON.parse(JSON.stringify(toFolderInfo(store)))).toEqual(legacy);
  });

  it("keeps room fields the host relies on", () => {
    const info = toFolderInfo(createRoom());

    expect(info).toMatchObject({
      id: 15,
      title: "Deal room",
      isRoom: true,
      rootRoomId: 15,
      quotaLimit: 1024,
      external: true,
    });
  });

  it("drops the portal settings and the store methods", () => {
    const info = toFolderInfo(createRoom());
    const serialized = JSON.stringify(info);

    expect(info).not.toHaveProperty("settingsStore");
    expect(serialized).not.toContain("tenantAlias");
    expect(serialized).not.toContain("recaptchaPublicKey");
    expect(Object.values(info).some((v) => typeof v === "function")).toBe(false);
  });
});
