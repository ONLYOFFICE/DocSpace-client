// (c) Copyright Ascensio System SIA 2009-2024
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

import { Page, Locator } from "@playwright/test";

export abstract class BaseSelectorPage {
  constructor(protected page: Page) {}

  get header(): Locator {
    return this.page.locator('[data-testid="selector-header"]');
  }

  get breadcrumbs(): Locator {
    return this.page.locator('[data-testid="selector-breadcrumbs"]');
  }

  get searchInput(): Locator {
    return this.page.locator('[data-testid="selector-search-input"]');
  }

  get acceptButton(): Locator {
    return this.page.locator('[data-testid="selector-accept-button"]');
  }

  get cancelButton(): Locator {
    return this.page.locator('[data-testid="selector-cancel-button"]');
  }

  get emptyFolderMessage(): Locator {
    return this.page.locator('[data-testid="empty-folder-message"]');
  }

  get loadingSpinner(): Locator {
    return this.page.locator('[data-testid="loading-spinner"]');
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState("networkidle");
    await this.acceptButton.waitFor({ state: "visible" });
  }

  private async ensureSelectorLoaded(): Promise<void> {
    await this.acceptButton.waitFor({ state: "attached" });
  }

  async hasHeader(): Promise<boolean> {
    await this.ensureSelectorLoaded();
    try {
      return await this.header.isVisible();
    } catch {
      return false;
    }
  }

  async hasBreadcrumbs(): Promise<boolean> {
    await this.ensureSelectorLoaded();
    try {
      return await this.breadcrumbs.isVisible();
    } catch {
      return false;
    }
  }

  async hasSearch(): Promise<boolean> {
    await this.ensureSelectorLoaded();
    try {
      return await this.searchInput.isVisible();
    } catch {
      return false;
    }
  }

  async hasCancelButton(): Promise<boolean> {
    await this.ensureSelectorLoaded();
    try {
      return await this.cancelButton.isVisible();
    } catch {
      return false;
    }
  }

  async clickAccept(): Promise<void> {
    await this.acceptButton.click();
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.page.keyboard.press("Enter");
  }

  async getAcceptButtonText(): Promise<string | null> {
    await this.ensureSelectorLoaded();
    await this.acceptButton.waitFor({ state: "visible" });
    return this.acceptButton.textContent();
  }

  async getCancelButtonText(): Promise<string | null> {
    await this.ensureSelectorLoaded();
    await this.cancelButton.waitFor({ state: "visible" });
    return this.cancelButton.textContent();
  }

  async waitForLoadingComplete(): Promise<void> {
    await this.loadingSpinner.waitFor({ state: "hidden" });
  }
}

export class FileSelectorPage extends BaseSelectorPage {
  get fileList(): Locator {
    return this.page.locator('[data-testid="file-list"]');
  }

  get fileItems(): Locator {
    return this.page.locator('[data-testid="file-item"]');
  }

  get folderItems(): Locator {
    return this.page.locator('[data-testid="folder-item"]');
  }

  get fileItem(): (name: string) => Locator {
    return (name: string) =>
      this.page.locator(`[data-testid="file-item"][data-name="${name}"]`);
  }

  get folderItem(): (name: string) => Locator {
    return (name: string) =>
      this.page.locator(`[data-testid="folder-item"][data-name="${name}"]`);
  }

  get selectedItems(): Locator {
    return this.page.locator('[data-testid="file-item"][data-selected="true"]');
  }

  get fileTypeFilter(): Locator {
    return this.page.locator('[data-testid="file-type-filter"]');
  }

  get viewSwitcher(): Locator {
    return this.page.locator('[data-testid="view-switcher"]');
  }

  get sortButton(): Locator {
    return this.page.locator('[data-testid="sort-button"]');
  }

  async getFileCount(): Promise<number> {
    return this.fileItems.count();
  }

  async getFolderCount(): Promise<number> {
    return this.folderItems.count();
  }

  async getSelectedCount(): Promise<number> {
    return this.selectedItems.count();
  }

  async selectFile(name: string): Promise<void> {
    await this.fileItem(name).click();
  }

  async selectFolder(name: string): Promise<void> {
    await this.folderItem(name).click();
  }

  async openFolder(name: string): Promise<void> {
    await this.folderItem(name).dblclick();
  }

  async hasFile(name: string): Promise<boolean> {
    return this.fileItem(name).isVisible();
  }

  async hasFolder(name: string): Promise<boolean> {
    return this.folderItem(name).isVisible();
  }

  async filterByType(type: string): Promise<void> {
    await this.fileTypeFilter.selectOption(type);
  }

  async switchView(view: "list" | "grid"): Promise<void> {
    await this.viewSwitcher.click();
    await this.page.locator(`[data-view="${view}"]`).click();
  }

  async sortBy(field: string): Promise<void> {
    await this.sortButton.click();
    await this.page.locator(`[data-sort-field="${field}"]`).click();
  }

  async navigateUpBreadcrumb(level: number): Promise<void> {
    const breadcrumb = this.page.locator(
      `[data-testid="breadcrumb-item"]:nth-child(${level})`,
    );
    await breadcrumb.click();
  }

  async isEmptyFolder(): Promise<boolean> {
    return this.emptyFolderMessage.isVisible();
  }

  async getAllFileNames(): Promise<string[]> {
    const elements = await this.fileItems.all();
    const names = await Promise.all(
      elements.map((el) => el.getAttribute("data-name")),
    );
    return names.filter((name): name is string => name !== null);
  }

  async getAllFolderNames(): Promise<string[]> {
    const elements = await this.folderItems.all();
    const names = await Promise.all(
      elements.map((el) => el.getAttribute("data-name")),
    );
    return names.filter((name): name is string => name !== null);
  }
}

export class RoomSelectorPage extends BaseSelectorPage {
  get roomList(): Locator {
    return this.page.locator('[data-testid="room-list"]');
  }

  get roomItems(): Locator {
    return this.page.locator('[data-testid="room-item"]');
  }

  get roomItem(): (name: string) => Locator {
    return (name: string) =>
      this.page.locator(`[data-testid="room-item"][data-name="${name}"]`);
  }

  get selectedRoom(): Locator {
    return this.page.locator('[data-testid="room-item"][data-selected="true"]');
  }

  get roomTypeFilter(): Locator {
    return this.page.locator('[data-testid="room-type-filter"]');
  }

  get createRoomButton(): Locator {
    return this.page.locator('[data-testid="create-room-button"]');
  }

  async getRoomCount(): Promise<number> {
    return this.roomItems.count();
  }

  async selectRoom(name: string): Promise<void> {
    await this.roomItem(name).click();
  }

  async hasRoom(name: string): Promise<boolean> {
    return this.roomItem(name).isVisible();
  }

  async getSelectedRoomName(): Promise<string | null> {
    return this.selectedRoom.getAttribute("data-name");
  }

  async filterByRoomType(type: string): Promise<void> {
    await this.roomTypeFilter.selectOption(type);
  }

  async clickCreateRoom(): Promise<void> {
    await this.createRoomButton.click();
  }

  async getAllRoomNames(): Promise<string[]> {
    const elements = await this.roomItems.all();
    const names = await Promise.all(
      elements.map((el) => el.getAttribute("data-name")),
    );
    return names.filter((name): name is string => name !== null);
  }

  async searchRooms(query: string): Promise<void> {
    await this.search(query);
    await this.waitForLoadingComplete();
  }

  async hasCreateRoomButton(): Promise<boolean> {
    return this.createRoomButton.isVisible();
  }
}
