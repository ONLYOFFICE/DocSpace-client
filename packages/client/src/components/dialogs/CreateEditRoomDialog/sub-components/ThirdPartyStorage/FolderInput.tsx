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

import React, { useState, useEffect } from "react";
import { TFunction } from "i18next";

import FolderReactSvgUrl from "PUBLIC_DIR/images/folder.react.svg?url";

import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { TooltipContainer } from "@docspace/ui-kit/components/tooltip";
import { TFolder } from "@docspace/shared/api/files/types";

import FilesSelector from "SRC_DIR/components/FilesSelector";

import styles from "../../CreateEditRoomDialog.module.scss";

type FolderInputProps = {
	t: TFunction;
	roomTitle: string;
	thirdpartyAccount: Record<string, unknown>;
	onChangeStorageFolderId: (storageFolderId: string) => void;
	isDisabled: boolean;
	createNewFolderIsChecked: boolean;
};

const FolderInput = ({
	t,
	roomTitle,
	thirdpartyAccount,
	onChangeStorageFolderId,
	isDisabled,
	createNewFolderIsChecked,
}: FolderInputProps) => {
	const [treeNode, setTreeNode] = useState<TFolder | null>(null);
	const [path, setPath] = useState("");
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const onOpen = () => {
		if (isDisabled) return;
		setIsDialogOpen(true);
	};
	const onClose = () => {
		setIsDialogOpen(false);
	};

	const getPathValue = () => {
		if (!treeNode) return;

		let currentPath = treeNode.path;
		currentPath = currentPath?.slice(1);

		let result = "";
		currentPath?.map(
			(node, i) =>
				(result += node.title + (i !== currentPath.length - 1 ? "/" : "")),
		);

		setPath(result);
	};

	useEffect(() => {
		if (!treeNode) return;
		onChangeStorageFolderId(treeNode?.id?.toString() || "");
		getPathValue();
	}, [treeNode]);

	if (!thirdpartyAccount.id) return null;

	let title = createNewFolderIsChecked || path ? "/" : t("RootFolderLabel");
	title += path;
	if (createNewFolderIsChecked) {
		title += path ? "/" : "";
		title += roomTitle || t("Common:NewRoom");
	}

	return (
		<>
			<div className={styles.folderInput} onClick={onOpen}>
				<TooltipContainer
					as="div"
					className="folder-path-wrapper"
					title={title}
				>
					<span className="root_label">
						{createNewFolderIsChecked || path ? "/" : t("RootFolderLabel")}
					</span>
					<span className="path">{path}</span>
					{createNewFolderIsChecked ? (
						<span className="room_title">
							{(path ? "/" : "") + (roomTitle || t("Common:NewRoom"))}
						</span>
					) : null}
				</TooltipContainer>
				<TooltipContainer
					as="div"
					title={t("Common:SelectFolder")}
					className="icon-wrapper"
				>
					<IconButton size={16} iconName={FolderReactSvgUrl} isClickable />
				</TooltipContainer>
			</div>

			{isDialogOpen ? (
				// @ts-expect-error need pass all props
				<FilesSelector
					isPanelVisible={isDialogOpen}
					onClose={onClose}
					isThirdParty
					isSelectFolder
					onSelectTreeNode={setTreeNode}
					currentFolderId={
						treeNode
							? treeNode.id
							: ((thirdpartyAccount as Record<string, unknown>).id as string)
					}
				/>
			) : null}
		</>
	);
};

export default FolderInput;
