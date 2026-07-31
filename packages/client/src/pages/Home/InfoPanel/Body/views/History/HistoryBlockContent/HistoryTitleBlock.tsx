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

import { useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { classNames } from "@docspace/shared/utils";
import { getCookie } from "@docspace/ui-kit/utils/cookie";
import {
  TFeedAction,
  TFeedData,
  RoomMember,
} from "@docspace/shared/api/rooms/types";
import { LANGUAGE } from "@docspace/shared/constants";
import { formatDateLocalized, parseToDateTime } from "@docspace/ui-kit/utils/date";

import { useFeedTranslation } from "../hooks/useFeedTranslation";

import { getFeedInfo } from "../FeedInfo";
import HistoryUserList from "./UserList";
import HistoryGroupList from "./GroupList";
import HistoryRoomExternalLink from "./RoomExternalLink";
import HistoryMainTextFolderInfo from "./MainTextFolderInfo";

const getDateTime = (date: Date | string) => {
  const locale = getCookie(LANGUAGE) || "en";
  const dt = parseToDateTime(date);
  if (!dt) return "";
  return formatDateLocalized(dt, "TIME_SIMPLE", { locale });
};

const HistoryTitleBlock = ({
  feed,
}: {
  feed: TFeedAction<TFeedData | RoomMember>;
}) => {
  const { t } = useTranslation(["InfoPanel", "Common", "Translations"]);

  const hasRelatedItems = feed.related.length > 0;

  const { getFeedTranslation } = useFeedTranslation(feed, hasRelatedItems);

  const feedInfo = getFeedInfo(feed);

  if (!feedInfo) return null;

  const { actionType, targetType } = feedInfo;

  const isDisplayFolderInfo =
    ((targetType === "file" || targetType === "folder") &&
      actionType !== "delete") ||
    actionType === "reorderIndex";

  return (
    <div
      className={classNames("title", {
        "without-break": targetType === "group",
      })}
    >
      {targetType === "user" && actionType === "update" ? (
        <HistoryUserList feed={feed as TFeedAction<RoomMember>} />
      ) : null}

      {targetType === "group" && actionType === "update" ? (
        <>
          {t("Common:Group")}
          <HistoryGroupList feed={feed as TFeedAction<TFeedData>} />
        </>
      ) : null}

      <div className="action-title">
        <Text
          as="span"
          className={classNames("action-title-text", {
            "text-combined":
              isDisplayFolderInfo ||
              targetType === "group" ||
              targetType === "user" ||
              (targetType === "roomExternalLink" && actionType === "create"),
          })}
        >
          {getFeedTranslation()}
        </Text>
        {isDisplayFolderInfo ? (
          <HistoryMainTextFolderInfo feed={feed} actionType={actionType} />
        ) : null}
        {feed.related.length === 0 &&
        targetType === "group" &&
        actionType !== "update" ? (
          <HistoryGroupList
            feed={feed as TFeedAction<TFeedData>}
            withWrapping
          />
        ) : null}

        {feed.related.length === 0 &&
        targetType === "user" &&
        actionType !== "update" ? (
          <HistoryUserList
            feed={feed as TFeedAction<RoomMember>}
            withWrapping
          />
        ) : null}
        {targetType === "roomExternalLink" && actionType === "create" ? (
          <HistoryRoomExternalLink
            feedData={feed.data as TFeedData}
            withWrapping
          />
        ) : null}
      </div>

      <Text className="date">{getDateTime(feed.date)}</Text>
    </div>
  );
};

export default HistoryTitleBlock;
