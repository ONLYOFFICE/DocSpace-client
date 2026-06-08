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

import React, { useState, useRef, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { getConvertedQuota } from "@docspace/shared/utils/common";
import { Text } from "@docspace/ui-kit/components/text";
import { ComboBox } from "@docspace/ui-kit/components/combobox";
import { toastr } from "@docspace/ui-kit/components/toast";
import api from "@docspace/shared/api";

import { connectedCloudsTypeTitleTranslation } from "SRC_DIR/helpers/filesUtils";
import { changeUserQuota } from "SRC_DIR/helpers/contacts";

import styles from "./space-quota.module.scss";

const getOptions = (t, item, spaceLimited) => {
	const items = [
		{
			id: "info-account-quota_edit",
			key: "change-quota",
			label: t("Common:ChangeQuota"),
			action: "change",
		},
		{
			id: "info-account-quota_current-size",
			key: "current-size",
			label: spaceLimited,
			action: "current-size",
		},
		{
			id: "info-account-quota_no-quota",
			key: "no-quota",
			label:
				item?.quotaLimit === -1
					? t("Common:Unlimited")
					: t("Common:DisableQuota"),
			action: "no-quota",
		},
	];

	if (item.isCustomQuota)
		items?.splice(1, 0, {
			id: "info-account-quota_no-quota",
			key: "default-quota",
			label: t("Common:SetToDefault"),
			action: "default",
		});

	return items;
};

const SpaceQuota = (props) => {
	const {
		isReadOnly,
		withoutLimitQuota,
		item,
		className,
		changeQuota,
		onSuccess,
		onAbort,
		updateQuota,
		resetQuota,
		defaultSize,

		needResetSelection,
		setSelected,
		inRoom,
		dataTestId,
	} = props;

	const [isLoading, setIsLoading] = useState(false);
	const { t } = useTranslation(["Common"]);
	const timeoutId = useRef(false);

	const usedQuota = getConvertedQuota(t, item?.usedSpace);
	const spaceLimited = getConvertedQuota(t, item?.quotaLimit);
	const defaultQuotaSize = getConvertedQuota(t, defaultSize);

	const options = getOptions(t, item, spaceLimited);

	useEffect(() => {
		return () => {
			clearTimeout(timeoutId.current);
		};
	}, []);

	const successCallback = (users) => {
		onSuccess && onSuccess(users);
		setIsLoading(false);
		clearTimeout(timeoutId.current);
		needResetSelection && setSelected("close");
	};

	const abortCallback = () => {
		onAbort && onAbort();
		setIsLoading(false);
		clearTimeout(timeoutId.current);
		needResetSelection && setSelected("close");
	};

	const onChange = async ({ action }) => {
		if (action === "change") {
			changeQuota([item], successCallback, abortCallback);

			return;
		}

		timeoutId.current = setTimeout(() => {
			setIsLoading(true);
		}, 500);

		if (action === "no-quota") {
			try {
				const items = await updateQuota([item.id], -1, inRoom());

				successCallback(items);

				options.forEach((o) => {
					if (o.key === "no-quota") o.label = t("Common:Unlimited");
				});

				toastr.success(t("Common:StorageQuotaDisabled"));
			} catch (e) {
				abortCallback();
				toastr.error(e);
			}

			return;
		}

		try {
			const items = await resetQuota([item.id], inRoom());

			options.forEach((o) => {
				if (o.key === "default-quota") o.label = defaultQuotaSize;
			});

			successCallback(items);
			toastr.success(t("Common:StorageQuotaReset"));
		} catch (e) {
			abortCallback();
			toastr.error(e);
		}
	};

	const action = item?.quotaLimit === -1 ? "no-quota" : "current-size";

	const selectedOption = options.find((elem) => elem.action === action);
	const comboboxOptions = options.filter(
		(elem) => elem.action !== "current-size",
	);

	if (item.providerType || item.providerKey) {
		return (
			<Text fontWeight={600}>
				{connectedCloudsTypeTitleTranslation(item.providerKey, t)}{" "}
			</Text>
		);
	}

	if (withoutLimitQuota || item?.quotaLimit === undefined) {
		return (
			<Text
				fontWeight={600}
				className={classNames(styles.text, {
					[styles.withoutPadding]: withoutLimitQuota,
				})}
			>
				{usedQuota}
			</Text>
		);
	}

	if (isReadOnly) {
		return (
			<Text
				fontWeight={600}
				className={classNames(styles.text, {
					[styles.withoutPadding]: isReadOnly,
				})}
			>
				{usedQuota} / {spaceLimited}
			</Text>
		);
	}

	return (
		<div
			className={classNames(styles.body, className)}
			data-testid={dataTestId}
		>
			<Text fontWeight={600}>{usedQuota} / </Text>

			<ComboBox
				className={classNames(styles.comboBoxSpaceQuota, {
					[styles.loading]: isLoading,
				})}
				selectedOption={selectedOption}
				options={comboboxOptions}
				onSelect={onChange}
				scaled={false}
				size="content"
				modernView
				isLoading={isLoading}
				manualWidth="auto"
				directionY="both"
			/>
		</div>
	);
};

export default inject(
	(
		{
			peopleStore,
			filesActionsStore,
			filesStore,
			currentQuotaStore,
			infoPanelStore,
		},
		{ type },
	) => {
		const { usersStore } = peopleStore;
		const { needResetUserSelection, setSelected: setUsersSelected } =
			usersStore;
		const { changeRoomQuota, changeAIAgentsQuota } = filesActionsStore;
		const {
			setCustomRoomQuota,
			setCustomAIAgentQuota,
			resetRoomQuota,
			resetAIAgentQuota,
			setSelected: setRoomsSelected,
			needResetFilesSelection,
		} = filesStore;

		const {
			isDefaultUsersQuotaSet,
			isDefaultRoomsQuotaSet,
			isDefaultAIAgentsQuotaSet,
			defaultUsersQuota,
			defaultRoomsQuota,
			defaultAIAgentsQuota,
		} = currentQuotaStore;

		const { inRoom, isVisible: infoPanelVisible } = infoPanelStore;

		const changeQuota =
			type === "user"
				? changeUserQuota
				: type === "agent"
					? changeAIAgentsQuota
					: changeRoomQuota;

		const updateQuota =
			type === "user"
				? api.people.setCustomUserQuota
				: type === "agent"
					? setCustomAIAgentQuota
					: setCustomRoomQuota;

		const resetQuota =
			type === "user"
				? api.people.resetUserQuota
				: type === "agent"
					? resetAIAgentQuota
					: resetRoomQuota;

		const withoutLimitQuota =
			type === "user"
				? !isDefaultUsersQuotaSet
				: type === "agent"
					? !isDefaultAIAgentsQuotaSet
					: !isDefaultRoomsQuotaSet;

		const defaultSize =
			type === "user"
				? defaultUsersQuota
				: type === "agent"
					? defaultAIAgentsQuota
					: defaultRoomsQuota;

		const needResetSelection =
			type === "user" ? needResetUserSelection : needResetFilesSelection;

		const setSelected = type === "user" ? setUsersSelected : setRoomsSelected;

		return {
			setSelected,
			withoutLimitQuota,
			changeQuota,
			updateQuota,
			resetQuota,
			defaultSize,
			needResetSelection: !infoPanelVisible || needResetSelection,
			inRoom,
		};
	},
)(observer(SpaceQuota));
