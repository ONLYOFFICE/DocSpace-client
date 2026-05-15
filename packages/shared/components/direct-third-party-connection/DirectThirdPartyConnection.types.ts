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

import type {
	Nullable,
	ThirdPartyAccountType,
	ConnectedThirdPartyAccountType,
	TTranslation,
} from "../../types";
import type { ButtonSize } from "@docspace/ui-kit/components/button";
import type {
	FileInfoType,
	FilesSelectorSettings,
} from "../files-selector-input/FilesSelectorInput.types";
import type { TThirdParties } from "../../api/files/types";
import type { TBreadCrumb } from "@docspace/ui-kit/components/selector";

export type DirectThirdPartyConnectionState = {
	// folderList: {};
	isLoading: boolean;
	isInitialLoading: boolean;
	isUpdatingInfo: boolean;
};

export interface DirectThirdPartyConnectionProps {
	className?: string;
	openConnectWindow: (
		serviceName: string,
		modal: Window | null,
	) => Promise<Window | null>;

	connectDialogVisible: boolean;
	deleteThirdPartyDialogVisible: boolean;
	connectedThirdPartyAccount: Nullable<ConnectedThirdPartyAccountType>;
	setConnectDialogVisible: (visible: boolean) => void;
	setDeleteThirdPartyDialogVisible: (visible: boolean) => void;
	clearLocalStorage: VoidFunction;
	setSelectedThirdPartyAccount: (
		elem: Nullable<Partial<ThirdPartyAccountType>>,
	) => void;
	isTheSameThirdPartyAccount: boolean;
	selectedThirdPartyAccount: Nullable<ThirdPartyAccountType>;
	accounts: ThirdPartyAccountType[];
	setThirdPartyAccountsInfo: (t: TTranslation) => Promise<void>;

	// DeleteThirdPartyDialog
	deleteThirdParty: (id: string) => Promise<void>;
	setConnectedThirdPartyAccount: (
		account: Nullable<ConnectedThirdPartyAccountType>,
	) => void;
	setThirdPartyProviders: (providers: TThirdParties) => void;

	providers: TThirdParties;
	removeItem: ThirdPartyAccountType;
	// FilesSelectorInput
	newPath: string;
	basePath: string;
	isErrorPath: boolean;
	filesSelectorSettings: FilesSelectorSettings;
	setBasePath: (folders: TBreadCrumb[]) => void;
	toDefault: VoidFunction;
	setNewPath: (folders: TBreadCrumb[], fileName?: string) => void;

	setDefaultFolderId?: (id: string | number | null) => void;
	// other

	isError?: boolean;
	isSelect?: boolean;
	id?: string | number;
	isDisabled?: boolean;
	filterParam?: string;
	isMobileScale?: boolean;
	buttonSize?: ButtonSize;
	isSelectFolder?: boolean;
	descriptionText?: string;
	withoutInitPath?: boolean;
	onSelectFolder?: (
		value: number | string | undefined,
		breadCrumbs?: TBreadCrumb,
	) => void;
	onSelectFile?: (fileInfo: FileInfoType, breadCrumbs?: TBreadCrumb[]) => void;
	checkCreating?: boolean;
	dataTestId?: string;
}
