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

import { useState, useEffect, useCallback } from "react";
import { inject, observer } from "mobx-react";
import { Trans, useTranslation } from "react-i18next";
import { TRoom } from "@docspace/shared/api/rooms/types";
import { toastr, type TData } from "@docspace/ui-kit/components/toast";
import { Text } from "@docspace/ui-kit/components/text";
import { TRoomParams } from "@docspace/shared/utils/rooms";

import CreateRoomTemplate from "../dialogs/CreateRoomTemplate/CreateRoomTemplate";

type SaveAsTemplateEventProps = {
	visible: boolean;
	item: TRoom;
	fetchTags: () => TRoom["tags"];
	setTemplateEventVisible: (visible: boolean) => void;
	getThirdPartyIcon: (provider: string) => string;
	isDefaultRoomsQuotaSet: boolean;
	onClose: VoidFunction;
	onSaveAsTemplate: (
		item: TRoom,
		roomParams: TRoom,
		open: boolean,
	) => Promise<{
		error: string;
		isCompleted: boolean;
		progress: number;
		templateId: number;
	}>;
};

const SaveAsTemplateEvent = (props: SaveAsTemplateEventProps) => {
	const {
		visible,
		item,
		fetchTags,
		setTemplateEventVisible,
		getThirdPartyIcon,
		isDefaultRoomsQuotaSet,
		onClose,
		onSaveAsTemplate,
	} = props;

	const { t } = useTranslation(["Files"]);

	const [fetchedTags, setFetchedTags] = useState<TRoom["tags"]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const startTags = Object.values(item.tags);
	const startObjTags = startTags.map((tag, i) => ({ id: i, name: tag }));

	const fetchedRoomParams = {
		title: item.title,
		type: item.roomType,
		tags: startObjTags,
		isThirdparty: !!item.providerKey,
		storageLocation: {
			title: item.title,
			parentId: item.parentId,
			providerKey: item.providerKey,
			iconSrc: getThirdPartyIcon(item.providerKey || ""),
		},
		isPrivate: false,
		icon: {
			uploadedFile: item?.logo?.original,
			tmpFile: "",
			x: 0.5,
			y: 0.5,
			zoom: 1,
		},
		roomOwner: item.createdBy,
		canChangeRoomOwner: item?.security?.ChangeOwner || false,
		indexing: item.indexing,
		logo: item.logo,
		lifetime: item.lifetime,
		denyDownload: item.denyDownload,
		watermark: item.watermark,
		...(isDefaultRoomsQuotaSet && {
			quota: item.quotaLimit,
		}),
	};

	const fetchTagsAction = useCallback(async () => {
		try {
			const tags = await fetchTags();
			setFetchedTags(tags);
		} catch (err) {
			toastr.error(err as TData);
		}
	}, []);

	const onSave = async (roomParams: TRoom, openCreatedTemplate: boolean) => {
		setIsLoading(true);

		onSaveAsTemplate(item, roomParams, openCreatedTemplate)
			.then(() => {
				toastr.success(
					<Trans
						t={t}
						ns="Files"
						i18nKey="SaveAsTemplateToast"
						values={{
							title: roomParams.title,
						}}
						components={{
							1: <Text as="span" fontWeight={600} fontSize="12px" />,
						}}
					/>,
				);
			})
			.catch((err) => toastr.error(err))
			.finally(() => {
				setIsLoading(false);
				onClose();
			});
	};

	useEffect(() => {
		setTemplateEventVisible(true);

		return () => {
			setTemplateEventVisible(false);
		};
	}, []);

	useEffect(() => {
		fetchTagsAction();
	}, [fetchTagsAction]);

	const onCloseEvent = () => {
		onClose();

		setTemplateEventVisible(false);
	};

	return (
		<CreateRoomTemplate
			visible={visible}
			item={item}
			onClose={onCloseEvent}
			fetchedTags={fetchedTags}
			fetchedRoomParams={fetchedRoomParams as unknown as TRoomParams}
			onSave={onSave}
			isLoading={isLoading}
		/>
	);
};

export default inject<TStore>(
	({
		tagsStore,
		dialogsStore,
		filesSettingsStore,
		currentQuotaStore,
		createEditRoomStore,
	}) => {
		const { fetchTags } = tagsStore;
		const { setTemplateEventVisible } = dialogsStore;
		const { getThirdPartyIcon } = filesSettingsStore.thirdPartyStore;
		const { isDefaultRoomsQuotaSet } = currentQuotaStore;
		const { onSaveAsTemplate } = createEditRoomStore;

		return {
			fetchTags,
			setTemplateEventVisible,
			getThirdPartyIcon,
			isDefaultRoomsQuotaSet,
			onSaveAsTemplate,
		};
	},
)(observer(SaveAsTemplateEvent));
