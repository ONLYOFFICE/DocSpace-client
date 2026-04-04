// (c) Copyright Ascensio System SIA 2009-2026
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

import { http } from "msw";
import {
  filesSettingsHandler,
  myDocumentsHandler,
  myHandler,
  rootHandler,
  selfActivationStatusHandler,
  settingsHandler,
  TypeSettings,
  webPluginsHandler,
} from "@docspace/shared/__mocks__/handlers";
import { BASE_URL } from "@docspace/shared/__mocks__/e2e";

import { expect, test, TEST_PORT } from "../fixtures/base";

const PLUGIN_REQUEST_URL = "**/plugins/api-sample/plugin.js";
const ROOMS_API_URL = `${BASE_URL}:${TEST_PORT}/api/2.0/files/rooms`;

// Shared rooms page — the plugin works on any authenticated page.
const PERSONAL_FOLDER_URL = "/rooms/personal/filter?folder=12764";

// ─── Mock room response returned by POST /api/2.0/files/rooms ─────────────────

const MOCK_ROOM_TITLE = "Plugin-created Room";

const mockCreatedRoom = {
  response: {
    id: 9001,
    title: MOCK_ROOM_TITLE,
    roomType: 2,
    parentId: 2002,
    filesCount: 0,
    foldersCount: 0,
    new: 0,
    mute: false,
    tags: [],
    pinned: false,
    private: false,
    shared: false,
    access: 0,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * MSW handler for POST /api/2.0/files/rooms.
 * Returns a minimal room object so the plugin can extract the title.
 */
const createRoomSuccessHandler = () =>
  http.post(ROOMS_API_URL, () => new Response(JSON.stringify(mockCreatedRoom)));

/**
 * MSW handler that makes POST /api/2.0/files/rooms return 500.
 */
const createRoomErrorHandler = () =>
  http.post(ROOMS_API_URL, () => new Response(null, { status: 500 }));

/**
 * Wait until the plugin's onLoadCallback has finished:
 * - createAPIUrl() has populated apiURL
 * - the "Create Room" profile menu item is registered
 */
async function waitForPluginReady(
  page: import("@playwright/test").Page,
): Promise<void> {
  await page.waitForFunction(() => {
    const iframe = document.getElementById(
      "plugin-iframe",
    ) as HTMLIFrameElement | null;

    const p = (iframe?.contentWindow as any)?.Plugins?.Apiplugin;
    return (
      typeof p?.apiURL === "string" &&
      p.apiURL.length > 0 &&
      p.getProfileMenuItems?.()?.size >= 1
    );
  });
}

/** Click the profile avatar to open the profile dropdown. */
async function openProfileMenu(
  page: import("@playwright/test").Page,
): Promise<void> {
  const btn = page.getByTestId("profile_user_icon_button");
  await expect(btn).toBeVisible();
  await btn.click();
}

// ─── Test suite ───────────────────────────────────────────────────────────────

test.describe("API Sample Plugin — room creation via IApiPlugin", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithPlugins),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      myHandler(TEST_PORT, true),
      myDocumentsHandler(TEST_PORT, true),
      webPluginsHandler(TEST_PORT, "withApiPlugin"),
      // Default: room creation succeeds.
      createRoomSuccessHandler(),
    );
  });

  // ── 1. createAPIUrl builds the correct base URL ───────────────────────────────
  // After setAPI(origin, "", "/api/2.0") the URL should be
  // "{origin}/api/2.0" with no double-slashes.

  test("createAPIUrl assembles apiURL from origin and prefix", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await waitForPluginReady(page);

    const { apiURL, origin, prefix } = await page.evaluate(() => {
      const p = (
        document.getElementById("plugin-iframe") as HTMLIFrameElement | null
      )?.contentWindow as any;
      const plugin = p?.Plugins?.Apiplugin;
      return {
        apiURL: plugin?.apiURL as string,
        origin: plugin?.origin as string,
        prefix: plugin?.prefix as string,
      };
    });

    // apiURL must start with the origin (no trailing slash) and end with
    // the prefix stripped of its leading slash.
    expect(apiURL).toBeTruthy();
    expect(apiURL).toBe(origin.replace(/\/+$/, "") + prefix);
    // No double-slash between origin and prefix.
    expect(apiURL).not.toContain("//api");
  });

  // ── 2. Clicking "Create Room" sends POST to the correct endpoint ──────────────

  test("Create Room sends POST /api/2.0/files/rooms with correct body", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await waitForPluginReady(page);

    // Capture the outgoing POST request.
    const postRequest = page.waitForRequest(
      (req) =>
        req.url().includes("/api/2.0/files/rooms") && req.method() === "POST",
    );

    await openProfileMenu(page);
    await page.locator("#api-sample-create-room").click();

    const req = await postRequest;

    // Verify endpoint.
    expect(req.url()).toContain("/api/2.0/files/rooms");

    // Verify body payload.
    const body = JSON.parse(req.postData() ?? "{}");
    expect(body.title).toBe("Plugin-created Room");
    expect(body.roomType).toBe(2);
  });

  // ── 3. Successful creation shows a success toast with the room title ──────────

  test("Successful room creation shows a success toast", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await waitForPluginReady(page);

    await openProfileMenu(page);
    await page.locator("#api-sample-create-room").click();

    const toast = page.getByTestId("toast-content");
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute("data-type", "success");
    await expect(toast).toContainText(`Room created: "${MOCK_ROOM_TITLE}"`);
  });

  // ── 4. API failure shows an error toast ──────────────────────────────────────
  // Override the success handler with a 500 response.

  test("API failure shows an error toast", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(createRoomErrorHandler());

    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await waitForPluginReady(page);

    await openProfileMenu(page);
    await page.locator("#api-sample-create-room").click();

    const toast = page.getByTestId("toast-content");
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute("data-type", "error");
    await expect(toast).toContainText("Failed to create room");
  });
});

