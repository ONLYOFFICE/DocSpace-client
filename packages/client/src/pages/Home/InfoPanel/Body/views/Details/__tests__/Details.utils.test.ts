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

vi.mock("SRC_DIR/i18n", () => ({
  default: { t: (key: string) => key, exists: () => true, language: "en" },
}));

import { RoomsType } from "@docspace/shared/enums";
import type { TRoom } from "@docspace/shared/api/rooms/types";

import DetailsHelper from "../Details.utils";

const helperFor = (item: Record<string, unknown>, agentModelName?: string | null) =>
  new DetailsHelper({
    t: ((key: string) => key) as never,
    item: item as unknown as TRoom,
    openUser: (() => undefined) as never,
    culture: "en",
    isVisitor: false,
    isCollaborator: false,
    isDefaultRoomsQuotaSet: true,
    isAdmin: true,
    isArchiveFolder: false,
    roomLifetime: null as never,
    agentModelName,
  });

const agentRoom = {
  id: 7,
  title: "Agent",
  isRoom: true,
  isFolder: true,
  roomType: RoomsType.AiProjectRoom,
  usedSpace: 0,
  tags: [],
  security: { EditRoom: true },
};

describe("DetailsHelper of an agent", () => {
  it("shows an agent of the Files list as an agent: no content, no storage", () => {
    const properties = helperFor(agentRoom).getNeededProperties();
    expect(properties).not.toContain("Content");
    expect(properties).not.toContain("Storage");
    expect(properties).not.toContain("Model");
  });

  it("names the model its tile read when the room carries no settings", () => {
    const helper = helperFor(agentRoom, "GPT");
    expect(helper.getNeededProperties()).toContain("Model");
    expect(helper.getAgentModelName()).toBe("GPT");
  });

  it("prefers the model of the agent's own settings", () => {
    const helper = helperFor(
      { ...agentRoom, isAIProject: true, aiProject: { profile: { name: "Claude" } } },
      "GPT",
    );
    expect(helper.getAgentModelName()).toBe("Claude");
  });

  it("still shows a custom room's content and storage", () => {
    const properties = helperFor({
      ...agentRoom,
      roomType: RoomsType.CustomRoom,
    }).getNeededProperties();
    expect(properties).toContain("Content");
    expect(properties).toContain("Storage");
    expect(properties).not.toContain("Model");
  });
});
