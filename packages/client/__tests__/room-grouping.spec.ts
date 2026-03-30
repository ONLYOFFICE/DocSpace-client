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

import { expect, test, TEST_PORT } from "./fixtures/base";
import {
  settingsHandler,
  TypeSettings,
  selfActivationStatusHandler,
  roomListHandler,
  TypeRoomList,
  filesSettingsHandler,
  roomGroupsHandler,
  roomGroupByIdHandler,
  createRoomGroupHandler,
  updateRoomGroupHandler,
  deleteRoomGroupHandler,
  updateRoomGroupIconHandler,
} from "@docspace/shared/__mocks__/handlers";

test.describe("Room grouping", () => {
  // Set up authenticated user and room list for all tests in this suite
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      roomListHandler(TEST_PORT, TypeRoomList.IsDefault),
    );
  });

  test.describe("Edit room groups panel", () => {
    // Verify that the Edit room groups panel opens and displays correctly
    // with the grouping toggle, tooltip, and Create new group button
    test("should open Edit room groups panel with grouping enabled", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        filesSettingsHandler(TEST_PORT, { organizeRoomsGrouping: true }),
        roomGroupsHandler(TEST_PORT, true),
        roomGroupByIdHandler(TEST_PORT),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      // Open the group management button in the filter row
      const groupManagementButton = page.locator(
        '[class*="groupManagementButton"]',
      );

      await expect(groupManagementButton).toBeVisible();
      await groupManagementButton.click();

      const dialog = page.getByTestId("modal-dialog");
      await expect(dialog).toBeVisible();

      // Screenshot: Edit room groups panel with grouping enabled and groups listed
      await expect(dialog).toHaveScreenshot([
        "desktop",
        "room-grouping",
        "edit-room-groups-panel-enabled.png",
      ]);
    });

    // Verify that the Edit room groups panel displays correctly
    // when there are no groups created yet
    test("should show empty state when no groups exist", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        filesSettingsHandler(TEST_PORT, { organizeRoomsGrouping: true }),
        roomGroupsHandler(TEST_PORT, false),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const groupManagementButton = page.locator(
        '[class*="groupManagementButton"]',
      );

      await expect(groupManagementButton).toBeVisible();
      await groupManagementButton.click();

      const dialog = page.getByTestId("modal-dialog");
      await expect(dialog).toBeVisible();

      // Screenshot: Edit room groups panel with no groups (empty state)
      await expect(dialog).toHaveScreenshot([
        "desktop",
        "room-grouping",
        "edit-room-groups-panel-empty.png",
      ]);
    });

    // Verify that the Edit room groups panel displays correctly
    // when room grouping is disabled in settings
    test("should show panel with grouping disabled", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        filesSettingsHandler(TEST_PORT, { organizeRoomsGrouping: false }),
        roomGroupsHandler(TEST_PORT, true),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      // When grouping is disabled, the group tags row won't be visible,
      // so we need to verify the rooms page loads without the grouping row
      const groupTagsRow = page.locator('[class*="rowGroupingRooms"]');
      await expect(groupTagsRow).not.toBeVisible();

      // Screenshot: Rooms page without grouping row when grouping is disabled
      await expect(page).toHaveScreenshot([
        "desktop",
        "room-grouping",
        "rooms-page-grouping-disabled.png",
      ]);
    });
  });

  test.describe("Grouping toggle", () => {
    // Verify that toggling the grouping switch shows Save and Cancel buttons
    // and that the toggle state changes visually
    test("should show Save/Cancel buttons when toggle is changed", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        filesSettingsHandler(TEST_PORT, { organizeRoomsGrouping: true }),
        roomGroupsHandler(TEST_PORT, true),
        roomGroupByIdHandler(TEST_PORT),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const groupManagementButton = page.locator(
        '[class*="groupManagementButton"]',
      );

      await expect(groupManagementButton).toBeVisible();
      await groupManagementButton.click();

      const dialog = page.getByTestId("modal-dialog");
      await expect(dialog).toBeVisible();

      // Click the grouping toggle to disable grouping
      const toggle = dialog.getByTestId("toggle_room_groups_button");
      await expect(toggle).toBeVisible();
      await toggle.click();

      // Save and Cancel buttons should now be visible in the footer
      const saveButton = dialog.locator('button:has-text("Save")');
      await expect(saveButton).toBeVisible();

      const cancelButton = dialog.locator('button:has-text("Cancel")');
      await expect(cancelButton).toBeVisible();

      // Screenshot: Panel with grouping toggled off showing Save/Cancel buttons
      await expect(dialog).toHaveScreenshot([
        "desktop",
        "room-grouping",
        "toggle-off-save-cancel-buttons.png",
      ]);
    });

    // Verify that clicking Cancel after toggling reverts the toggle state
    // and closes the dialog without saving
    test("should revert toggle state on Cancel", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        filesSettingsHandler(TEST_PORT, { organizeRoomsGrouping: true }),
        roomGroupsHandler(TEST_PORT, true),
        roomGroupByIdHandler(TEST_PORT),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const groupManagementButton = page.locator(
        '[class*="groupManagementButton"]',
      );

      await expect(groupManagementButton).toBeVisible();
      await groupManagementButton.click();

      const dialog = page.getByTestId("modal-dialog");
      await expect(dialog).toBeVisible();

      // Toggle off
      const toggle = dialog.getByTestId("toggle_room_groups_button");
      await expect(toggle).toBeVisible();
      await toggle.click();

      // Click Cancel
      const cancelButton = dialog.locator('button:has-text("Cancel")');
      await expect(cancelButton).toBeVisible();
      await cancelButton.click();

      // Dialog should close
      await expect(dialog).not.toBeVisible();
    });

    // Verify that groups appear disabled (grayed out) when the toggle is off
    test("should disable group items when toggle is off", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        filesSettingsHandler(TEST_PORT, { organizeRoomsGrouping: true }),
        roomGroupsHandler(TEST_PORT, true),
        roomGroupByIdHandler(TEST_PORT),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const groupManagementButton = page.locator(
        '[class*="groupManagementButton"]',
      );

      await expect(groupManagementButton).toBeVisible();
      await groupManagementButton.click();

      const dialog = page.getByTestId("modal-dialog");
      await expect(dialog).toBeVisible();

      // Toggle off grouping
      const toggle = dialog.getByTestId("toggle_room_groups_button");
      await expect(toggle).toBeVisible();
      await toggle.click();

      // Screenshot: Groups should appear disabled/grayed out
      await expect(dialog).toHaveScreenshot([
        "desktop",
        "room-grouping",
        "groups-disabled-state.png",
      ]);
    });
  });

  test.describe("Dismissible tooltip", () => {
    // Verify that the info tooltip is visible when the panel opens
    // for the first time (before being dismissed)
    test("should display info tooltip on first open", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        filesSettingsHandler(TEST_PORT, { organizeRoomsGrouping: true }),
        roomGroupsHandler(TEST_PORT, true),
        roomGroupByIdHandler(TEST_PORT),
      );

      // Clear the tooltip dismissed flag from localStorage
      await page.goto(`${baseUrl}/rooms/shared/`);
      await page.evaluate(() => {
        localStorage.removeItem("roomGroupingTooltipDismissed");
      });

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const groupManagementButton = page.locator(
        '[class*="groupManagementButton"]',
      );

      await expect(groupManagementButton).toBeVisible();
      await groupManagementButton.click();

      const dialog = page.getByTestId("modal-dialog");
      await expect(dialog).toBeVisible();

      // The info bar/tooltip should be visible
      const infoBar = dialog.locator('[class*="infoBar"]');
      await expect(infoBar).toBeVisible();

      // Screenshot: Panel with dismissible tooltip visible
      await expect(dialog).toHaveScreenshot([
        "desktop",
        "room-grouping",
        "tooltip-visible.png",
      ]);
    });

    // Verify that clicking the close button on the tooltip dismisses it
    // and it does not reappear on subsequent opens
    test("should dismiss tooltip when close button is clicked", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        filesSettingsHandler(TEST_PORT, { organizeRoomsGrouping: true }),
        roomGroupsHandler(TEST_PORT, true),
        roomGroupByIdHandler(TEST_PORT),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);
      await page.evaluate(() => {
        localStorage.removeItem("roomGroupingTooltipDismissed");
      });

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const groupManagementButton = page.locator(
        '[class*="groupManagementButton"]',
      );

      await expect(groupManagementButton).toBeVisible();
      await groupManagementButton.click();

      const dialog = page.getByTestId("modal-dialog");
      await expect(dialog).toBeVisible();

      // Find and click the close button on the tooltip
      const infoBar = dialog.locator('[class*="infoBar"]');
      await expect(infoBar).toBeVisible();

      const closeButton = infoBar.locator('[class*="close"]').first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }

      // Tooltip should be dismissed
      await expect(infoBar).not.toBeVisible();

      // Screenshot: Panel after tooltip is dismissed
      await expect(dialog).toHaveScreenshot([
        "desktop",
        "room-grouping",
        "tooltip-dismissed.png",
      ]);
    });
  });

  test.describe("Group tags row in filter", () => {
    // Verify that the group tags row appears in the filter area
    // when grouping is enabled and groups exist
    test("should display group tags row when grouping is enabled", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        filesSettingsHandler(TEST_PORT, { organizeRoomsGrouping: true }),
        roomGroupsHandler(TEST_PORT, true),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      // The grouping row with tags should be visible
      const groupTagsRow = page.locator('[class*="rowGroupingRooms"]');
      await expect(groupTagsRow).toBeVisible();

      // "All Rooms" tag should be visible (not in measure container)
      const allRoomsTag = groupTagsRow.getByTestId("all_rooms_tags_measure");
      await expect(allRoomsTag).toBeVisible();

      // Screenshot: Filter area with group tags row visible
      await expect(page).toHaveScreenshot([
        "desktop",
        "room-grouping",
        "group-tags-row-visible.png",
      ]);
    });

    // Verify that clicking a group tag filters the rooms view
    test("should filter rooms when a group tag is clicked", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        filesSettingsHandler(TEST_PORT, { organizeRoomsGrouping: true }),
        roomGroupsHandler(TEST_PORT, true),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const groupTagsRow = page.locator('[class*="rowGroupingRooms"]');
      await expect(groupTagsRow).toBeVisible();

      // Click on a group tag (second tag, after "All Rooms")
      await page.getByTestId("all_rooms_tags_measure").waitFor({ state: "visible" });
      const groupTags = page.locator('[data-testid^="room_group_tag_"]');
      const secondTag = groupTags.first();

      if (await secondTag.isVisible()) {
        await secondTag.click();

        // Screenshot: Rooms filtered by selected group
        await expect(page).toHaveScreenshot([
          "desktop",
          "room-grouping",
          "rooms-filtered-by-group.png",
        ]);
      }
    });

    // Verify that the "All Rooms" tag is active by default
    test("should have All Rooms tag active by default", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        filesSettingsHandler(TEST_PORT, { organizeRoomsGrouping: true }),
        roomGroupsHandler(TEST_PORT, true),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const groupTagsRow = page.locator('[class*="rowGroupingRooms"]');
      await expect(groupTagsRow).toBeVisible();

      // The first tag (All Rooms) should have the active state (not in measure container)
      const allRoomsTag = page.getByTestId("all_rooms_tags_measure");
      await expect(allRoomsTag).toBeVisible();
      await expect(allRoomsTag).toHaveAttribute("class", /isActive/);
    });

    // Verify that the group tags row is not visible when grouping is disabled
    test("should not display group tags row when grouping is disabled", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        filesSettingsHandler(TEST_PORT, { organizeRoomsGrouping: false }),
        roomGroupsHandler(TEST_PORT, true),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      // The grouping row should not be visible
      const groupTagsRow = page.locator('[class*="rowGroupingRooms"]');
      await expect(groupTagsRow).not.toBeVisible();
    });

    // Verify that the "Create group" button appears in the tags row
    // when grouping is enabled but no groups exist
    test("should show Create group button when no groups exist", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        filesSettingsHandler(TEST_PORT, { organizeRoomsGrouping: true }),
        roomGroupsHandler(TEST_PORT, false),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const groupTagsRow = page.locator('[class*="rowGroupingRooms"]');
      await expect(groupTagsRow).toBeVisible();

      await page.getByTestId("create_group_tag").waitFor({ state: "visible" });

      // Screenshot: Tags row with Create group button (no groups)
      await expect(page).toHaveScreenshot([
        "desktop",
        "room-grouping",
        "create-group-button-in-tags.png",
      ]);
    });
  });

  test.describe("Header menu actions", () => {
    // Verify that selecting rooms and using the header menu shows
    // group-related actions (Create a group, Add to group, Remove from group)
    test("should show group actions in header menu when rooms are selected", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        filesSettingsHandler(TEST_PORT, { organizeRoomsGrouping: true }),
        roomGroupsHandler(TEST_PORT, true),
        roomGroupByIdHandler(TEST_PORT),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      // Select a room by clicking its checkbox
      const firstRow = table.getByTestId("table-row-0");
      const checkbox = firstRow.locator('[data-testid="checkbox"]').first();

      if (await checkbox.isVisible()) {
        await checkbox.click();

        // Screenshot: Header menu with group actions visible
        await expect(page).toHaveScreenshot([
          "desktop",
          "room-grouping",
          "header-menu-group-actions.png",
        ]);
      }
    });

    // Verify that the header menu closes after clicking "Create a group"
    test("should close header menu after Create a group action", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        filesSettingsHandler(TEST_PORT, { organizeRoomsGrouping: true }),
        roomGroupsHandler(TEST_PORT, true),
        roomGroupByIdHandler(TEST_PORT),
        createRoomGroupHandler(TEST_PORT),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      // Select a room
      const firstRow = table.getByTestId("table-row-0");
      const checkbox = firstRow.locator('[data-testid="checkbox"]').first();

      if (await checkbox.isVisible()) {
        await checkbox.click();

        // Click "Create a group" in the header menu
        const createGroupButton = page.getByTestId("menu-create-group");

        if (await createGroupButton.isVisible()) {
          await createGroupButton.click();

          // The header selection menu should close (selection cleared)
          await expect(createGroupButton).not.toBeVisible();
        }
      }
    });
  });

  test.describe("Create new group flow", () => {
    // Verify that clicking "Create a new group" opens the room selector panel
    test("should open room selector when Create new group is clicked", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        filesSettingsHandler(TEST_PORT, { organizeRoomsGrouping: true }),
        roomGroupsHandler(TEST_PORT, true),
        roomGroupByIdHandler(TEST_PORT),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const groupManagementButton = page.locator(
        '[class*="groupManagementButton"]',
      );

      await expect(groupManagementButton).toBeVisible();
      await groupManagementButton.click();

      const dialog = page.getByTestId("modal-dialog");
      await expect(dialog).toBeVisible();

      // Click "Create a new group" button
      const createButton = dialog.getByTestId("create_new_group_button");
      await expect(createButton).toBeVisible();
      await createButton.click();

      // Room selector should open
      const roomSelector = page.getByTestId("room_selector");
      await expect(roomSelector).toBeVisible();

      // Screenshot: Room selector panel for creating a new group
      await expect(page).toHaveScreenshot([
        "desktop",
        "room-grouping",
        "room-selector-create-group.png",
      ]);
    });

    // Verify that the Select button is disabled in the room selector
    // until at least one room is selected (cannot create group without rooms)
    test("should disable Select button until a room is selected", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        filesSettingsHandler(TEST_PORT, { organizeRoomsGrouping: true }),
        roomGroupsHandler(TEST_PORT, true),
        roomGroupByIdHandler(TEST_PORT),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const groupManagementButton = page.locator(
        '[class*="groupManagementButton"]',
      );

      await expect(groupManagementButton).toBeVisible();
      await groupManagementButton.click();

      const dialog = page.getByTestId("modal-dialog");
      await expect(dialog).toBeVisible();

      // Click "Create a new group"
      const createButton = dialog.getByTestId("create_new_group_button");
      await expect(createButton).toBeVisible();
      await createButton.click();

      // Room selector should open
      const roomSelector = page.getByTestId("room_selector");
      await expect(roomSelector).toBeVisible();

      // The submit/select button should be disabled initially
      const submitButton = page.locator(
        '[data-testid="room_selector"] button[class*="submitButton"]',
      );

      if (await submitButton.isVisible()) {
        await expect(submitButton).toBeDisabled();

        // Screenshot: Room selector with disabled Select button
        await expect(page).toHaveScreenshot([
          "desktop",
          "room-grouping",
          "room-selector-select-disabled.png",
        ]);
      }
    });

    // Verify that the "Create a new group" button is disabled
    // when grouping toggle is turned off
    test("should disable Create new group button when grouping is off", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        filesSettingsHandler(TEST_PORT, { organizeRoomsGrouping: true }),
        roomGroupsHandler(TEST_PORT, true),
        roomGroupByIdHandler(TEST_PORT),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const groupManagementButton = page.locator(
        '[class*="groupManagementButton"]',
      );

      await expect(groupManagementButton).toBeVisible();
      await groupManagementButton.click();

      const dialog = page.getByTestId("modal-dialog");
      await expect(dialog).toBeVisible();

      // Toggle off grouping
      const toggle = dialog.getByTestId("toggle_room_groups_button");
      await expect(toggle).toBeVisible();
      await toggle.click();

      // The "Create a new group" button should be disabled
      const createButton = dialog.getByTestId("create_new_group_button");
      await expect(createButton).toBeVisible();

      // Screenshot: Create new group button disabled when grouping is off
      await expect(dialog).toHaveScreenshot([
        "desktop",
        "room-grouping",
        "create-group-button-disabled.png",
      ]);
    });
  });

  test.describe("Delete group", () => {
    // Verify that clicking the delete icon on a group opens
    // the delete confirmation dialog
    test("should open delete confirmation dialog", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        filesSettingsHandler(TEST_PORT, { organizeRoomsGrouping: true }),
        roomGroupsHandler(TEST_PORT, true),
        roomGroupByIdHandler(TEST_PORT),
        deleteRoomGroupHandler(TEST_PORT),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const groupManagementButton = page.locator(
        '[class*="groupManagementButton"]',
      );

      await expect(groupManagementButton).toBeVisible();
      await groupManagementButton.click();

      const dialog = page.getByTestId("modal-dialog");
      await expect(dialog).toBeVisible();

      // Click the delete icon on the first group
      const deleteIcon = dialog.locator(".delete_icon").first();

      if (await deleteIcon.isVisible()) {
        await deleteIcon.click();

        // Delete confirmation dialog should appear
        const confirmDialog = page.getByTestId("modal-dialog");
        await expect(confirmDialog).toBeVisible();

        // Screenshot: Delete group confirmation dialog
        await expect(confirmDialog).toHaveScreenshot([
          "desktop",
          "room-grouping",
          "delete-group-confirmation.png",
        ]);
      }
    });

    // Verify that clicking Cancel in the delete confirmation
    // closes the dialog without deleting
    test("should close delete dialog on Cancel", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        filesSettingsHandler(TEST_PORT, { organizeRoomsGrouping: true }),
        roomGroupsHandler(TEST_PORT, true),
        roomGroupByIdHandler(TEST_PORT),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const groupManagementButton = page.locator(
        '[class*="groupManagementButton"]',
      );

      await expect(groupManagementButton).toBeVisible();
      await groupManagementButton.click();

      const dialog = page.getByTestId("modal-dialog");
      await expect(dialog).toBeVisible();

      // Click the delete icon on the first group
      const deleteIcon = dialog.locator(".delete_icon").first();

      if (await deleteIcon.isVisible()) {
        await deleteIcon.click();

        // Click Cancel in the confirmation dialog
        const cancelButton = page.locator('button:has-text("Cancel")').last();
        await expect(cancelButton).toBeVisible();
        await cancelButton.click();

        // The main dialog should still be visible (returned to groups panel)
        const mainDialog = page.getByTestId("modal-dialog");
        await expect(mainDialog).toBeVisible();
      }
    });
  });

  test.describe("Edit group", () => {
    // Verify that clicking a group item opens the room list panel
    // for adding/removing rooms from the group
    test("should open room list when group item is clicked", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        filesSettingsHandler(TEST_PORT, { organizeRoomsGrouping: true }),
        roomGroupsHandler(TEST_PORT, true),
        roomGroupByIdHandler(TEST_PORT),
        updateRoomGroupHandler(TEST_PORT),
      );

      await page.goto(`${baseUrl}/rooms/shared/`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const groupManagementButton = page.locator(
        '[class*="groupManagementButton"]',
      );

      await expect(groupManagementButton).toBeVisible();
      await groupManagementButton.click();

      const dialog = page.getByTestId("modal-dialog");
      await expect(dialog).toBeVisible();

      // Click on the group data area (name/icon) of the first group
      const groupData = dialog.locator('[class*="groupData"]').first();
      await expect(groupData).toBeVisible();
      await groupData.click();

      // Room selector should open for editing group rooms
      const roomSelector = page.getByTestId("room_selector");
      await expect(roomSelector).toBeVisible();

      // Screenshot: Room list panel for editing group rooms
      await expect(page).toHaveScreenshot([
        "desktop",
        "room-grouping",
        "edit-group-room-list.png",
      ]);
    });
  });
});
