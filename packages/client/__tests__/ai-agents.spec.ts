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
import { endpoints } from "@docspace/shared/__mocks__/e2e";

import { expect, test } from "./fixtures/base";

test.describe("AI agents", () => {
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
			endpoints.aiProvidersList,
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

	test("should render AI agents create dialog and create AI agent", async ({
		page,
		mockRequest,
	}) => {
		await mockRequest.router([
			endpoints.aiAgentsEmptyCreate,
			endpoints.emptyTags,
			endpoints.aiModelsClaude,
			endpoints.aiServer,
			endpoints.aiServers,
		]);

		await page.goto("/ai-agents/filter");

		const mainBtn = page.getByTestId("create_new_agent_button");

		await expect(mainBtn).toBeVisible();

		await mainBtn.click();

		const asideHeader = page.getByTestId("aside-header");

		await expect(asideHeader).toBeVisible();
		await expect(page.getByText("Claude AI").first()).toBeVisible();
		await expect(page.getByText("Claude Opus 4.5").first()).toBeVisible();
		await expect(page.getByText("ONLYOFFICE DocSpace").first()).toBeVisible();

		const providerCombobox = page.getByTestId("combobox").first();
		const modelsCombobox = page.getByTestId("combobox").nth(1);

		await expect(providerCombobox).toBeVisible();
		await expect(modelsCombobox).toBeVisible();

		const providerButton = providerCombobox.getByRole("button");
		const modelsButton = modelsCombobox.getByRole("button");

		await expect(providerButton).toBeVisible();
		await expect(modelsButton).toBeVisible();

		await modelsButton.click();

		await expect(page.getByText("Claude Opus 4.5").nth(1)).toBeVisible();
		await expect(page.getByText("Claude Haiku 4.5").nth(0)).toBeVisible();
		await expect(page.getByText("Claude Sonnet 4.5").nth(0)).toBeVisible();

		await page.getByText("Claude Opus 4.5").nth(1).click();

		await providerButton.click();

		await expect(page.getByText("Claude AI").nth(1)).toBeVisible();
		await expect(page.getByText("OpenAI").first()).toBeVisible();
		await expect(page.getByText("Together AI").first()).toBeVisible();
		await expect(page.getByText("OpenRouter").first()).toBeVisible();

		await mockRequest.router([endpoints.aiModelsOpenAI]);

		await page.getByText("OpenAI").first().click();

		await expect(page.getByText("OpenAI").first()).toBeVisible();
		await expect(page.getByText("GPT-5.1").first()).toBeVisible();

		await modelsButton.click();

		await expect(page.getByText("GPT-5.1").nth(1)).toBeVisible();
		await expect(page.getByText("GPT-5").nth(2)).toBeVisible();
		await expect(page.getByText("GPT-4.1").first()).toBeVisible();

		await page.getByText("GPT-4.1").first().click();

		await expect(page.getByText("GPT-4.1").first()).toBeVisible();

		const nameInput = page.getByTestId("create_edit_agent_input");

		const inputName = "First AI agent";

		await nameInput.fill(inputName);

		const inputValue = await nameInput.inputValue();

		expect(inputValue).toBe(inputName);

		const instructionInput = page.getByTestId("textarea");

		const instructionValue = "Instruction for AI agent";

		await instructionInput.fill(instructionValue);

		const instructionValueInput = await instructionInput.inputValue();

		expect(instructionValueInput).toBe(instructionValue);

		const removeDocSpaceServer = page.locator(
			".ai-mcp-item > .IconButton-module__iconButton--aPwf0 > .IconButton-module__notSelectable--faLNW > div > .injected-svg > path",
		);

		await removeDocSpaceServer.click();

		await expect(
			page.getByText("ONLYOFFICE DocSpace").first(),
		).not.toBeVisible();

		const addServersBtn = page.getByTestId("selector-add-button");

		await addServersBtn.click();

		await expect(page.getByText("ONLYOFFICE DocSpace").first()).toBeVisible();
		await expect(page.getByText("custom").first()).toBeVisible();

		const firstCheckBox = page
			.locator(".Checkbox-module__checkbox--oU4gW")
			.first();

		const secondCheckBox = page
			.locator(".Checkbox-module__checkbox--oU4gW")
			.nth(1);

		await firstCheckBox.click();
		await secondCheckBox.click();

		const addButton = page.getByTestId("selector_submit_button").first();

		await addButton.click();

		await expect(page.getByText("ONLYOFFICE DocSpace").first()).toBeVisible();
		await expect(
			page.getByText("custom", { exact: true }).first(),
		).toBeVisible();

		const createButton = page.getByTestId("create_agent_dialog_save").first();

		await expect(createButton).toBeVisible();

		let createAgentPayload: string | null = null;

		await page.route("**/api/2.0/ai/agents", async (route, request) => {
			if (request.method() === "POST") {
				createAgentPayload = request.postData();
			}

			await route.fulfill({
				status: 200,
				body: JSON.stringify({}),
			});
		});

		await createButton.click();

		expect(createAgentPayload).toBeDefined();

		const parsedPayload = JSON.parse(createAgentPayload ?? "");

		expect(parsedPayload.title).toBe(inputName);
		expect(parsedPayload.chatSettings.prompt).toBe(instructionValue);
		expect(parsedPayload.chatSettings.modelId).toBe("gpt-4.1");
		expect(parsedPayload.chatSettings.providerId).toBe(2);
	});

	test("should render AI agents list", async ({ page, mockRequest }) => {
		await mockRequest.router([endpoints.aiAgentsListCreate]);

		await page.goto("/ai-agents/filter");

		await expect(page.getByText("Plugin SDK")).toBeVisible();
	});

	test("should render AI agent context menu", async ({ page, mockRequest }) => {
		await mockRequest.router([endpoints.aiAgentsListCreate]);

		await page.goto("/ai-agents/filter");

		await expect(page.getByText("Plugin SDK")).toBeVisible();

		await page
			.getByRole("button", { name: "PS Plugin SDK, 10/12/2025 09:" })
			.click();

		await expect(page.getByText("Pin").first()).toBeVisible();
		await expect(page.getByText("Delete").first()).toBeVisible();

		await page.locator(".Checkbox-module__checkbox--oU4gW ").first().click();

		await expect(page.getByText("Pin").first()).not.toBeVisible();
		await expect(page.getByText("Delete").first()).not.toBeVisible();

		const contextMenuButton = page.getByTestId("context-menu-button");

		await contextMenuButton.click();

		await expect(page.getByTestId("select").first()).toBeVisible();
		await expect(page.getByTestId("open").first()).toBeVisible();
		await expect(page.getByTestId("pin-room").first()).toBeVisible();
		await expect(page.getByTestId("mute-room").first()).toBeVisible();
		// await expect(page.getByTestId("manage").first()).toBeVisible();
		await expect(
			page.getByTestId("invite-users-to-room").first(),
		).toBeVisible();
		// await expect(page.getByTestId("room-info").first()).toBeVisible();
		await expect(page.getByTestId("delete").first()).toBeVisible();
	});
});
