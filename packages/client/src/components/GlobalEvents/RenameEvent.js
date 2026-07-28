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
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { toastr } from "@docspace/ui-kit/components/toast";
import { getTitleWithoutExtension } from "@docspace/shared/utils";
import Dialog from "./sub-components/Dialog";

const RenameEvent = ({
	type,
	item,
	onClose,

	addActiveItems,

	updateFile,
	renameFolder,

	completeAction,
	clearActiveOperations,

	setEventDialogVisible,
	eventDialogVisible,
}) => {
	const [startValue, setStartValue] = React.useState("");

	const { t } = useTranslation(["Files"]);

	const onCancel = React.useCallback(
		(e) => {
			onClose && onClose(e);
			setEventDialogVisible(false);
		},
		[onClose, setEventDialogVisible],
	);

	React.useEffect(() => {
		setStartValue(getTitleWithoutExtension(item, false));

		setEventDialogVisible(true);
	}, [item]);

	const onUpdate = React.useCallback(
		async (e, value) => {
			const originalTitle = getTitleWithoutExtension(item);

			let timerId;

			const isSameTitle =
				originalTitle.trim() === value.trim() || value.trim() === "";

			const isFile = item.fileExst || item.contentLength;

			if (isSameTitle) {
				setStartValue(originalTitle);

				onCancel();

				return completeAction(item, type);
			}
			timerId = setTimeout(() => {
				isFile ? addActiveItems([item.id]) : addActiveItems(null, [item.id]);
			}, 500);

			isFile
				? await updateFile(item.id, value)
						.then(() => completeAction(item, type))
						.then(() =>
							toastr.success(
								t("FileRenamed", {
									oldTitle: item.title,
									newTitle: value + item.fileExst,
								}),
							),
						)
						.catch((err) => {
							toastr.error(err);
							completeAction(item, type);
						})
						.finally(() => {
							clearTimeout(timerId);
							timerId = null;
							clearActiveOperations([item.id]);

							onCancel();
						})
				: await renameFolder(item.id, value)
						.then(() => completeAction(item, type))
						.then(() => {
							toastr.success(
								t("FolderRenamed", {
									folderTitle: item.title,
									newFoldedTitle: value,
								}),
							);
						})
						.catch((err) => {
							toastr.error(err);
							completeAction(item, type);
						})
						.finally(() => {
							clearTimeout(timerId);
							timerId = null;
							clearActiveOperations(null, [item.id]);

							onCancel();
						});
		},
		[
			onCancel,
			addActiveItems,
			clearActiveOperations,
			completeAction,
			item,
			t,
			type,
			updateFile,
			renameFolder,
		],
	);

	return (
		<Dialog
			t={t}
			visible={eventDialogVisible}
			title={t("Common:Rename")}
			testIdPrefix="rename"
			startValue={startValue}
			onSave={onUpdate}
			onCancel={onCancel}
			onClose={onCancel}
		/>
	);
};

export default inject(
	({
		filesStore,
		filesActionsStore,
		selectedFolderStore,
		uploadDataStore,
		dialogsStore,
	}) => {
		const { addActiveItems, updateFile, renameFolder } = filesStore;

		const { id, setSelectedFolder } = selectedFolderStore;

		const { completeAction } = filesActionsStore;

		const { clearActiveOperations } = uploadDataStore;
		const { setEventDialogVisible, eventDialogVisible } = dialogsStore;

		return {
			addActiveItems,
			updateFile,
			renameFolder,

			completeAction,

			clearActiveOperations,
			setEventDialogVisible,
			eventDialogVisible,

			selectedFolderId: id,

			setSelectedFolder,
		};
	},
)(observer(RenameEvent));
