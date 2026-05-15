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
import React from "react";
import { useTranslation } from "react-i18next";

import InfoIcon from "PUBLIC_DIR/images/info.outline.react.svg?url";

import FilesSelectorWrapper from "@docspace/ui-kit/selectors/Files";
import type { SdkFolderType } from "@docspace/ui-kit/selectors/Files/FilesSelector.types";
import { RoomsType } from "@docspace/shared/enums";
import { useSelectorInfoBar } from "@docspace/shared/hooks/useSelectorInfoBar";
import {
	TInfoBarData,
	TSelectorCancelButton,
} from "@docspace/ui-kit/components/selector";

import { StartFillingSelectorDialogProps } from "@/types";
import useDeviceType from "@/hooks/useDeviceType";

function StartFillingSelectorDialog({
	fileInfo,
	getIsDisabled,
	isVisible,
	onClose,
	onSubmit,
	filesSettings,
	header,
	createDefineRoomType,
}: StartFillingSelectorDialogProps) {
	const { t } = useTranslation(["Common", "Editor"]);
	const [withInfoBar, onCloseInfoBar] = useSelectorInfoBar();
	const { currentDeviceType } = useDeviceType();

	const cancelButtonProps: TSelectorCancelButton = {
		withCancelButton: true,
		onCancel: onClose,
		cancelButtonLabel: t("Common:CancelButton"),
		cancelButtonId: "select-file-modal-cancel",
	};
	const infoBarData: TInfoBarData = {
		title: t("Common:SelectorInfoBarTitle"),
		description:
			createDefineRoomType === RoomsType.FormRoom
				? t("Common:SelectorInfoBarDescription")
				: t("Common:SelectorInfoBarOfVDRDescription"),
		icon: InfoIcon,
		onClose: onCloseInfoBar,
	};

	const createDefineRoomLabels: Partial<Record<RoomsType, string>> = {
		[RoomsType.VirtualDataRoom]: t("Common:CreateVirtualDataRoom"),
		[RoomsType.FormRoom]: t("Common:CreateFormFillingRoom"),
	};

	return (
		<FilesSelectorWrapper
			withCreate
			withHeader
			headerProps={header}
			withSearch
			isRoomsOnly
			withBreadCrumbs
			withoutBackButton={false}
			currentFolderId=""
			rootFolderType={fileInfo.rootFolderType as SdkFolderType}
			createDefineRoomLabel={createDefineRoomLabels[createDefineRoomType]}
			createDefineRoomType={createDefineRoomType}
			isPanelVisible={isVisible}
			filesSettings={filesSettings}
			currentDeviceType={currentDeviceType}
			submitButtonLabel={t("Common:CopyHere")}
			onSubmit={onSubmit}
			getIsDisabled={getIsDisabled}
			{...cancelButtonProps}
			disabledItems={[]}
			descriptionText=""
			footerInputHeader=""
			footerCheckboxLabel=""
			currentFooterInputValue=""
			getFilesArchiveError={() => ""}
			embedded={false}
			isThirdParty={false}
			withFooterCheckbox={false}
			withFooterInput={false}
			withInfoBar={withInfoBar}
			infoBarData={infoBarData}
		/>
	);
}

export default StartFillingSelectorDialog;
