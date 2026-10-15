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
import type { TFunction } from "i18next";

import { bullets } from "SRC_DIR/components/Tour/__tests__/bullets";

import { getTourSteps, type TourStepFlags } from "../tourSteps";

/** Echo the key back, so a step can be identified by the key it rendered. */
const t = ((key: string) => key) as unknown as TFunction;

const steps = (flags: TourStepFlags) => getTourSteps(t, undefined, flags);

const titles = (flags: TourStepFlags) => steps(flags).map((step) => step.title);

const EMPTY_SCREEN_TARGET = '[data-testid="empty-view-body"] > *:first-child';
const EMPTY_SCREEN = '[data-testid="empty-view"]';

const hooks = () => ({ reveal: vi.fn(), restore: vi.fn() });

/** An admin on an agents section that already has agents of its own. */
const adminFlags: TourStepFlags = {
  audience: "admin",
  isDesktop: true,
  canCreate: true,
  showFilter: true,
  hasItems: true,
  aiAgentsId: "224866",
  hasRecent: true,
  hasFavorites: true,
  hasTrash: true,
  infoPanelHooks: hooks(),
  isStandIn: false,
  emptyScreenAction: "create",
  demoHooks: hooks(),
  agentHooks: { chat: hooks(), knowledge: hooks(), outputs: hooks() },
  leaveAgent: vi.fn(),
};

/** The same admin on a portal whose agents list is stood in for. */
const demoFlags: TourStepFlags = { ...adminFlags, isStandIn: true };

/** Somebody who was let into agents that are not theirs. */
const userFlags: TourStepFlags = {
  ...adminFlags,
  audience: "user",
  canCreate: false,
  emptyScreenAction: null,
};

/**
 * The same person on a portal with no agents at all, whose list is stood in
 * for. The empty screen offers them nothing — creating an agent is not theirs
 * to do — so the closing step has somewhere else to point.
 */
const userDemoFlags: TourStepFlags = { ...userFlags, isStandIn: true };

describe("getTourSteps — admin", () => {
  it("walks what an agent is, building one, using one, and finding it again", () => {
    expect(titles(adminFlags)).toEqual([
      "AiAgentsTour:AgentWhatIsTitle",
      "AiAgentsTour:AgentBuildTitle",
      "AiAgentsTour:AgentRowTitle",
      "AiAgentsTour:AgentChatTitle",
      "AiAgentsTour:AgentKnowledgeBaseTitle",
      "AiAgentsTour:AgentOutputsTitle",
      "RoomsTour:RoomsMembersTitle",
      "AiAgentsTour:AgentFindTitle",
      "AiAgentsTour:AgentPlacesTitle",
      "RoomsTour:RoomsCreateFirstTitle",
    ]);
  });

  it("closes a run on the section's own agents on the New agent button", () => {
    const closing = steps(adminFlags).at(-1)!;

    expect(closing.title).toBe("RoomsTour:RoomsCreateFirstTitle");
    expect(closing.target).toBe(
      '#filter_search-input > div:has(> [data-testid="main-button"])',
    );

    expect(titles({ ...adminFlags, isDesktop: false })).not.toContain(
      "RoomsTour:RoomsCreateFirstTitle",
    );
    expect(titles({ ...adminFlags, canCreate: false })).not.toContain(
      "RoomsTour:RoomsCreateFirstTitle",
    );
    expect(titles(userFlags)).not.toContain("RoomsTour:RoomsCreateFirstTitle");
  });

  it("stays inside the ten-step budget on the longest run there is", () => {
    // The stand-in run: the sample notice and the two file tabs, no chat.
    expect(titles(demoFlags)).toEqual([
      "AiAgentsTour:AgentWhatIsTitle",
      "AiAgentsTour:AgentBuildTitle",
      "AiAgentsTour:AgentDemoPreviewTitle",
      "AiAgentsTour:AgentRowTitle",
      "AiAgentsTour:AgentKnowledgeBaseTitle",
      "AiAgentsTour:AgentOutputsTitle",
      "RoomsTour:RoomsMembersTitle",
      "AiAgentsTour:AgentFindTitle",
      "AiAgentsTour:AgentPlacesTitle",
      "RoomsTour:RoomsCreateFirstTitle",
    ]);
    expect(steps(demoFlags).length).toBeLessThanOrEqual(10);
  });

  it("says the list is a sample right before pointing at a row of it", () => {
    const demoTitles = titles(demoFlags);
    const preview = demoTitles.indexOf("AiAgentsTour:AgentDemoPreviewTitle");

    expect(demoTitles[preview + 1]).toBe("AiAgentsTour:AgentRowTitle");
    // Not said on a list of the user's own.
    expect(titles(adminFlags)).not.toContain(
      "AiAgentsTour:AgentDemoPreviewTitle",
    );
  });

  it("names the list as a sample over all three stand-in rows", () => {
    const sample = steps(demoFlags).find(
      (step) => step.title === "AiAgentsTour:AgentDemoPreviewTitle",
    )!;

    // One spotlight over the three rows, and the tooltip anchored on it.
    expect(sample.spotlightTarget).toBeTypeOf("function");
    expect(sample.target).toBe(sample.spotlightTarget);
  });

  it("walks into the agent's tabs: three of the user's own, two of a stand-in", () => {
    const chat = steps(adminFlags).find(
      (step) => step.title === "AiAgentsTour:AgentChatTitle",
    )!;
    const knowledge = steps(demoFlags).find(
      (step) => step.title === "AiAgentsTour:AgentKnowledgeBaseTitle",
    )!;
    const outputs = steps(demoFlags).find(
      (step) => step.title === "AiAgentsTour:AgentOutputsTitle",
    )!;

    document.body.innerHTML =
      '<div><button data-testid="send-button"></button></div>' +
      '<div data-chat-active=""><button data-testid="send-button"></button></div>' +
      '<div id="file_-1120"></div><div id="file_-1130"></div>';
    // The active chat's button, not the hidden copy another tab keeps mounted.
    expect((chat.target as () => Element | null)()).toBe(
      document.querySelector('[data-chat-active] [data-testid="send-button"]'),
    );
    // Each file tab anchors on its own first file, so a tab switch is waited
    // out rather than measured against the row the other tab left behind.
    expect((knowledge.target as () => Element | null)()).toBe(
      document.querySelector("#file_-1120"),
    );
    expect((outputs.target as () => Element | null)()).toBe(
      document.querySelector("#file_-1130"),
    );
    // The tab is lit up together with the list under it.
    expect(knowledge.spotlightTarget).toBeTypeOf("function");
    document.body.innerHTML = "";

    // The user's own agent: the tabs anchor on the tab itself, no file ids.
    document.body.innerHTML = '<div data-testid="knowledge_tab"></div>';
    const ownKnowledge = steps(adminFlags).find(
      (step) => step.title === "AiAgentsTour:AgentKnowledgeBaseTitle",
    )!;
    expect((ownKnowledge.target as () => Element | null)()).toBe(
      document.querySelector('[data-testid="knowledge_tab"]'),
    );
    document.body.innerHTML = "";

    // A stand-in has no chat to open.
    expect(titles(demoFlags)).not.toContain("AiAgentsTour:AgentChatTitle");
    expect(titles({ ...demoFlags, agentHooks: undefined })).not.toContain(
      "AiAgentsTour:AgentOutputsTitle",
    );
  });

  it("names every sidebar shortcut it points at, one bullet each", () => {
    const places = steps(adminFlags).at(-2);

    expect(bullets(places)).toEqual([
      "FilesTour:TourPlacesRecent",
      "FilesTour:TourPlacesFavorites",
      "FilesTour:TourPlacesTrash",
    ]);
    // The spotlight covers the sub-list the anchor item belongs to.
    expect(places?.spotlightTarget).toBeTypeOf("function");
  });
});

describe("getTourSteps — user", () => {
  it("offers nothing that creates an agent", () => {
    const userTitles = titles(userFlags);

    expect(userTitles).not.toContain("AiAgentsTour:AgentBuildTitle");
    expect(userTitles).not.toContain("RoomsTour:RoomsCreateFirstTitle");
  });

  it("still covers what to do with the agents they were let into", () => {
    expect(titles(userFlags)).toEqual([
      "AiAgentsTour:AgentWhatIsTitle",
      "AiAgentsTour:AgentRowTitle",
      "AiAgentsTour:AgentChatTitle",
      "AiAgentsTour:AgentKnowledgeBaseTitle",
      "AiAgentsTour:AgentOutputsTitle",
      "AiAgentsTour:AgentAccessMemberTitle",
      "AiAgentsTour:AgentFindTitle",
      "AiAgentsTour:AgentPlacesTitle",
    ]);
  });

  it("describes an agent from the using end rather than the owning one", () => {
    const [intro] = steps(userFlags);

    expect(intro.content).toBe("AiAgentsTour:AgentWhatIsShared");

    // The row step too: their context menu holds none of the admin entries.
    expect(
      steps(userFlags).find(
        (step) => step.title === "AiAgentsTour:AgentRowTitle",
      )?.content,
    ).toBe("AiAgentsTour:AgentRowMember");
  });
});

describe("getTourSteps — the info panel step", () => {
  it("opens the panel itself rather than pointing at the button that would", () => {
    const access = steps(adminFlags).find(
      (step) => step.title === "RoomsTour:RoomsMembersTitle",
    )!;

    // The panel is only up while the step runs, so the start-of-run DOM check
    // has to look at the row instead — an agents list with no row in it has
    // nothing for this step to describe.
    expect(access.data).toEqual({
      revealsTarget: true,
      presence:
        '[data-testid="table-row-0"], [data-testid="files_row_0"], [data-testid="tile_0"]',
    });
    expect(access.before).toBeTypeOf("function");
  });

  it("waits for the first member, and lights up the tab with the list", () => {
    // The list is on the page before its members arrive from the server, so
    // the step anchors on the first row rather than on the empty list.
    document.body.innerHTML =
      '<div class="info-panel">' +
      '<div data-testid="info_members_tab"></div>' +
      '<div data-testid="info_panel_members_list">' +
      '<div data-testid="info_panel_members_list_item_0"></div></div>' +
      "</div>";
    const row = document.querySelector(
      '[data-testid="info_panel_members_list_item_0"]',
    );

    const access = steps(adminFlags).find(
      (step) => step.title === "RoomsTour:RoomsMembersTitle",
    )!;

    expect((access.target as () => Element | null)()).toBe(row);
    expect(access.spotlightTarget).toBeTypeOf("function");

    document.body.innerHTML = "";
  });

  it("is dropped when there is no agent to open it on", () => {
    expect(titles({ ...adminFlags, hasItems: false })).not.toContain(
      "RoomsTour:RoomsMembersTitle",
    );
  });
});

describe("getTourSteps — what the page allows", () => {
  it("drops the filter-bar steps on an empty page", () => {
    // No filter bar and no banner: nothing to create with, nothing to search.
    expect(
      titles({ ...adminFlags, showFilter: false, hasItems: false }),
    ).toEqual([
      "AiAgentsTour:AgentWhatIsTitle",
      "AiAgentsTour:AgentPlacesTitle",
    ]);
  });

  it("drops the sidebar step on a narrow screen", () => {
    // Tablet collapses the sidebar to icons, flattening the sub-items away.
    expect(titles({ ...adminFlags, isDesktop: false })).not.toContain(
      "AiAgentsTour:AgentPlacesTitle",
    );
  });

  it("names only the shortcuts the sidebar actually built", () => {
    const withoutTrash = steps({
      ...adminFlags,
      hasTrash: false,
    }).at(-2);

    expect(bullets(withoutTrash)).toEqual([
      "FilesTour:TourPlacesRecent",
      "FilesTour:TourPlacesFavorites",
    ]);

    // With none of the three aliases there is no sub-list to anchor on at all.
    expect(
      titles({
        ...adminFlags,
        hasRecent: false,
        hasFavorites: false,
        hasTrash: false,
      }),
    ).not.toContain("AiAgentsTour:AgentPlacesTitle");
  });

  it("closes on the real create button only when the list was stood in for", () => {
    document.body.innerHTML = `
      <div data-testid="empty-view-body"><button>create</button></div>
    `;
    const createButton = document.querySelector(EMPTY_SCREEN_TARGET);

    const closing = steps(demoFlags).at(-1)!;
    expect(closing.title).toBe("RoomsTour:RoomsCreateFirstTitle");
    expect((closing.target as () => Element | null)()).toBe(createButton);

    // A section that kept its own list ends on the sidebar step instead.
    expect(steps(adminFlags).at(-1)?.target).not.toBe(closing.target);

    document.body.innerHTML = "";
  });

  it("keeps the create button away from an admin the empty screen offers none", () => {
    // The banner lets a room admin create an agent, but the empty screen only
    // offers a button to a portal admin — so the step that sends them at it has
    // a gate of its own, and there is nothing else to send an admin at.
    expect(titles({ ...demoFlags, emptyScreenAction: null })).toHaveLength(9);
    expect(titles({ ...demoFlags, emptyScreenAction: null }).at(-1)).toBe(
      "AiAgentsTour:AgentPlacesTitle",
    );
  });

  it("closes a stood-in run on the empty list itself for someone who cannot create", () => {
    // Their section was stood in for too — otherwise their tour is the sidebar
    // step and nothing else — so it still has to be handed back in the open.
    // What they are left looking at is a bare empty screen, so that is what the
    // step names rather than a button they do not have.
    document.body.innerHTML = `<div data-testid="empty-view"></div>`;
    const emptyScreen = document.querySelector(EMPTY_SCREEN);

    const closing = steps(userDemoFlags).at(-1)!;

    expect(closing.title).toBe("AiAgentsTour:AgentEmptyTitle");
    expect(closing.content).toBe("AiAgentsTour:AgentEmpty");
    expect((closing.target as () => Element | null)()).toBe(emptyScreen);
    // Still the step that drops the stand-in, so the section is the user's own
    // by the time the tour is over.
    expect(closing.before).toBeTypeOf("function");

    document.body.innerHTML = "";
  });

  it("never sends someone who cannot create an agent at the create button", () => {
    const userTitles = titles(userDemoFlags);

    expect(userTitles).not.toContain("RoomsTour:RoomsCreateFirstTitle");
    expect(userTitles).not.toContain("AiAgentsTour:AgentSwitchOnTitle");
  });

  it("closes on activation, not on creation, when AI is off for the portal", () => {
    // The whole walkthrough was a preview on such a portal, so the ending has
    // to name the one thing standing in the way rather than send the user at a
    // create button that is not on the screen.
    const closing = steps({ ...demoFlags, emptyScreenAction: "activate" }).at(
      -1,
    )!;

    expect(closing.title).toBe("AiAgentsTour:AgentSwitchOnTitle");
    expect(closing.content).toBe("AiAgentsTour:AgentSwitchOn");
    // Same anchor: the empty screen has one action either way.
    expect(closing.target).toBeTypeOf("function");
  });
});
