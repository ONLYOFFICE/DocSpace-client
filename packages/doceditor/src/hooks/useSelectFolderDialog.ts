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

"use client";

import React, { useState, useCallback } from "react";

import { EDITOR_ID } from "@docspace/shared/constants";
import { TBreadCrumb } from "@docspace/ui-kit/components/selector";
import {
	TFileSecurity,
	TFolderSecurity,
} from "@docspace/shared/api/files/types";
import { TRoomSecurity } from "@docspace/shared/api/rooms/types";
import { TSelectedFileInfo } from "@docspace/ui-kit/selectors/Files/FilesSelector.types";

import { TEventData } from "@/types";
import { saveAs } from "@/utils";

const useSelectFolderDialog = () => {
	const [isVisible, setIsVisible] = useState(false);
	const [title, setTitle] = useState("");
	const [url, setUrl] = useState("");
	const [extension, setExtension] = useState("");

	const requestRunning = React.useRef(false);

	const onSDKRequestSaveAs = useCallback((event: object) => {
		if ("data" in event) {
			const data = event.data as TEventData;

			setTitle(data.title ?? "");
			setUrl(data.url ?? "");
			setExtension(data.fileType ?? "");

			setIsVisible(true);
		}
	}, []);

	const onClose = () => {
		if (requestRunning.current) return;
		setIsVisible(false);
	};

	const onSubmit = async (
		selectedItemId: string | number | undefined,
		folderTitle: string,
		isPublic: boolean,
		breadCrumbs: TBreadCrumb[],
		fileName: string,
		isChecked: boolean,
	) => {
		if (!selectedItemId || requestRunning.current) return;
		requestRunning.current = true;

		const currentExst = fileName.split(".").pop();

		const newTitle =
			currentExst !== extension ? fileName.concat(`.${extension}`) : fileName;

		if (isChecked) {
			saveAs(newTitle, url, selectedItemId, isChecked);
		} else {
			const savingInfo = await saveAs(newTitle, url, selectedItemId, isChecked);

			if (savingInfo) {
				const docEditor =
					typeof window !== "undefined" &&
					window.DocEditor?.instances[EDITOR_ID];

				const convertedInfo = savingInfo.split(": ").pop();

				docEditor?.showMessage(convertedInfo);
			}
		}
		requestRunning.current = false;
		onClose();
	};

	const getIsDisabled = (
		isFirstLoad: boolean,
		isSelectedParentFolder: boolean,
		selectedItemId: string | number | undefined,
		selectedItemType: "rooms" | "files" | "agents" | undefined,
		isRoot: boolean,
		selectedItemSecurity:
			| TFileSecurity
			| TFolderSecurity
			| TRoomSecurity
			| undefined,
		selectedFileInfo: TSelectedFileInfo,
		isDisabledFolder?: boolean,
		isInsideKnowledge?: boolean,
		isInsideResultStorage?: boolean,
	) => {
		if (isFirstLoad) return true;
		if (requestRunning.current) return true;
		if (selectedFileInfo) return true;

		if (selectedItemType === "agents") return true;
		if (isInsideResultStorage) return true;

		if (!selectedItemSecurity) return false;

		if ("Create" in selectedItemSecurity && !selectedItemSecurity.Create)
			return true;

		return "CopyTo" in selectedItemSecurity
			? !selectedItemSecurity?.CopyTo
			: !selectedItemSecurity.Copy;
	};

	return {
		onSDKRequestSaveAs,
		onSubmitSelectFolderDialog: onSubmit,
		onCloseSelectFolderDialog: onClose,
		getIsDisabledSelectFolderDialog: getIsDisabled,
		isVisibleSelectFolderDialog: isVisible,
		titleSelectorFolderDialog: title,
		extensionSelectorFolderDialog: extension,
	};
};

export default useSelectFolderDialog;
