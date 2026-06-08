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

"use client";

import React from "react";
import classNames from "classnames";
import { decode } from "he";
import { useTranslation } from "react-i18next";
import { usePathname } from "next/navigation";

import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/ui-kit/components/avatar";
import { Text } from "@docspace/ui-kit/components/text";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import {
  formatDateLocalized,
  parseToDateTime,
} from "@docspace/ui-kit/utils/date";
import { getFileExtension } from "@docspace/shared/utils/common";
import { getCachedEncryptedFilename } from "@docspace/shared/services/encryption/filename-cache";
import { useFilenameCacheVersion } from "@docspace/shared/hooks/useResolvedFileTitle";
import type {
  TFeedAction,
  TFeedData,
  RoomMember,
} from "@docspace/shared/api/rooms/types";
import { FeedActionKeys } from "@docspace/shared/api/rooms/types";
import type { TUser } from "@docspace/shared/api/people/types";

import AtReactSvgUrl from "PUBLIC_DIR/images/@.react.svg?url";
import DefaultUserAvatarSmall from "PUBLIC_DIR/images/default_user_photo_size_32-32.png?url";
import FolderLocationReactSvgUrl from "PUBLIC_DIR/images/folder-location.react.svg?url";
import SortDescReactSvg from "PUBLIC_DIR/images/sort.desc.react.svg";

import useItemIcon from "@/app/(docspace)/_hooks/useItemIcon";
import useFolderActions from "@/app/(docspace)/_hooks/useFolderActions";
import { useDocsSettingsStore } from "@/app/(personal-files)/_store/DocsSettingsStore";

import { useFeedTranslation } from "./useFeedTranslation";
import { getFeedInfo } from "./FeedInfo";
import styles from "./History.module.scss";

type HistoryBlockProps = {
  feed: TFeedAction<TFeedData | RoomMember>;
  isLastEntity: boolean;
  dataTestId?: string;
};

const getDateTime = (date: Date | string, locale: string) => {
  const dt = parseToDateTime(date);
  if (!dt) return "";
  return formatDateLocalized(dt, "TIME_SIMPLE", { locale });
};

const nameWithoutExtension = (title?: string) => {
  if (!title) return "";
  const indexPoint = title.lastIndexOf(".");
  const split = title.split(".");
  return split.length <= 2 ? split[0] : title.slice(0, indexPoint);
};

const HistoryBlock = ({
  feed,
  isLastEntity,
  dataTestId,
}: HistoryBlockProps) => {
  const { t, i18n } = useTranslation(["Common"]);
  const { initiator, date } = feed;

  const docsSettingsStore = useDocsSettingsStore();
  const { getIcon } = useItemIcon({
    filesSettings: docsSettingsStore.filesSettings ?? undefined,
  });
  const { openLocation } = useFolderActions({ t });
  const pathname = usePathname();

  const hasRelatedItems = feed.related.length > 0;
  const { getFeedTranslation } = useFeedTranslation(feed, hasRelatedItems);
  const feedInfo = getFeedInfo(feed);

  const isFileOrFolder =
    feedInfo &&
    (feedInfo.targetType === "file" || feedInfo.targetType === "folder");

  useFilenameCacheVersion();

  const isFolder = feedInfo?.targetType === "folder";
  const data = (feed.data ?? {}) as TFeedData;
  const rawTitle =
    getCachedEncryptedFilename(data.id) ?? (data.title || data.newTitle || "");
  const itemTitle = nameWithoutExtension(rawTitle);
  const fileExst = isFolder ? "" : getFileExtension(rawTitle);

  const iconUrl = isFileOrFolder
    ? getIcon(isFolder ? undefined : fileExst, 24)
    : "";

  const canOpenLocation =
    isFileOrFolder && !!data.parentId && feedInfo.actionType !== "delete";

  const isChangeOwner = feed.action.key === FeedActionKeys.RoomChangeOwner;
  const memberData = (feed.data ?? {}) as unknown as {
    owner?: TUser;
    oldOwner?: TUser;
  };
  const oldOwner = isChangeOwner ? memberData.oldOwner : undefined;
  const newOwner = isChangeOwner ? memberData.owner : undefined;

  const onOpenLocation = () => {
    if (!data.parentId) return;

    const section = pathname?.split("/")[1] ?? "";
    const targetPath = ["rooms", "archive"].includes(section)
      ? `/${section}/${data.parentId}`
      : undefined;

    openLocation(data.parentId, data.id, itemTitle, targetPath);
  };

  return (
    <div
      className={classNames(styles.historyBlock, {
        [styles.withBottomDivider]: !isLastEntity,
      })}
      data-testid={dataTestId ?? "history_block"}
    >
      <Avatar
        role={AvatarRole.user}
        className="avatar"
        size={AvatarSize.min}
        userName={initiator.displayName ?? ""}
        source={
          initiator.hasAvatar
            ? initiator.avatar
            : DefaultUserAvatarSmall ||
              (initiator.displayName ? "" : initiator.email && AtReactSvgUrl)
        }
      />
      <div className="info">
        <div className="title">
          <div className="action-title">
            <Text as="span" className="action-title-text">
              {getFeedTranslation()}
            </Text>
          </div>
          <Text className="date">{getDateTime(date, i18n.language)}</Text>
        </div>
        {isChangeOwner && oldOwner && newOwner ? (
          <div className={styles.historyChangeOwner}>
            <Text as="span" className="name" title={oldOwner.displayName ?? ""}>
              {decode(oldOwner.displayName ?? "")}
            </Text>
            <SortDescReactSvg className="arrow" />
            <Text as="span" className="name" title={newOwner.displayName ?? ""}>
              {decode(newOwner.displayName ?? "")}
            </Text>
          </div>
        ) : null}
        <span className={classNames("message", styles.historyBlockMessage)}>
          <span className="main-message">
            <Text className="name">
              {initiator?.isAnonim
                ? t("Common:Anonymous")
                : decode(initiator.displayName ?? "")}
            </Text>
          </span>
        </span>
        {isFileOrFolder && itemTitle ? (
          <div className={styles.historyBlockFilesList}>
            <div className={styles.historyBlockFile}>
              <div className="item-wrapper">
                {iconUrl ? (
                  // biome-ignore lint/performance/noImgElement: static SVG via image-helpers
                  <img className="icon" src={iconUrl} alt="" />
                ) : null}
                <div className="item-title">
                  <span className="name">{itemTitle}</span>
                  {fileExst ? <span className="exst">{fileExst}</span> : null}
                </div>
              </div>
              {canOpenLocation ? (
                <IconButton
                  className="location-btn"
                  iconName={FolderLocationReactSvgUrl}
                  size={16}
                  isFill
                  onClick={onOpenLocation}
                  title={t("Common:OpenLocation")}
                  dataTestId="history_item_location"
                />
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default HistoryBlock;

