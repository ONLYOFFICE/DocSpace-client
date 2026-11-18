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

import type { Page } from "@playwright/test";

import {
  settingsHandler,
  TypeSettings,
  selfActivationStatusHandler,
  selfByTypeHandler,
  aiConfigHandler,
  aiSectionsHandlers,
  aiProjectMock,
  AiProjectMockAccess,
  AI_HUB_ROOMS,
  AI_PROJECTS,
  AI_PROJECT_WITH_SOURCES,
  roomMembersHandlers,
  type RoomMembersHandlerHandle,
} from "@docspace/shared/__mocks__/handlers";
import { ShareAccessRights } from "@docspace/shared/enums";

import { expect, test, TEST_PORT } from "./fixtures/base";

/**
 * The AI Chat section sits behind the portal's AI switch, on the nested
 * `/ai-rooms/*` paths: its Agents list, a skill set and an agent. With AI
 * off every one of them sends the user to their start page, never to an
 * error page.
 */

const [SKILL_SET] = AI_HUB_ROOMS;

const SECTION_URLS = [
  "/ai-rooms/filter",
  `/ai-rooms/${SKILL_SET.id}/filter?folder=${SKILL_SET.id}`,
  `/ai-rooms/${AI_PROJECT_WITH_SOURCES.id}/filter?folder=${AI_PROJECT_WITH_SOURCES.id}`,
];

const SECTION_PATH = /^\/ai-rooms\//;

const ERROR_404_PATH = "/error/404";

const pathnameOf = (page: Page) => new URL(page.url()).pathname;

test.describe("AI Chat section access", () => {
  test("are left for the user's start page once AI services are switched off", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone, {
        aiEnabled: false,
      }),
      selfByTypeHandler(TEST_PORT, "owner"),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      // The portal's AI is not set up either, which is the state a portal with
      // the switch off is normally in.
      aiConfigHandler(TEST_PORT, true),
      ...aiSectionsHandlers(TEST_PORT),
    );

    for (const url of SECTION_URLS) {
      await page.goto(`${baseUrl}${url}`);

      await expect
        .poll(() => pathnameOf(page), {
          message: `${url} stayed open with AI services off`,
        })
        .not.toMatch(SECTION_PATH);

      // Not an error page: the portal works, only the section is off.
      expect(pathnameOf(page)).not.toBe(ERROR_404_PATH);
    }
  });

  test("stay open while AI services are on", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
      selfByTypeHandler(TEST_PORT, "owner"),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      aiConfigHandler(TEST_PORT),
      ...aiSectionsHandlers(TEST_PORT),
    );

    for (const url of SECTION_URLS) {
      await page.goto(`${baseUrl}${url}`);

      await expect
        .poll(() => pathnameOf(page), {
          message: `${url} was bounced with AI services on`,
        })
        .toMatch(SECTION_PATH);
    }
  });
});

/**
 * An Agent manager lists, re-roles and removes the agent's members on the
 * Members tab of its Info panel, the room's members list; a Member is not
 * given the tab. A removal asks first and warns that the member's
 * conversations go with them.
 *
 * Spec: ai-agent-info-panel, "Members of an agent"; ai-agent-access,
 * "Removing a member warns about their conversations"
 */
test.describe("Members of an agent", () => {
  const MANAGED_AGENT = aiProjectMock({
    id: 777300,
    title: "Team agent",
    color: "8570FF",
    access: AiProjectMockAccess.ProjectManager,
  });

  const MEMBER_AGENT = aiProjectMock({
    id: 777301,
    title: "Shared agent",
    color: "5CC5D4",
    access: AiProjectMockAccess.Member,
  });

  const BOB = { id: "bob-0001", displayName: "Bob Member", email: "bob@example.com" };

  const agentUrl = (id: number) => `/ai-rooms/${id}/filter?folder=${id}`;

  const openInfoPanel = async (page: Page) => {
    const toggle = page.locator("#info-panel-toggle--open");
    if (await toggle.isVisible()) await toggle.click();
  };

  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
      selfByTypeHandler(TEST_PORT, "roomAdmin"),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      aiConfigHandler(TEST_PORT),
      ...aiSectionsHandlers(TEST_PORT, [...AI_PROJECTS, MANAGED_AGENT, MEMBER_AGENT]),
    );
  });

  test("an Agent manager re-roles and removes members, after a warning", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const membersHandle: { current: RoomMembersHandlerHandle | null } = {
      current: null,
    };
    mockRequest.use(
      ...roomMembersHandlers(TEST_PORT, MANAGED_AGENT.id, {
        handle: membersHandle,
        initial: [
          { id: BOB.id, displayName: BOB.displayName, email: BOB.email, access: ShareAccessRights.Collaborator },
        ],
      }),
    );

    await page.goto(`${baseUrl}${agentUrl(MANAGED_AGENT.id)}`);
    await openInfoPanel(page);

    // Details, Context and Content, then the members.
    const membersTab = page.getByTestId("info_members_tab");
    await expect(membersTab).toBeVisible();
    await expect(membersTab).toHaveText("Members");
    await membersTab.click();

    const list = page.getByTestId("info_panel_files_view_members");
    await expect(list).toContainText(BOB.displayName);

    const roleOf = page.getByRole("button", {
      name: new RegExp(`^Role of ${BOB.displayName}: `),
    });

    // Bob becomes an Agent manager.
    await roleOf.click();
    await page.getByText("Agent manager", { exact: true }).last().click();
    await expect
      .poll(() =>
        membersHandle.current!.getRequests().some(
          (r) =>
            r.method === "PUT" &&
            JSON.stringify(r.body).includes(BOB.id) &&
            JSON.stringify(r.body).includes(`"access":${ShareAccessRights.RoomManager}`),
        ),
      )
      .toBe(true);

    // Removing him asks first, with the conversation warning, and sends nothing until confirmed.
    const sentBefore = membersHandle.current!.getRequests().length;
    await roleOf.click();
    await page.getByText("Remove", { exact: true }).last().click();
    const confirmation = page.getByRole("dialog", { name: "Remove user" });
    await expect(confirmation).toBeVisible();
    await expect(confirmation).toContainText(
      "Their conversations with this agent, including the files in them, will be permanently deleted.",
    );
    expect(membersHandle.current!.getRequests().length).toBe(sentBefore);

    await page.getByTestId("remove_user_confirmation_dialog_ok_button").click();
    await expect(confirmation).toBeHidden();
    await expect(list).not.toContainText(BOB.displayName);
  });

  test("a Member has no Members tab", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}${agentUrl(MEMBER_AGENT.id)}`);
    await openInfoPanel(page);

    await expect(page.getByTestId("info_details_tab")).toBeVisible();
    await expect(page.getByTestId("info_members_tab")).toHaveCount(0);
  });
});
