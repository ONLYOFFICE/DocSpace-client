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

import {
	TFile,
	TFilesSettings,
	TFolder,
} from "@docspace/shared/api/files/types";
import {
	TBreadCrumb,
	TSelectorHeader,
	TSelectorItem,
} from "@docspace/ui-kit/components/selector";
import { DeviceType, FolderType } from "@docspace/shared/enums";
import { TTheme } from "@docspace/ui-kit/providers/theme/themes";

export type FilesSelectorProps = TSelectorHeader & {
	isPanelVisible: boolean;
	// withoutImmediatelyClose: boolean;
	isThirdParty: boolean;
	isSelectFolder: boolean;
	rootThirdPartyId?: string;
	isRoomsOnly: boolean;
	isUserOnly: boolean;
	isRoomBackup: boolean;
	isEditorDialog: boolean;
	currentDeviceType: DeviceType;
	setMoveToPublicRoomVisible: (visible: boolean, operationData: object) => void;
	setBackupToPublicRoomVisible: (visible: boolean, data: object) => void;
	getIcon: (size: number, fileExst: string) => string;

	onClose?: () => void;

	id?: string | number;
	withSearch: boolean;
	withBreadCrumbs: boolean;
	withSubtitle: boolean;
	withPadding?: boolean;

	isMove?: boolean;
	isCopy?: boolean;
	isRestore: boolean;
	isTemplate: boolean;
	isRestoreAll?: boolean;
	isSelect?: boolean;
	isFormRoom?: boolean;

	filterParam?: string;

	currentFolderId: number | string;
	fromFolderId?: number;
	parentId: number;
	rootFolderType: number;
	folderIsShared?: boolean;

	treeFolders?: TFolder[];
	withRecentTreeFolder?: boolean;
	withFavoritesTreeFolder?: boolean;
	withAIAgentsTreeFolder?: boolean;

	theme: TTheme;

	selection: (TFolder | TFile)[];
	disabledItems: string[] | number[];
	disabledFolderType?: FolderType;
	setMoveToPanelVisible: (value: boolean) => void;
	setRestorePanelVisible: (value: boolean) => void;
	setCopyPanelVisible: (value: boolean) => void;
	setRestoreAllPanelVisible: (value: boolean) => void;
	setIsDataReady?: (value: boolean) => void;
	setSelected: (selected: "close" | "none", clearBuffer?: boolean) => void;
	setConflictDialogData: (conflicts: unknown, operationData: unknown) => void;
	itemOperationToFolder: (operationData: unknown) => Promise<void>;
	clearActiveOperations: (
		folderIds: string[] | number[],
		fileIds: string[] | number[],
	) => void;
	checkFileConflicts: (
		selectedItemId: string | number | undefined,
		folderIds: string[] | number[],
		fileIds: string[] | number[],
	) => Promise<unknown>;

	onSetBaseFolderPath?: (
		value: number | string | undefined | TBreadCrumb[],
	) => void;
	onSetNewFolderPath?: (value: number | string | undefined) => void;
	onSelectFolder?: (
		value: number | string | undefined,
		breadCrumbs: TBreadCrumb[],
	) => void;
	onSelectTreeNode?: (treeNode: TFolder) => void;
	onSave?: (
		e: unknown,
		folderId: string | number,
		fileTitle: string,
		openNewTab: boolean,
	) => void;
	onSelectFile?: (
		fileInfo:
			| {
					id: string | number;
					title: string;
					path?: string[];
					fileExst?: string;
					inPublic?: boolean;
			  }
			| TSelectorItem[],
		breadCrumbs?: TBreadCrumb[],
	) => void;

	setInfoPanelIsMobileHidden: (arg: boolean) => void;

	withFooterInput: boolean;
	withFooterCheckbox: boolean;
	footerInputHeader?: string;
	currentFooterInputValue?: string;
	footerCheckboxLabel?: string;

	descriptionText?: string;
	setSelectedItems: () => void;

	includeFolder?: boolean;

	embedded: boolean;
	withHeader: boolean;
	withCancelButton: boolean;
	cancelButtonLabel: string;
	acceptButtonLabel: string;
	settings: unknown;

	roomsFolderId?: number;
	openRoot?: boolean;

	filesSettings: TFilesSettings;

	withCreate?: boolean;
	checkCreating?: boolean;
	isPortalView?: boolean;
	withoutDescriptionText?: boolean;

	isMultiSelect?: boolean;
	maxSelectedItems?: number;

	disableBySecurity?: string;
};
