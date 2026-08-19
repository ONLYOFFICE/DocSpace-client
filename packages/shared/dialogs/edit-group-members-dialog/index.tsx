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

import { useEffect, useState, useDeferredValue } from "react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { InputSize } from "@docspace/ui-kit/components/text-input";
import {
	getGroupMembersInRoom,
	getGroupMembersShareFile,
} from "../../api/groups";
import { SearchInput } from "@docspace/ui-kit/components/search-input";
import { MIN_LOADER_TIMER } from "@docspace/ui-kit/selectors/utils/constants";
import { ModalDialog, ModalDialogType } from "@docspace/ui-kit/components/modal-dialog";
import { isFile } from "../../utils/typeGuards";

import type { TGroupMemberInvitedInRoom } from "../../api/groups/types";

import EmptyContainer from "./EmptyContainer";
import styles from "./EditGroupMembersDialog.module.scss";

import GroupMembersList from "./sub-components/GroupMembersList/GroupMembersList";
import { ModalBodyLoader } from "./sub-components/ModalBodyLoader/ModalBodyLoader";
import EditGroupMembersDialogProvider from "./EditGroupMembersDialog.provider";
import type { EditGroupMembersProps } from "./EditGroupMembersDialog.types";

export const EditGroupMembers = ({
	infoPanelSelection,
	group,
	visible,
	standalone = false,
	setVisible,
	onBackClick,
	onClose,
}: EditGroupMembersProps) => {
	const { t } = useTranslation(["Common"]);

	const [searchValue, setSearchValue] = useState<string>("");

	const searchValueDeferred = useDeferredValue(searchValue);

	const [total, setTotal] = useState(0);
	const [groupMembers, setGroupMembers] = useState<
		TGroupMemberInvitedInRoom[] | null
	>(null);
	const [isSearchResultLoading, setIsSearchResultLoading] = useState(false);
	const [isNextPageLoading, setIsNextPageLoading] = useState(false);

	const onChangeSearchValue = (value: string) => {
		setIsSearchResultLoading(true);
		setSearchValue(value.trim());
	};

	const onClearSearch = () => onChangeSearchValue("");

	const onClosePanel = () => {
		setVisible(false);
		onClose?.();
	};

	const loadNextPage = async (startIndex: number) => {
		if (!infoPanelSelection) {
			return;
		}

		const startLoadingTime = new Date();

		try {
			setIsNextPageLoading(true);
			const filter = {
				startIndex,
				count: 100,
				filterValue: searchValueDeferred,
			};

			const api = isFile(infoPanelSelection)
				? getGroupMembersShareFile
				: getGroupMembersInRoom;

			const data = await api(infoPanelSelection.id, group.id, filter);

			setTotal(data.total);
			if (startIndex === 0 || !groupMembers) {
				setGroupMembers(data.items);
			} else {
				setGroupMembers([...groupMembers, ...data.items]);
			}
		} catch (e) {
			console.error(e);
		} finally {
			const nowDate = new Date();
			const diff = Math.abs(nowDate.getTime() - startLoadingTime.getTime());

			if (diff < MIN_LOADER_TIMER) {
				setTimeout(() => {
					setIsSearchResultLoading(false);
				}, MIN_LOADER_TIMER - diff);
			} else {
				setIsSearchResultLoading(false);
			}
			setIsNextPageLoading(false);
			// setIsSearchResultLoading(false);
		}
	};

	useEffect(() => {
		loadNextPage(0);
	}, [searchValueDeferred]);

	return (
		<ModalDialog
			visible={visible}
			onClose={onClosePanel}
			displayType={ModalDialogType.aside}
			onBackClick={onBackClick}
			isBackButton={!!onBackClick}
			withoutPadding
		>
			<ModalDialog.Header>
				<Text
					className={styles.headerText}
					fontSize="21px"
					fontWeight={700}
					dir="auto"
					truncate
				>
					{group.name}
				</Text>
			</ModalDialog.Header>

			<ModalDialog.Body>
				<div className={styles.bodyContent}>
					{!groupMembers ? (
						<ModalBodyLoader withSearch />
					) : (
						<EditGroupMembersDialogProvider
							infoPanelSelection={infoPanelSelection}
							standalone={standalone}
						>
							<SearchInput
								className="search-input"
								placeholder={t("Common:SearchByGroupMembers")}
								value={searchValue}
								onChange={onChangeSearchValue}
								onClearSearch={onClearSearch}
								size={InputSize.base}
							/>

							{isSearchResultLoading ? (
								<ModalBodyLoader withSearch={false} />
							) : !groupMembers.length ? (
								<EmptyContainer />
							) : (
								<GroupMembersList
									members={groupMembers}
									loadNextPage={loadNextPage}
									hasNextPage={groupMembers.length < total}
									total={total}
									isNextPageLoading={isNextPageLoading}
								/>
							)}
						</EditGroupMembersDialogProvider>
					)}
				</div>
			</ModalDialog.Body>
		</ModalDialog>
	);
};
