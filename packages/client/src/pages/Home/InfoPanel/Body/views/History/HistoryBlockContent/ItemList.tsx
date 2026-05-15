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

import { useState, Fragment } from "react";
import { Trans, useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { ReactSVG } from "react-svg";
import classNames from "classnames";
import { TFunction } from "i18next";

import {
	FeedAction,
	TFeedAction,
	TFeedData,
	TRoom,
} from "@docspace/shared/api/rooms/types";
import { toastr } from "@docspace/ui-kit/components/toast";
import { getFileExtension } from "@docspace/shared/utils/common";
import { MEDIA_VIEW_URL } from "@docspace/shared/constants";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { TFile, TFolder } from "@docspace/shared/api/files/types";

import FolderLocationReactSvgUrl from "PUBLIC_DIR/images/folder-location.react.svg?url";
import SortDesc from "PUBLIC_DIR/images/sort.desc.react.svg";

import FilesActionStore from "SRC_DIR/store/FilesActionsStore";
import FilesStore from "SRC_DIR/store/FilesStore";
import InfoPanelStore from "SRC_DIR/store/InfoPanelStore";

import config from "PACKAGE_FILE";

import styles from "../History.module.scss";

const EXPANSION_THRESHOLD = 3;

type HistoryItemListProps = {
	feed: TFeedAction<TFeedData>;

	selectedFolderId?: number | string;

	getInfoPanelItemIcon?: InfoPanelStore["getInfoPanelItemIcon"];

	nameWithoutExtension?: FilesActionStore["nameWithoutExtension"];
	checkAndOpenLocationAction?: FilesActionStore["checkAndOpenLocationAction"];
	openItemAction?: FilesActionStore["openItemAction"];

	getFileInfo?: FilesStore["getFileInfo"];
	getFolderInfo?: FilesStore["getFolderInfo"];
} & {
	actionType: FeedAction;
	targetType: "file" | "folder";
};

const HistoryItemList = ({
	feed,
	actionType,
	targetType,
	selectedFolderId,

	nameWithoutExtension,
	getInfoPanelItemIcon,
	checkAndOpenLocationAction,
	openItemAction,
	getFileInfo,
	getFolderInfo,
}: HistoryItemListProps) => {
	const { t } = useTranslation(["InfoPanel", "Common", "Translations"]);

	const totalItems = feed.related.length + 1;
	const isExpandable = totalItems > EXPANSION_THRESHOLD;
	const [isExpanded, setIsExpanded] = useState(!isExpandable);

	const isStartedFilling = actionType === FeedAction.StartedFilling;
	const isSubmitted = actionType === FeedAction.Submitted;

	const onExpand = () => setIsExpanded(true);

	const isFolder = targetType === "folder";

	const items = [feed, ...feed.related].map((item) => {
		const { id, data } = item;

		const i: TFeedData & {
			feedId: number;
			title: string;
			isFolder: boolean;
			fileExst: string;
		} = { feedId: id, title: "", isFolder, ...data, fileExst: "" };

		i.fileExst = getFileExtension(data.title || data.newTitle || "");
		i.title = nameWithoutExtension!(data.title || data.newTitle);
		i.isFolder = actionType === FeedAction.Change ? !i.fileExst : isFolder;

		return i;
	});

	const sortItems =
		actionType === FeedAction.Change
			? items.sort((a, b) => (a.oldIndex ?? 0) - (b.oldIndex ?? 0))
			: items;

	const oldItem = actionType === "rename" && {
		title: nameWithoutExtension!(feed.data.oldTitle) as string,
		fileExst: getFileExtension(feed.data.oldTitle ?? ""),
	};

	const isDisabledOpenLocationButton = !(isStartedFilling || isSubmitted);

	const handleOpenFile = async (item: (typeof items)[0]) => {
		try {
			const isFeedData = "id" in item;
			if (!isFeedData) return;

			if (isFolder) {
				if (Number(selectedFolderId) === item.id) return;

				return await getFolderInfo?.(item.id, true).then((res) => {
					openItemAction!({ ...res, isFolder: true });
				});
			}

			await getFileInfo?.(item.id, true).then((res) => {
				openItemAction!({ ...res });
			});

			if ("viewAccessibility" in item) {
				const isMedia =
					(item?.viewAccessibility as { ImageView: boolean })?.ImageView ||
					(item?.viewAccessibility as { MediaView: boolean })?.MediaView;
				if (isMedia) {
					return window.open(
						combineUrl(
							window.ClientConfig?.proxy?.url,
							config.homepage,
							MEDIA_VIEW_URL,
							item.id,
						),
					);
				}
			}
		} catch (e) {
			toastr.error(e as unknown as string);
		}
	};

	return (
		<div className={styles.historyBlockFilesList}>
			{sortItems.map((item, index) => {
				if (!isExpanded && index > EXPANSION_THRESHOLD - 1) return null;
				return (
					<Fragment key={item.feedId}>
						<div className={styles.historyBlockFile}>
							{actionType === "changeIndex" ? (
								<div className="change-index">
									<div className="index old-index"> {item.oldIndex}</div>

									<SortDesc className="arrow-index" />
									<div className="index"> {item.newIndex} </div>
								</div>
							) : null}

							<div
								className="item-wrapper"
								onClick={() => handleOpenFile(item)}
								data-testid={`history_item_${index}`}
							>
								<ReactSVG
									className="icon"
									src={
										(getInfoPanelItemIcon!(
											item as unknown as TRoom | TFile | TFolder,
											24,
										) as string) ?? ""
									}
								/>

								<div className="item-title">
									{item.title ? (
										<>
											<span className="name" key="hbil-item-name">
												{item.title}
											</span>
											{item.fileExst ? (
												<span className="exst" key="hbil-item-exst">
													{item.fileExst}
												</span>
											) : null}
										</>
									) : (
										<span className="name">{item.fileExst}</span>
									)}
								</div>
							</div>
							{isDisabledOpenLocationButton ? (
								<IconButton
									className="location-btn"
									iconName={FolderLocationReactSvgUrl}
									size={16}
									isFill
									onClick={() => checkAndOpenLocationAction!(item)}
									title={t("Files:OpenLocation")}
									dataTestId={`history_item_location_${index}`}
								/>
							) : null}
						</div>

						{actionType === "rename" && oldItem ? (
							<div className={styles.historyBlockFile}>
								<div className="old-item-wrapper">
									<ReactSVG
										className="icon"
										src={
											(getInfoPanelItemIcon!(
												item as unknown as TRoom | TFile | TFolder,
												24,
											) as string) ?? ""
										}
									/>
									<div className="item-title old-item-title">
										{oldItem.title ? (
											<>
												<span className="name" key="hbil-item-name">
													{oldItem.title}
												</span>
												{oldItem.fileExst ? (
													<span className="exst" key="hbil-item-exst">
														{oldItem.fileExst}
													</span>
												) : null}
											</>
										) : (
											<span className="name">{oldItem.fileExst}</span>
										)}
									</div>
								</div>
							</div>
						) : null}
					</Fragment>
				);
			})}
			{isExpandable && !isExpanded ? (
				<div
					className={classNames(
						styles.historyBlockExpandLink,
						styles.filesListExpandLink,
					)}
					onClick={onExpand}
					data-testid="history_expand_more"
				>
					<Trans
						t={t as TFunction}
						ns="InfoPanel"
						i18nKey="AndMoreLabel"
						values={{ count: items.length - EXPANSION_THRESHOLD }}
						components={{ 1: <strong key={"count-more"} /> }}
					/>
				</div>
			) : null}
		</div>
	);
};

export default inject<TStore>(
	({ infoPanelStore, filesActionsStore, filesStore, selectedFolderStore }) => {
		const { getInfoPanelItemIcon } = infoPanelStore;

		const { getFileInfo, getFolderInfo } = filesStore;

		const { nameWithoutExtension, checkAndOpenLocationAction, openItemAction } =
			filesActionsStore;

		return {
			selectedFolderId: selectedFolderStore.id,

			getInfoPanelItemIcon,
			nameWithoutExtension,
			checkAndOpenLocationAction,
			openItemAction,
			getFileInfo,
			getFolderInfo,
		};
	},
)(observer(HistoryItemList));
