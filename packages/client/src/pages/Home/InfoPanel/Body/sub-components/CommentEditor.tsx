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

import React, { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { ReactSVG } from "react-svg";
import { useTranslation } from "react-i18next";

import { TFile } from "@docspace/shared/api/files/types";
import { toastr } from "@docspace/ui-kit/components/toast";
import { Textarea } from "@docspace/ui-kit/components/textarea";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { MAX_FILE_COMMENT_LENGTH } from "@docspace/shared/constants";

import PencilReactSvgUrl from "PUBLIC_DIR/images/pencil.react.svg?url";

import VersionHistoryStore from "SRC_DIR/store/VersionHistoryStore";
import FilesStore from "SRC_DIR/store/FilesStore";

type CommentEditorProps = {
	item: TFile;
	editing?: boolean;
	fetchFileVersions?: VersionHistoryStore["fetchFileVersions"];
	updateCommentVersion?: VersionHistoryStore["updateCommentVersion"];
	setVerHistoryFileId?: VersionHistoryStore["setVerHistoryFileId"];
	setVerHistoryFileSecurity?: VersionHistoryStore["setVerHistoryFileSecurity"];

	setFile?: FilesStore["setFile"];
};

const CommentEditor = ({
	item,
	editing,
	fetchFileVersions,
	updateCommentVersion,

	setVerHistoryFileId,
	setVerHistoryFileSecurity,

	setFile,
}: CommentEditorProps) => {
	const { t } = useTranslation(["Common"]);

	const { id, comment, version, security } = item;

	const changeVersionHistoryAbility = !editing && security?.EditHistory;

	useEffect(() => {
		setVerHistoryFileId?.(id);
		setVerHistoryFileSecurity?.(security);
	}, []);

	const [isEdit, setIsEdit] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const [inputValue, setInputValue] = useState(comment || "");

	const onChangeInputValue = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const value = e.target.value;
		if (value.length > MAX_FILE_COMMENT_LENGTH) return;

		setInputValue(value);
	};

	const onOpenEditor = async () => {
		setInputValue(comment);
		setIsEdit(true);
	};

	const onSave = async () => {
		setIsLoading(true);

		await fetchFileVersions?.(id, security).catch((err) => {
			toastr.error(err);
			setIsLoading(false);
		});

		updateCommentVersion?.(id, inputValue, version)
			.then(() => {
				setFile?.({
					...item,
					comment: inputValue,
				});
			})
			.catch((err) => {
				toastr.error(err);
				setIsLoading(false);
			});

		setIsEdit(false);
		setIsLoading(false);
	};

	const onCancel = () => {
		setIsEdit(false);
		setInputValue(comment);
	};

	return (
		<div className="property-comment_editor property-content">
			{!isEdit ? (
				<div className="property-comment_editor-display">
					{comment ? (
						<Text truncate className="property-content">
							{comment}
						</Text>
					) : null}
					{changeVersionHistoryAbility ? (
						<div
							className="edit_toggle"
							onClick={onOpenEditor}
							data-testid="info_panel_details_comment_edit_toggle"
						>
							<ReactSVG className="edit_toggle-icon" src={PencilReactSvgUrl} />
							<div className="property-content edit_toggle-text">
								{comment ? t("Common:EditButton") : t("Common:AddButton")}
							</div>
						</div>
					) : null}
				</div>
			) : (
				<div className="property-comment_editor-editor">
					<Textarea
						isDisabled={isLoading}
						value={inputValue}
						onChange={onChangeInputValue}
						autoFocus
						areaSelect
						heightTextArea="54px"
						fontSize={13}
						dataTestId="info_panel_details_comment_textarea"
					/>
					<div className="property-comment_editor-editor-buttons">
						<Button
							isLoading={isLoading}
							label={t("Common:SaveButton")}
							onClick={onSave}
							size={ButtonSize.extraSmall}
							primary
							testId="info_panel_details_comment_save_button"
						/>
						<Button
							label={t("Common:CancelButton")}
							onClick={onCancel}
							size={ButtonSize.extraSmall}
							testId="info_panel_details_comment_cancel_button"
						/>
					</div>
				</div>
			)}
		</div>
	);
};

export default inject(({ versionHistoryStore, filesStore }: TStore) => {
	const {
		fetchFileVersions,
		updateCommentVersion,
		isEditingVersion,
		isEditing,
		setVerHistoryFileId,
		setVerHistoryFileSecurity,
	} = versionHistoryStore;

	const { setFile } = filesStore;

	const editing = isEditingVersion || isEditing;

	return {
		fetchFileVersions,
		updateCommentVersion,

		editing,
		setVerHistoryFileId,
		setVerHistoryFileSecurity,

		setFile,
	};
})(observer(CommentEditor));
