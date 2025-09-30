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

export const FILE_SELECTOR_CONFIGS = {
  basicVisibility: {
    default: {},
    noHeader: { withoutHeader: true },
    noBreadcrumbs: { withoutBreadcrumbs: true },
    noSearch: { withoutSearch: true },
    withoutCancelButton: { withoutCancelButton: true },
  },
  acceptButtonText: [
    { value: "Select", label: "Custom Text" },
    { value: "Choose File", label: "Alternative Text" },
    { value: "OK", label: "Short Text" },
  ],
  cancelButtonText: [
    { value: "Close", label: "Custom Cancel" },
    { value: "Back", label: "Alternative Cancel" },
    { value: "Dismiss", label: "Alternative Cancel 2" },
  ],
  rootSelection: {
    myDocuments: { rootThirdPartyId: "my-documents" },
    sharedWithMe: { rootThirdPartyId: "shared-with-me" },
    common: { rootThirdPartyId: "common" },
    favorites: { rootThirdPartyId: "favorites" },
    recent: { rootThirdPartyId: "recent" },
    trash: { rootThirdPartyId: "trash" },
  },
  filterConfigs: {
    documentsOnly: { filterParam: "Documents" },
    presentationsOnly: { filterParam: "Presentations" },
    spreadsheetsOnly: { filterParam: "Spreadsheets" },
    imagesOnly: { filterParam: "Images" },
    mediaOnly: { filterParam: "Media" },
    archivesOnly: { filterParam: "Archives" },
    allFiles: { filterParam: "AllFiles" },
  },
  multipleSelection: {
    enabled: { isMultipleSelection: true },
    disabled: { isMultipleSelection: false },
  },
  descriptionVisibility: {
    noDescription: { withoutImmediatelyClose: true },
    withDescription: {},
  },
};

export const ROOM_SELECTOR_CONFIGS = {
  basicVisibility: {
    default: {},
    noHeader: { withoutHeader: true },
    noBreadcrumbs: { withoutBreadcrumbs: true },
    noSearch: { withoutSearch: true },
    withoutCancelButton: { withoutCancelButton: true },
  },
  acceptButtonText: [
    { value: "Select Room", label: "Custom Text" },
    { value: "Choose", label: "Short Text" },
    { value: "Confirm", label: "Alternative Text" },
  ],
  cancelButtonText: [
    { value: "Close", label: "Custom Cancel" },
    { value: "Back", label: "Alternative Cancel" },
    { value: "Exit", label: "Alternative Cancel 2" },
  ],
  roomTypeFilters: {
    allRooms: { roomType: "all" },
    fillingRooms: { roomType: "filling" },
    collaborationRooms: { roomType: "collaboration" },
    customRooms: { roomType: "custom" },
    publicRooms: { roomType: "public" },
  },
  descriptionVisibility: {
    noDescription: { withoutImmediatelyClose: true },
    withDescription: {},
  },
};

export const COMMON_MOCK_HEADERS = [
  "common/images/logo.ashx",
  "common/images/logo-icon-non-letter.svg",
  "common/images/logo-icon-letter.svg",
  "common/images/logo.svg",
  "common/images/logo-text.svg",
  "common/images/logo-docs.svg",
  "common/images/logo-docs-text.svg",
  "common/images/logo/aboutpage.svg",
  "common/images/logo/leftmenu.svg",
  "common/images/logo/lightsmall.svg",
  "common/images/logo/docseditor.svg",
  "common/images/logo/docseditorembed.svg",
  "common/images/logo/loginpage.svg",
  "common/images/logo/darksmall.svg",
  "common/images/logo/favicon.ico",
  "build/deploy/frontend/DocEditor.config.json",
  "build/deploy/public/logo.png",
];

export function generateParameterCombinations<T extends Record<string, any>>(
  configs: T[],
): T[] {
  return configs;
}

export function mergeParams(
  ...params: Array<Record<string, any>>
): Record<string, any> {
  return Object.assign({}, ...params);
}

export class FileSelectorTestDataBuilder {
  private params: Record<string, any> = {};

  withoutHeader(): this {
    this.params.withoutHeader = true;
    return this;
  }

  withoutBreadcrumbs(): this {
    this.params.withoutBreadcrumbs = true;
    return this;
  }

  withoutSearch(): this {
    this.params.withoutSearch = true;
    return this;
  }

  withoutCancelButton(): this {
    this.params.withoutCancelButton = true;
    return this;
  }

  withAcceptButtonText(text: string): this {
    this.params.acceptButtonText = text;
    return this;
  }

  withCancelButtonText(text: string): this {
    this.params.cancelButtonText = text;
    return this;
  }

  withRootId(id: string): this {
    this.params.rootThirdPartyId = id;
    return this;
  }

  withFilter(filter: string): this {
    this.params.filterParam = filter;
    return this;
  }

  withMultipleSelection(enabled: boolean): this {
    this.params.isMultipleSelection = enabled;
    return this;
  }

  withoutImmediatelyClose(): this {
    this.params.withoutImmediatelyClose = true;
    return this;
  }

  build(): Record<string, any> {
    return { ...this.params };
  }
}

export class RoomSelectorTestDataBuilder {
  private params: Record<string, any> = {};

  withoutHeader(): this {
    this.params.withoutHeader = true;
    return this;
  }

  withoutBreadcrumbs(): this {
    this.params.withoutBreadcrumbs = true;
    return this;
  }

  withoutSearch(): this {
    this.params.withoutSearch = true;
    return this;
  }

  withoutCancelButton(): this {
    this.params.withoutCancelButton = true;
    return this;
  }

  withAcceptButtonText(text: string): this {
    this.params.acceptButtonText = text;
    return this;
  }

  withCancelButtonText(text: string): this {
    this.params.cancelButtonText = text;
    return this;
  }

  withRoomType(type: string): this {
    this.params.roomType = type;
    return this;
  }

  withoutImmediatelyClose(): this {
    this.params.withoutImmediatelyClose = true;
    return this;
  }

  build(): Record<string, any> {
    return { ...this.params };
  }
}
