// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
import { BASE_URL, endpoints } from "@docspace/shared/__mocks__/e2e";
import { ShareAccessRights } from "@docspace/shared/enums";
import {
	createLinkRoute,
	LINKS_FILE_PATH,
} from "@docspace/shared/__mocks__/e2e/handlers/share";

import { expect, test } from "./fixtures/base";

test.describe("Shared with me", () => {
	test.beforeEach(async ({ mockRequest }) => {
		await mockRequest.router([
			endpoints.settingsWithQuery,
			endpoints.colorTheme,
			endpoints.build,
			endpoints.capabilities,
			endpoints.selfEmailActivatedClient,
			endpoints.tariff,
			endpoints.quota,
			endpoints.aiConfig,
			endpoints.additionalSettings,
			endpoints.getPortal,
			endpoints.companyInfo,
			endpoints.cultures,
			endpoints.root,
			endpoints.invitationSettings,
			endpoints.filesSettings,
			endpoints.webPlugins,
			endpoints.thirdPartyCapabilities,
			endpoints.thirdParty,
			endpoints.docService,
		]);
	});

	test("should render AI agents not available", async ({
		page,
		mockRequest,
	}) => {
		await mockRequest.router([
			endpoints.aiAgentsEmpty,
			endpoints.aiConfigDisabled,
		]);

		await page.goto("/ai-agents/filter");

		const emptyView = page.getByTestId("empty-view");
		await expect(emptyView).toBeVisible();

		const title = emptyView.locator("h3").first();

		await expect(title).toBeVisible();
		await expect(title).toHaveText("AI provider is not available yet");

		const description = emptyView.locator("p").first();

		await expect(description).toBeVisible();
		await expect(description).toHaveText(
			"Connect your own AI service to unlock advanced features in DocSpace. Once added, it will be accessible to all users in AI chats.",
		);

		const btn = emptyView.locator("button").first();

		await expect(btn).toBeVisible();
		await expect(btn).toHaveText("Go to Settings");

		await btn.click();

		await page.waitForURL("/portal-settings/ai-settings/providers");

		const portalSettingsHeader = page.locator(".header");

		await expect(portalSettingsHeader).toBeVisible();
		await expect(portalSettingsHeader).toHaveText("AI settings");
	});

	test("should render AI agents empty view", async ({ page, mockRequest }) => {
		await mockRequest.router([
			endpoints.aiAgentsEmptyCreate,
			endpoints.emptyTags,
		]);

		await page.goto("/ai-agents/filter");

		const emptyView = page.getByTestId("empty-view");
		await expect(emptyView).toBeVisible();

		const title = emptyView.locator("h3").first();

		await expect(title).toBeVisible();
		await expect(title).toHaveText("Create your AI agent");

		const description = emptyView.locator("p").first();

		await expect(description).toBeVisible();
		await expect(description).toHaveText(
			"Set up a personalized assistant for your team by adding a knowledge base, selecting the ideal model, and connecting an MCP server. Invite your colleagues to collaborate and make the most of the agent’s chat capabilities.",
		);

		const btn = emptyView.getByLabel("Create a new agent").first();

		await expect(btn).toBeVisible();

		const btnHeader = btn.locator("h4").first();
		const btnDescription = btn.locator("p").first();

		await expect(btnHeader).toBeVisible();
		await expect(btnHeader).toHaveText("Create a new agent");

		await expect(btnDescription).toBeVisible();
		await expect(btnDescription).toHaveText(
			"Start building your first AI agent",
		);

		await btn.click();

		const asideHeader = page.getByTestId("aside-header");

		await expect(asideHeader).toBeVisible();
	});
});
