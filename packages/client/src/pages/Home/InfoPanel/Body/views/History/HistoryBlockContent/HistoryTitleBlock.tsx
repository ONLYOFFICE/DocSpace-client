// (c) Copyright Ascensio System SIA 2009-2025
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

import { useTranslation } from "react-i18next";
import moment from "moment";

import { Text } from "@docspace/shared/components/text";
import { classNames, getCookie } from "@docspace/shared/utils";
import {
  TFeedAction,
  TFeedData,
  RoomMember,
} from "@docspace/shared/api/rooms/types";
import { LANGUAGE } from "@docspace/shared/constants";

import { useFeedTranslation } from "../hooks/useFeedTranslation";

import { getFeedInfo } from "../FeedInfo";
import HistoryUserList from "./UserList";
import HistoryGroupList from "./GroupList";
import HistoryRoomExternalLink from "./RoomExternalLink";
import HistoryMainTextFolderInfo from "./MainTextFolderInfo";

const getDateTime = (date: Date | string) => {
  moment.locale(getCookie(LANGUAGE));

  const given = moment(date);
  return given.format("LT");
};

const HistoryTitleBlock = ({
  feed,
}: {
  feed: TFeedAction<TFeedData | RoomMember>;
}) => {
  const { t } = useTranslation(["InfoPanel", "Common", "Translations"]);

  const { actionType, targetType } = getFeedInfo(feed);

  const hasRelatedItems = feed.related.length > 0;

  const { getFeedTranslation } = useFeedTranslation(feed, hasRelatedItems);

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
