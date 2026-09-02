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

import { describe, it, expect, vi, beforeEach } from "vitest";
import { runInAction } from "mobx";

vi.mock("@docspace/ui-kit/utils/socket", () => ({
  default: { emit: vi.fn(), on: vi.fn() },
  SocketCommands: { Subscribe: "subscribe" },
  SocketEvents: { ChangeWebPlugin: "change-web-plugin" },
}));

vi.mock("@docspace/ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() },
}));

vi.mock("@docspace/shared/api", () => ({
  default: { plugins: { updatePlugin: vi.fn() } },
}));

import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { UserStore } from "@docspace/shared/store/UserStore";
import type { CurrentTariffStatusStore } from "@docspace/shared/store/CurrentTariffStatusStore";

import PluginStore from "../PluginStore";
import type SelectedFolderStore from "../SelectedFolderStore";
import type { TPlugin } from "../../helpers/plugins/types";
import { PluginUserRole, PluginUsersType } from "../../helpers/plugins/enums";

const PLUGIN = "Sample";

/** A store whose signed-in user is described by the given predicates. */
const storeFor = (user: Record<string, boolean> | null) =>
  new PluginStore(
    { culture: "en" } as unknown as SettingsStore,
    {} as unknown as SelectedFolderStore,
    { user } as unknown as UserStore,
    {} as unknown as CurrentTariffStatusStore,
  );

beforeEach(() => {
  vi.clearAllMocks();
});

// The portal computes one role per signed-in user and hands it to every item
// filter, so this mapping decides which items a person sees at all.
describe("PluginStore.getUserRole", () => {
  it.each([
    ["owner", { isOwner: true }, PluginUserRole.owner],
    ["full admin", { isAdmin: true }, PluginUserRole.fullAdmin],
    ["user", { isCollaborator: true }, PluginUserRole.user],
    ["guest", { isVisitor: true }, PluginUserRole.guest],
    ["room admin", {}, PluginUserRole.roomAdmin],
  ])("maps a %s to the matching role", (_label, predicates, expected) => {
    expect(storeFor(predicates).getUserRole()).toBe(expected);
  });

  it("treats a missing profile as a guest", () => {
    expect(storeFor(null).getUserRole()).toBe(PluginUserRole.guest);
  });
});

// `matchesUserRole` is unit-tested in helpers/plugins/__tests__/utils.test.ts;
// this covers the wiring — that an item filter actually consults it, so a
// plugin built against the older `UsersType` still reaches the right people.
describe("PluginStore item filtering by role", () => {
  const fileItemFor = (
    user: Record<string, boolean>,
    usersType: (PluginUserRole | PluginUsersType)[],
  ) => {
    const store = storeFor(user);

    runInAction(() => {
      store.plugins = [
        {
          name: PLUGIN,
          enabled: true,
          version: "1.0.0",
          iconUrl: "https://portal.test/plugins/sample",
          getFileItems: () =>
            new Map([[".md", { extension: ".md", usersType }]]),
        } as unknown as TPlugin,
      ];
    });

    store.updateFileItems(PLUGIN);

    return store.fileItems.get(".md");
  };

  it("keeps an item listing the deprecated docSpaceAdmin for a full admin", () => {
    expect(
      fileItemFor({ isAdmin: true }, [PluginUsersType.docSpaceAdmin]),
    ).toBeDefined();
  });

  it("keeps an item listing the current fullAdmin for a full admin", () => {
    expect(fileItemFor({ isAdmin: true }, [PluginUserRole.fullAdmin])).toBeDefined();
  });

  it("drops an admin-only item for a room admin", () => {
    expect(fileItemFor({}, [PluginUserRole.fullAdmin])).toBeUndefined();
  });
});
