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

const helperFor = (
  item: Record<string, unknown>,
  agentModelName?: string | null,
  agentDefaultModelName?: string | null,
) =>
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
    agentDefaultModelName,
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
  it("shows an agent of the Files list as an agent: no content, no storage, a model", () => {
    const properties = helperFor(agentRoom).getNeededProperties();
    expect(properties).not.toContain("Content");
    expect(properties).not.toContain("Storage");
    expect(properties).toContain("Model");
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

  it("names the portal's model for an agent without one of its own", () => {
    // Read by its tile: none of its own.
    expect(helperFor(agentRoom, null, "Portal GPT").getAgentModelName()).toBe("Portal GPT");
    // Its settings say it has none.
    expect(
      helperFor(
        { ...agentRoom, isAIProject: true, aiProject: { profile: null } },
        undefined,
        "Portal GPT",
      ).getAgentModelName(),
    ).toBe("Portal GPT");
    // Neither its own nor the portal's: the row shows a dash.
    expect(helperFor(agentRoom, null, null).getAgentModelName()).toBeUndefined();
  });

  it("waits for the agent's own model before falling back to the portal's", () => {
    // Not read yet.
    expect(helperFor(agentRoom, undefined, "Portal GPT").getAgentModelName()).toBeUndefined();
    // Settings without the block, or with the model unread, do not say it has none.
    expect(
      helperFor(
        { ...agentRoom, isAIProject: true, aiProject: { profile: null, partial: true } },
        "GPT",
        "Portal GPT",
      ).getAgentModelName(),
    ).toBe("GPT");
    expect(
      helperFor(
        { ...agentRoom, isAIProject: true, aiProject: { profile: null, modelUnread: true } },
        undefined,
        "Portal GPT",
      ).getAgentModelName(),
    ).toBeUndefined();
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

const skillFile = {
  id: 21,
  title: "Document summary.md",
  fileExst: ".md",
  folderId: 5,
  contentLength: "1 KB",
  version: 2,
  createdBy: { displayName: "Owner" },
};

const skillHelper = (props: Record<string, unknown>) =>
  new DetailsHelper({
    t: ((key: string) => key) as never,
    item: skillFile as unknown as TRoom,
    openUser: (() => undefined) as never,
    culture: "en",
    isVisitor: false,
    isCollaborator: false,
    isDefaultRoomsQuotaSet: true,
    isAdmin: true,
    isArchiveFolder: false,
    roomLifetime: null as never,
    ...props,
  });

describe("DetailsHelper of a skill", () => {
  it("shows a skill by its set and command, with no type, extension, size or versions", () => {
    const properties = skillHelper({
      isSkill: true,
      skillSetTitle: "Document assistant",
    }).getNeededProperties();
    expect(properties).toEqual([
      "Skill set",
      "Owner",
      "Command",
      "Date modified",
      "Last modified by",
      "Creation date",
    ]);
  });

  it("leaves out the set when the skill is not in the open one", () => {
    expect(
      skillHelper({ isSkill: true }).getNeededProperties(),
    ).not.toContain("Skill set");
  });

  it("shows the same Markdown file outside a skill set as a file", () => {
    const properties = skillHelper({}).getNeededProperties();
    expect(properties).not.toContain("Command");
    expect(properties).toContain("Size");
  });
});
