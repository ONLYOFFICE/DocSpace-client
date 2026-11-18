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
  aiChatStoreHandlers,
  aiSectionsHandlers,
  aiHubRoomsAsUserHandler,
  aiAgentReadDeniedHandlers,
  aiProjectMock,
  AiProjectMockAccess,
  AI_HUB_ROOMS,
  AI_PROJECTS,
  AI_PROJECT_WITH_SOURCES,
  filesSettingsHandler,
  rootHandler,
  roomListHandler,
  roomMembersHandlers,
  TypeRoomList,
  usersByType,
  type RoomMembersHandlerHandle,
  type UserType,
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

/**
 * What each user is offered on an agent (`ai-agent-access`): the create
 * controls, the agent's card menu in the Agents list, the actions menu and
 * "Share agent" of its page, the chat panel's "Agent actions" and the "not a
 * member" view, for the stand-in users of `selfByTypeHandler` - the portal
 * owner, a DocSpace admin, a room admin and a User (`regular`) - and no AI
 * chat at all for a Guest (`visitor`). Every entry point asks the agent's
 * rights (the room's `security` and whether the user is in it), so each user
 * gets agents in the role the scenario names.
 *
 * Menu items by key: Edit agent `edit-room`, Share agent
 * `invite-users-to-room`, Agent info `room-info`, copy link
 * `link-for-room-members`, change owner `change-room-owner`, Delete agent
 * `delete`, Leave agent `leave-room`, notifications `mute-room`.
 */

const AGENTS_URL = "/ai-rooms/filter";
/** The rooms list (roomListHandler): its header opens the AI Chat panel. */
const ROOMS_URL = "/rooms/shared/";
const DESKTOP = { width: 1440, height: 1024 };

const agentPageUrl = (id: number) => `/ai-rooms/${id}/filter?folder=${id}`;

/** The user as an agent's `createdBy` holds them: the Agent owner is told by it. */
const creatorOf = (type: UserType) => {
  const user = usersByType[type];
  return {
    id: user.id,
    displayName: user.displayName,
    avatarSmall: user.avatarSmall,
    hasAvatar: user.hasAvatar,
    isOwner: user.isOwner,
    isAdmin: user.isAdmin,
    isRoomAdmin: user.isRoomAdmin,
    isCollaborator: user.isCollaborator,
    isVisitor: user.isVisitor,
  };
};

/** An agent created by the portal owner, in the given role of the caller. */
const ownersAgent = (
  id: number,
  title: string,
  access: (typeof AiProjectMockAccess)[keyof typeof AiProjectMockAccess],
) =>
  aiProjectMock({
    id,
    title,
    color: "5CC5D4",
    access,
    createdBy: creatorOf("owner"),
  });

/** A DocSpace admin's Agent manager role. */
const MANAGED_AGENT = ownersAgent(777310, "Support desk", AiProjectMockAccess.ProjectManager);
/** An agent a DocSpace admin is not in: they see it in the list all the same. */
const OUTSIDE_AGENT = ownersAgent(777311, "Board briefings", AiProjectMockAccess.None);
/** A User's Member role. */
const MEMBER_AGENT = aiProjectMock({
  id: 777330,
  title: "Help desk",
  color: "FF6680",
  access: AiProjectMockAccess.Member,
  createdBy: creatorOf("roomAdmin"),
});
/** A room admin's own agent. */
const ROOM_ADMINS_AGENT = aiProjectMock({
  id: 777320,
  title: "Onboarding guide",
  color: "8570FF",
  access: AiProjectMockAccess.Owner,
  createdBy: creatorOf("roomAdmin"),
});

/** The agents each user is offered in the Agents list and the agents menu. */
const AGENTS_OF: Record<"owner" | "admin" | "roomAdmin" | "regular", () => ReturnType<typeof aiProjectMock>[]> = {
  owner: () => [...AI_PROJECTS],
  admin: () => [MANAGED_AGENT, OUTSIDE_AGENT],
  roomAdmin: () => [ROOM_ADMINS_AGENT],
  regular: () => [MEMBER_AGENT],
};

const table = (page: Page) => page.getByTestId("table-body");

/** The section's create control: "New agent" beside the Agents list's search. */
const createControl = (page: Page) =>
  page.getByText("New agent", { exact: true }).filter({ visible: true });

const openCardMenu = async (page: Page, title: string) => {
  const row = table(page)
    .locator("[data-testid^=table-row-]")
    .filter({ hasText: title });
  await row.getByTestId("context-menu-button").first().click();
};

/** The "⋮" of the agent's page header. */
const openPageMenu = async (page: Page) => {
  await page.locator("#header_optional-button").click();
};

const closeMenu = async (page: Page) => {
  await page.keyboard.press("Escape");
};

/** The open menu has every `offered` item and none of the `withheld` ones. */
const expectMenu = async (
  page: Page,
  { offered, withheld }: { offered: string[]; withheld: string[] },
) => {
  for (const key of offered) {
    await expect(page.getByTestId(`option_${key}`)).toBeVisible();
  }
  for (const key of withheld) {
    await expect(page.getByTestId(`option_${key}`)).toHaveCount(0);
  }
};

/** "Share agent" of the agent's page header. */
const shareAgentButton = (page: Page) => page.getByTestId("navigation_button");

const notMemberView = (page: Page) =>
  page.getByText("You are not a member of this agent", { exact: true });

/** Docks the AI Chat panel from the rooms list header. */
const openChatPanel = async (page: Page, baseUrl: string) => {
  await page.setViewportSize(DESKTOP);
  await page.goto(`${baseUrl}${ROOMS_URL}`);
  await page.getByTestId("ai-chat-button").click();
  await expect(page.getByTestId("ai-chat-slot")).toHaveAttribute("data-open", "true");
};

/** Opens the agents menu of the panel title. */
const openAgentsMenu = async (page: Page) => {
  await page.getByTestId("ai-chat-agent-picker").click();
  await expect(page.getByTestId("ai-chat-agent-picker-menu")).toBeVisible();
};

test.describe("Agent access", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      aiConfigHandler(TEST_PORT),
      roomListHandler(TEST_PORT, TypeRoomList.ContextMenu),
      ...aiChatStoreHandlers(TEST_PORT),
    );
  });

  // Spec: ai-agent-access, "Who may create an agent"
  test.describe("Who may create an agent", () => {
    const CREATORS = [
      ["roomAdmin", "a room admin"],
      ["admin", "a DocSpace admin"],
      ["owner", "the portal owner"],
    ] as const;

    for (const [type, who] of CREATORS) {
      test(`Room admin: ${who} is offered the create control and "Save as new agent"`, async ({
        page,
        baseUrl,
        mockRequest,
      }) => {
        mockRequest.use(
          selfByTypeHandler(TEST_PORT, type),
          ...aiSectionsHandlers(TEST_PORT, AGENTS_OF[type]()),
        );

        await page.goto(`${baseUrl}${AGENTS_URL}`);
        await expect(table(page)).toBeVisible();
        await expect(createControl(page).first()).toBeVisible();

        await openChatPanel(page, baseUrl);
        await openAgentsMenu(page);
        await expect(page.getByTestId("ai-chat-agent-picker-save")).toBeVisible();
      });
    }

    test(`User: neither a create control nor "Save as new agent" is offered`, async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      const agents = AGENTS_OF.regular();
      mockRequest.use(
        selfByTypeHandler(TEST_PORT, "regular"),
        // The server's AI root offers a User no Create.
        aiHubRoomsAsUserHandler(TEST_PORT, agents),
        ...aiSectionsHandlers(TEST_PORT, agents),
      );

      await page.goto(`${baseUrl}${AGENTS_URL}`);
      await expect(table(page)).toBeVisible();
      await expect(table(page)).toContainText(MEMBER_AGENT.title);
      await expect(createControl(page)).toHaveCount(0);

      // The title menu still lists the agent the User is in, with no save.
      await openChatPanel(page, baseUrl);
      await openAgentsMenu(page);
      await expect(
        page.getByTestId(`ai-chat-agent-picker-agent-${MEMBER_AGENT.id}`),
      ).toBeVisible();
      await expect(page.getByTestId("ai-chat-agent-picker-save")).toHaveCount(0);
    });
  });

  // Spec: ai-agent-access, "Actions follow the agent's rights"
  test("Same answer everywhere", async ({ page, baseUrl, mockRequest }) => {
    mockRequest.use(
      selfByTypeHandler(TEST_PORT, "regular"),
      aiHubRoomsAsUserHandler(TEST_PORT, AGENTS_OF.regular()),
      ...aiSectionsHandlers(TEST_PORT, AGENTS_OF.regular()),
    );

    // The card menu.
    await page.goto(`${baseUrl}${AGENTS_URL}`);
    await expect(table(page)).toContainText(MEMBER_AGENT.title);
    await openCardMenu(page, MEMBER_AGENT.title);
    await expectMenu(page, { offered: ["room-info"], withheld: ["edit-room"] });
    await closeMenu(page);

    // The page menu.
    await page.goto(`${baseUrl}${agentPageUrl(MEMBER_AGENT.id)}`);
    await expect(page.getByTestId("ai-project-intro")).toBeVisible();
    await openPageMenu(page);
    await expectMenu(page, { offered: ["room-info"], withheld: ["edit-room"] });
    await closeMenu(page);

    // The chat panel's "Agent actions", on the agent picked in its title.
    await openChatPanel(page, baseUrl);
    await openAgentsMenu(page);
    await page.getByTestId(`ai-chat-agent-picker-agent-${MEMBER_AGENT.id}`).click();
    await page.getByTestId("ai-chat-agent-actions").click();
    await expect(page.getByTestId("ai-chat-agent-action-info")).toBeVisible();
    await expect(page.getByTestId("ai-chat-agent-action-edit")).toHaveCount(0);
    await expect(page.getByTestId("ai-chat-agent-action-share")).toHaveCount(0);
    await expect(page.getByTestId("ai-chat-agent-action-delete")).toHaveCount(0);
  });

  // Spec: ai-agent-access, "What the Agent owner is offered"
  test.describe("What the Agent owner is offered", () => {
    const OWNERS = [
      ["owner", "the portal owner", AI_PROJECT_WITH_SOURCES],
      ["roomAdmin", "a room admin", ROOM_ADMINS_AGENT],
    ] as const;

    for (const [type, who, agent] of OWNERS) {
      test(`Owner on the agent's page: ${who}`, async ({
        page,
        baseUrl,
        mockRequest,
      }) => {
        mockRequest.use(
          selfByTypeHandler(TEST_PORT, type),
          ...aiSectionsHandlers(TEST_PORT, AGENTS_OF[type]()),
        );

        const ownerMenu = {
          offered: ["edit-room", "invite-users-to-room", "change-room-owner", "delete"],
          withheld: ["leave-room"],
        };

        // The card menu answers as the page does.
        await page.goto(`${baseUrl}${AGENTS_URL}`);
        await expect(table(page)).toContainText(agent.title);
        await openCardMenu(page, agent.title);
        await expectMenu(page, ownerMenu);
        await closeMenu(page);

        await page.goto(`${baseUrl}${agentPageUrl(agent.id)}`);
        await expect(page.getByTestId("ai-project-intro")).toBeVisible();
        await expect(shareAgentButton(page)).toHaveText("Share agent");

        await openPageMenu(page);
        await expectMenu(page, ownerMenu);
      });
    }
  });

  // Spec: ai-agent-access, "What an Agent manager is offered"
  test("Manager on the agent's page", async ({ page, baseUrl, mockRequest }) => {
    mockRequest.use(
      selfByTypeHandler(TEST_PORT, "admin"),
      ...aiSectionsHandlers(TEST_PORT, AGENTS_OF.admin()),
    );

    const managerMenu = {
      offered: ["edit-room", "invite-users-to-room", "leave-room"],
      withheld: ["delete", "change-room-owner"],
    };

    await page.goto(`${baseUrl}${AGENTS_URL}`);
    await expect(table(page)).toContainText(MANAGED_AGENT.title);
    await openCardMenu(page, MANAGED_AGENT.title);
    await expectMenu(page, managerMenu);
    await closeMenu(page);

    await page.goto(`${baseUrl}${agentPageUrl(MANAGED_AGENT.id)}`);
    await expect(page.getByTestId("ai-project-intro")).toBeVisible();
    await expect(shareAgentButton(page)).toHaveText("Share agent");

    await openPageMenu(page);
    await expectMenu(page, managerMenu);
  });

  // Spec: ai-agent-access, "What a Member is offered"
  test("Member in the agent's chat", async ({ page, baseUrl, mockRequest }) => {
    mockRequest.use(
      selfByTypeHandler(TEST_PORT, "regular"),
      aiHubRoomsAsUserHandler(TEST_PORT, AGENTS_OF.regular()),
      ...aiSectionsHandlers(TEST_PORT, AGENTS_OF.regular()),
    );

    // Pin and notifications are offered too ("What a Member is offered");
    // what a Member may not do is the point here.
    const memberMenu = {
      offered: ["room-info", "link-for-room-members", "leave-room"],
      withheld: ["edit-room", "invite-users-to-room", "change-room-owner", "delete"],
    };

    await page.goto(`${baseUrl}${AGENTS_URL}`);
    await expect(table(page)).toContainText(MEMBER_AGENT.title);
    await openCardMenu(page, MEMBER_AGENT.title);
    await expectMenu(page, memberMenu);
    await closeMenu(page);

    await page.goto(`${baseUrl}${agentPageUrl(MEMBER_AGENT.id)}`);
    // The chat works: the agent's page opens on it.
    await expect(page.getByTestId("ai-project-intro")).toBeVisible();
    await expect(notMemberView(page)).toHaveCount(0);
    await expect(shareAgentButton(page)).toHaveCount(0);

    await openPageMenu(page);
    await expectMenu(page, memberMenu);
  });

  // Spec: ai-agent-access, "What an admin outside the agent is offered"
  test.describe("What an admin outside the agent is offered", () => {
    test("DocSpace admin opens someone else's agent", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      mockRequest.use(
        selfByTypeHandler(TEST_PORT, "admin"),
        ...aiSectionsHandlers(TEST_PORT, AGENTS_OF.admin()),
      );

      const outsiderMenu = {
        offered: ["room-info", "link-for-room-members", "change-room-owner", "delete"],
        withheld: [
          "edit-room",
          "invite-users-to-room",
          "leave-room",
          "mute-room",
          "unmute-room",
        ],
      };

      // The agent is in the Agents list, with its card menu.
      await page.goto(`${baseUrl}${AGENTS_URL}`);
      await expect(table(page)).toContainText(OUTSIDE_AGENT.title);
      await openCardMenu(page, OUTSIDE_AGENT.title);
      await expectMenu(page, outsiderMenu);
      await closeMenu(page);

      // Opened from the list: the "not a member" view in place of the chat.
      await table(page).getByText(OUTSIDE_AGENT.title, { exact: true }).click();
      await expect
        .poll(() => new URL(page.url()).pathname)
        .toBe(`/ai-rooms/${OUTSIDE_AGENT.id}/filter`);
      await expect(notMemberView(page)).toBeVisible();
      await expect(page.getByTestId("ai-project-intro")).toHaveCount(0);
      await expect(shareAgentButton(page)).toHaveCount(0);

      await openPageMenu(page);
      await expectMenu(page, outsiderMenu);
      await closeMenu(page);

      // Nor is the agent in the chat's agents menu, which lists the
      // agent the admin is in.
      await openChatPanel(page, baseUrl);
      await openAgentsMenu(page);
      await expect(
        page.getByTestId(`ai-chat-agent-picker-agent-${MANAGED_AGENT.id}`),
      ).toBeVisible();
      await expect(
        page.getByTestId(`ai-chat-agent-picker-agent-${OUTSIDE_AGENT.id}`),
      ).toHaveCount(0);
    });

    test("Room admin outside the agent", async ({ page, baseUrl, mockRequest }) => {
      // The server lists a room admin only the agents they are in, and
      // refuses to read another.
      mockRequest.use(
        selfByTypeHandler(TEST_PORT, "roomAdmin"),
        ...aiSectionsHandlers(TEST_PORT, AGENTS_OF.roomAdmin()),
        ...aiAgentReadDeniedHandlers(TEST_PORT, [OUTSIDE_AGENT.id]),
      );

      await page.goto(`${baseUrl}${AGENTS_URL}`);
      await expect(table(page)).toContainText(ROOM_ADMINS_AGENT.title);
      await expect(table(page)).not.toContainText(OUTSIDE_AGENT.title);

      // Its address answers with the server's error: neither its chat nor
      // the "not a member" view, which is an admin's.
      const refused = page.waitForResponse(
        (response) =>
          response.status() === 403 &&
          response.url().includes(`/files/${OUTSIDE_AGENT.id}`),
      );
      await page.goto(`${baseUrl}${agentPageUrl(OUTSIDE_AGENT.id)}`);
      await refused;
      await expect(page.getByTestId("ai-project-intro")).toHaveCount(0);
      await expect(notMemberView(page)).toHaveCount(0);
      await expect(page.getByText(OUTSIDE_AGENT.title, { exact: true })).toHaveCount(0);
    });
  });

  // Spec: ai-agent-access, "Guests have no AI chat"
  test("Guest signs in", async ({ page, baseUrl, mockRequest }) => {
    mockRequest.use(
      selfByTypeHandler(TEST_PORT, "visitor"),
      // The server serves no AI root to a guest.
      rootHandler(TEST_PORT, { withAiHub: false }),
    );

    await page.setViewportSize(DESKTOP);
    await page.goto(`${baseUrl}${ROOMS_URL}`);
    await expect(table(page)).toBeVisible();

    await expect(page.getByTestId("ai-chat-button")).toHaveCount(0);
    await expect(page.getByTestId("ai-chat-slot")).toHaveCount(0);
    await expect(page.getByTestId("ai-chat-agent-picker")).toHaveCount(0);
    await expect(page.locator("#article-container")).not.toContainText("AI Chat");
  });
});
