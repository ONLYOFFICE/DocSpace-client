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

import isNil from "lodash/isNil";
import React, { useCallback, useEffect } from "react";

import { frameCallEvent, getFrameId } from "@docspace/shared/utils/common";
import { RoomsType } from "@docspace/shared/enums";
import { getPrimaryLink } from "@docspace/shared/api/rooms";
import RoomSelector from "@docspace/ui-kit/selectors/Room";
import type { FolderDtoInteger } from "@docspace/ui-kit/selectors/Files/FilesSelector.types";
import { useDocumentTitle } from "@docspace/shared/hooks/useDocumentTitle";

import type { TGetRooms } from "@docspace/shared/api/rooms/types";
import type { TSelectorItem } from "@docspace/ui-kit/components/selector";

import { getRoomsIcon } from "@/utils";
import { useSDKConfig } from "@/providers/SDKConfigProvider";

const IS_TEST = process.env.NEXT_PUBLIC_E2E_TEST;

export type RoomSelectorClientProps = {
	baseConfig: {
		acceptLabel?: string;
		cancel?: boolean;
		cancelLabel?: string;
		header?: boolean;
		roomType?: RoomsType | RoomsType[] | null;
		search?: boolean;
	};
	pageCount: number;
	roomList: TGetRooms;
};

export default function RoomSelectorClient({
	baseConfig,
	pageCount,
	roomList,
}: RoomSelectorClientProps) {
	useSDKConfig();

	useDocumentTitle("RoomSelector");

	useEffect(() => {
		frameCallEvent({ event: "onAppReady", data: { frameId: getFrameId() } });
	}, []);

	const onSubmit = useCallback(async ([selectedItem]: TSelectorItem[]) => {
		const enrichedData = {
			...selectedItem,
			icon:
				selectedItem.icon === ""
					? getRoomsIcon(selectedItem.roomType as RoomsType, false, 32)
					: selectedItem.iconOriginal,
		} as TSelectorItem & {
			requestTokens?: {
				id: string;
				primary: boolean;
				title: string;
				requestToken: string;
			}[];
		};

		const isSharedRoom =
			selectedItem.roomType === RoomsType.PublicRoom ||
			((selectedItem.roomType === RoomsType.CustomRoom ||
				selectedItem.roomType === RoomsType.FormRoom) &&
				selectedItem.shared);

		if (isSharedRoom && !isNil(selectedItem.id)) {
			const response = (await getPrimaryLink(selectedItem.id)) as {
				sharedTo: {
					id: string;
					title: string;
					requestToken: string;
					primary: boolean;
				};
			};
			const {
				sharedTo: { id, title, requestToken, primary },
			} = response;
			enrichedData.requestTokens = [{ id, primary, title, requestToken }];
		}

		frameCallEvent({ event: "onSelectCallback", data: [enrichedData] });

		if (IS_TEST) {
			// DON`T REMOVE CONSOLE LOG, IT IS REQUIRED FOR TESTING
			console.log(
				JSON.stringify({ onSelectCallback: "onSelectCallback", enrichedData }),
			);
		}
	}, []);

	const onClose = useCallback(() => {
		frameCallEvent({ event: "onCloseCallback" });

		if (IS_TEST) {
			// DON`T REMOVE CONSOLE LOG, IT IS REQUIRED FOR TESTING
			console.log("onCloseCallback");
		}
	}, []);

	const cancelButtonProps = baseConfig?.cancel
		? {
				withCancelButton: true as const,
				cancelButtonLabel: baseConfig?.cancelLabel as string,
				onCancel: onClose,
			}
		: {};

	const headerProps = baseConfig?.header
		? {
				withHeader: true as const,
				headerProps: {
					headerLabel: "",
					isCloseable: false,
					onCloseClick: onClose,
				},
			}
		: { withPadding: false };

	const roomTypeProps = baseConfig?.roomType
		? { roomType: baseConfig.roomType }
		: {};

	const searchProps = baseConfig?.search
		? { withSearch: baseConfig?.search }
		: {};

	const { folders, total } = roomList;

	return (
		<RoomSelector
			{...cancelButtonProps}
			{...headerProps}
			{...roomTypeProps}
			{...searchProps}
			initHasNextPage={total > pageCount}
			initItems={folders as unknown as FolderDtoInteger[]}
			initTotal={total}
			isMultiSelect={false}
			onSubmit={onSubmit}
			submitButtonLabel={baseConfig?.acceptLabel}
			withInit
		/>
	);
}
