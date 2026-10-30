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

import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";

import {
	TFileSecurity,
	TFolder,
	TFolderSecurity,
	TGetReferenceDataRequest,
	TPresignedUri,
} from "@docspace/shared/api/files/types";
import { getPresignedUri, getReferenceData } from "@docspace/shared/api/files";
import { getDocEditor } from "@/utils";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import { FilesSelectorFilterTypes } from "@docspace/shared/enums";
import type {
	TFilesSelectorFile,
	TFilesSelectorLoadedFiles,
	TSelectedFileInfo,
} from "@onlyoffice/apps-ui-kit/selectors/Files/FilesSelector.types";
import { TBreadCrumb } from "@onlyoffice/apps-ui-kit/components/selector";
import { TRoomSecurity } from "@docspace/shared/api/rooms/types";

import { TEvent, UseSelectFileDialogProps } from "@/types";

export const insertImageAction = "imageFileType";
export const mailMergeAction = "mailMergeFileType";
export const compareFilesAction = "documentsFileType";
export const setReferenceSourceAction = "referenceSourceType";
export const aiAttachFileAction = "aiAttachFileType";

const useSelectFileDialog = ({ instanceId }: UseSelectFileDialogProps) => {
	const { t } = useTranslation(["Common"]);
	const [isVisible, setIsVisible] = React.useState(false);
	// Design: private-rooms-editor-contract D16, encrypted files stay out of the pickers.
	const encryptedIds = React.useRef(new Set<string | number>());
	const [encryptedItems, setEncryptedItems] = React.useState<
		(string | number)[]
	>([]);
	const [actionEvent, setActionEvent] = React.useState<TEvent>({} as TEvent);
	const [filesType, setFilesType] = React.useState("");
	const [fileTypeDetection, setFileTypeDetection] = React.useState({
		isSelect: true,
		filterParam: FilesSelectorFilterTypes.IMG,
	});

	const requestRunning = React.useRef(false);
	// Pending "Add file from storage" pick of the editor's AI chat: settled
	// with the selected file, or with null when the dialog closes without one.
	const aiFileResolverRef = React.useRef<
		((file: TSelectedFileInfo | null) => void) | null
	>(null);

	const settleAIFileRequest = useCallback((file: TSelectedFileInfo | null) => {
		const resolve = aiFileResolverRef.current;
		aiFileResolverRef.current = null;
		resolve?.(file);
	}, []);

	const onAIRequestStorageFile = useCallback(() => {
		settleAIFileRequest(null);
		return new Promise<TSelectedFileInfo | null>((resolve) => {
			aiFileResolverRef.current = resolve;
			setActionEvent({} as TEvent);
			setFilesType(aiAttachFileAction);
			setIsVisible(true);
		});
	}, [settleAIFileRequest]);

	const onSDKRequestSelectDocument = useCallback((event: object) => {
		// console.log("onSDKRequestSelectDocument", { event });
		setActionEvent(event as TEvent);
		setFilesType(compareFilesAction);
		setIsVisible(true);
	}, []);

	const onSDKRequestSelectSpreadsheet = useCallback((event: object) => {
		// console.log("onSDKRequestSelectSpreadsheet", { event });
		setActionEvent(event as TEvent);
		setFilesType(mailMergeAction);
		setIsVisible(true);
	}, []);

	const onSDKRequestInsertImage = useCallback((event: object) => {
		// console.log("onSDKRequestInsertImage", { event });
		setActionEvent(event as TEvent);
		setFilesType(insertImageAction);
		setIsVisible(true);
	}, []);

	const onSDKRequestReferenceSource = useCallback((event: object) => {
		// console.log("onSDKRequestReferenceSource", { event });
		setActionEvent(event as TEvent);
		setFilesType(setReferenceSourceAction);
		setIsVisible(true);
	}, []);

	const insertImage = useCallback(
		(link: TPresignedUri) => {
			const token = link.token;

			const docEditor = getDocEditor();

			docEditor?.insertImage({
				...actionEvent.data,
				fileType: link.filetype,
				...(token && { token }),
				url: link.url,
			});
		},
		[actionEvent],
	);

	const mailMerge = useCallback(
		(link: TPresignedUri) => {
			const token = link.token;

			const docEditor = getDocEditor();

			docEditor?.setRequestedSpreadsheet({
				...actionEvent.data,
				fileType: link.filetype,
				...(token && { token }),
				url: link.url,
			});
		},
		[actionEvent],
	);

	const compareFiles = useCallback(
		(link: TPresignedUri) => {
			const token = link.token;

			const docEditor = getDocEditor();

			docEditor?.setRequestedDocument({
				...actionEvent.data,
				fileType: link.filetype,
				...(token && { token }),
				url: link.url,
			});
		},
		[actionEvent],
	);

	const setReferenceSource = useCallback((data: TGetReferenceDataRequest) => {
		const docEditor = getDocEditor();

		docEditor?.setReferenceSource(data);
	}, []);

	const onFilesLoaded = useCallback(
		(files: TFilesSelectorFile[], _context: TFilesSelectorLoadedFiles) => {
			let changed = false;
			for (const file of files) {
				if (file.encrypted && !encryptedIds.current.has(file.id)) {
					encryptedIds.current.add(file.id);
					changed = true;
				}
			}
			if (changed) setEncryptedItems([...encryptedIds.current]);
		},
		[],
	);

	const isEncryptedPick = useCallback(
		(file: TSelectedFileInfo, isInsidePrivateRoom?: boolean) =>
			!!file && (!!isInsidePrivateRoom || encryptedIds.current.has(file.id)),
		[],
	);

	const onSelectFile = useCallback(
		async (file: TSelectedFileInfo, isInsidePrivateRoom?: boolean) => {
			try {
				if (!file) return;

				if (isEncryptedPick(file, isInsidePrivateRoom)) {
					toastr.info(t("Common:PrivateRoomEditorNotSupported"));
					return;
				}

				if (filesType === aiAttachFileAction) {
					settleAIFileRequest(file);
				} else if (filesType === setReferenceSourceAction) {
					const data = await getReferenceData({
						fileKey: file.id,
						instanceId,
					});

					setReferenceSource(data);
				} else {
					const link = await getPresignedUri(file.id);

					if (filesType === insertImageAction) insertImage(link);
					if (filesType === mailMergeAction) mailMerge(link);
					if (filesType === compareFilesAction) compareFiles(link);
				}
			} catch (e) {
				console.error(e);
			}
		},
		[
			filesType,
			instanceId,
			setReferenceSource,
			insertImage,
			mailMerge,
			compareFiles,
			settleAIFileRequest,
			isEncryptedPick,
			t,
		],
	);

	const getFileTypeDetection = React.useCallback(() => {
		// The AI chat takes any file: images inline, documents as text.
		if (filesType === aiAttachFileAction) {
			return {
				isSelect: true,
				filterParam: FilesSelectorFilterTypes.ALL,
			};
		}
		if (filesType === insertImageAction) {
			return {
				isSelect: true,
				filterParam: FilesSelectorFilterTypes.IMG,
			};
		}
		if (
			filesType === mailMergeAction ||
			filesType === setReferenceSourceAction
		) {
			return {
				isSelect: true,
				filterParam: FilesSelectorFilterTypes.XLSX,
			};
		}
		if (filesType === compareFilesAction) {
			return {
				isSelect: true,
				filterParam: FilesSelectorFilterTypes.DOCX,
			};
		}

		return {
			isSelect: true,
			filterParam: FilesSelectorFilterTypes.DOCX,
		};
	}, [filesType]);

	React.useEffect(() => {
		if (!filesType) return;

		const typeDet = getFileTypeDetection();

		setFileTypeDetection(typeDet);
	}, [filesType, getFileTypeDetection]);

	const onClose = useCallback(() => {
		if (requestRunning.current) return;
		setIsVisible(false);
		setActionEvent({} as TEvent);
		settleAIFileRequest(null);
	}, [settleAIFileRequest]);

	const onSubmit = useCallback(
		async (
			selectedItemId: string | number | undefined,
			folderTitle: string,
			isPublic: boolean,
			breadCrumbs: TBreadCrumb[],
			fileName: string,
			isChecked: boolean,
			selectedTreeNode: TFolder,
			selectedFileInfo: TSelectedFileInfo,
			_isInsideKnowledge?: boolean,
			_isInsideResultStorage?: boolean,
			isInsidePrivateRoom?: boolean,
		) => {
			requestRunning.current = true;
			await onSelectFile(selectedFileInfo, isInsidePrivateRoom);
			requestRunning.current = false;
			onClose();
		},
		[onClose, onSelectFile],
	);

	const getIsDisabled = useCallback(
		(
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
			_isDisabledFolder?: boolean,
			_isInsideKnowledge?: boolean,
			_isInsideResultStorage?: boolean,
			isInsidePrivateRoom?: boolean,
		) => {
			if (isFirstLoad) return true;
			if (requestRunning.current) return true;
			if (!selectedFileInfo) return true;
			if (isEncryptedPick(selectedFileInfo, isInsidePrivateRoom)) return true;

			return false;
		},
		[isEncryptedPick],
	);

	return {
		onSDKRequestSelectDocument,
		onSDKRequestInsertImage,
		onSDKRequestReferenceSource,
		onSDKRequestSelectSpreadsheet,
		onAIRequestStorageFile,

		onSubmitSelectFileDialog: onSubmit,
		onCloseSelectFileDialog: onClose,

		getIsDisabledSelectFileDialog: getIsDisabled,
		onFilesLoadedSelectFileDialog: onFilesLoaded,
		selectFileDialogDisabledItems: encryptedItems,

		selectFileDialogVisible: isVisible,

		selectFileDialogFileTypeDetection: fileTypeDetection,
	};
};

export default useSelectFileDialog;
