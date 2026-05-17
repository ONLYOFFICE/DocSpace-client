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

import { useCallback, useState } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { toastr } from "@docspace/ui-kit/components/toast";
import api from "@docspace/shared/api";

import { ChangeQuotaDialog } from "../dialogs";

let timerId = null;
const ChangeQuotaEvent = (props) => {
	const {
		visible,
		type,
		ids,
		bodyDescription,
		headerTitle,
		onClose,
		setCustomRoomQuota,
		setCustomAIAgentQuota,
		successCallback,
		abortCallback,

		inRoom,
	} = props;

	const { t } = useTranslation("Common");
	const [isLoading, setIsLoading] = useState(false);
	const [isError, setIsError] = useState(false);
	const [size, setSize] = useState();

	const onSetQuotaBytesSize = (value) => {
		setSize(value);
	};

	const updateFunction = () => {
		return type === "user"
			? api.people.setCustomUserQuota(ids, size)
			: type === "agent"
				? setCustomAIAgentQuota(ids, size, inRoom)
				: setCustomRoomQuota(ids, size, inRoom);
	};

	const onSaveClick = async () => {
		if (!size || size.trim() === "") {
			setIsError(true);
			return;
		}

		timerId = setTimeout(() => setIsLoading(true), 200);
		let items;

		try {
			items = await updateFunction(size);
			toastr.success(t("Common:StorageQuotaSet"));

			successCallback && successCallback(items);
		} catch (e) {
			toastr.error(e);

			abortCallback && abortCallback();
		}

		timerId && clearTimeout(timerId);
		timerId = null;

		setIsLoading(false);
		setIsError(false);

		onClose && onClose();
	};

	const onCloseClick = useCallback(() => {
		timerId && clearTimeout(timerId);
		timerId = null;

		abortCallback && abortCallback();
		onClose && onClose();
	}, [onClose, abortCallback]);

	return (
		<ChangeQuotaDialog
			visible={visible}
			onSaveClick={onSaveClick}
			onCloseClick={onCloseClick}
			onSetQuotaBytesSize={onSetQuotaBytesSize}
			bodyDescription={bodyDescription}
			headerTitle={headerTitle}
			isError={isError}
			isLoading={isLoading}
			size={size}
		/>
	);
};

export default inject(
	(
		{ peopleStore, filesStore, infoPanelStore, selectedFolderStore },
		{ type },
	) => {
		const { usersStore } = peopleStore;
		const { getPeopleListItem, needResetUserSelection } = usersStore;
		const {
			setCustomRoomQuota,
			setCustomAIAgentQuota,
			needResetFilesSelection,
		} = filesStore;

		const { isVisible: infoPanelVisible } = infoPanelStore;

		const inRoom = !!selectedFolderStore?.navigationPath;
		const needResetSelection =
			type === "user"
				? !infoPanelVisible || needResetUserSelection
				: needResetFilesSelection;

		return {
			setCustomRoomQuota,
			setCustomAIAgentQuota,
			inRoom,
			getPeopleListItem,
			needResetSelection,
		};
	},
)(observer(ChangeQuotaEvent));
