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

import { inject, observer } from "mobx-react";

import {
  TFeedAction,
  TFeedData,
  RoomMember,
  FeedActionKeys,
} from "@docspace/shared/api/rooms/types";

import HistoryUserList from "./UserList";
import HistoryMainText from "./MainText";
import HistoryItemList from "./ItemList";
import HistoryGroupList from "./GroupList";
import HistoryUserGroupRoleChange from "./UserGroupRoleChange";
import HistoryRoomTagList from "./RoomTagList";
import { getFeedInfo } from "../FeedInfo";

type HistoryBlockContentProps = {
  feed: TFeedAction<TFeedData | RoomMember>;
  historyWithFileList?: boolean;
};

const HistoryBlockContent = ({
  feed,
  historyWithFileList,
}: HistoryBlockContentProps) => {
  const feedInfo = getFeedInfo(feed);

  if (!feedInfo) return null;

  const { actionType, targetType } = feedInfo;

  return (
    <div className="info-panel_history-block">
      {(targetType === "user" || targetType === "group") &&
      actionType === "update" ? (
        <HistoryUserGroupRoleChange feed={feed as TFeedAction<RoomMember>} />
      ) : null}

      <HistoryMainText feed={feed} />

      {(targetType === "file" || targetType === "folder") &&
      (actionType === "rename" ||
        historyWithFileList ||
        actionType === "changeIndex") ? (
        <HistoryItemList
          feed={feed as TFeedAction<TFeedData>}
          actionType={actionType}
          targetType={targetType}
        />
      ) : null}

      {feed.related.length > 0 &&
      targetType === "group" &&
      actionType !== "update" ? (
        <HistoryGroupList feed={feed as TFeedAction<TFeedData>} />
      ) : null}

      {feed.related.length > 0 &&
      targetType === "user" &&
      actionType !== "update" ? (
        <HistoryUserList feed={feed as TFeedAction<RoomMember>} />
      ) : null}

      {targetType === "roomTag" ? (
        <HistoryRoomTagList
          feed={feed as TFeedAction<TFeedData>}
          actionType={actionType}
        />
      ) : null}
    </div>
  );
};

export default inject<TStore>(({ infoPanelStore }) => {
  const { historyWithFileList } = infoPanelStore;
  return { historyWithFileList };
})(observer(HistoryBlockContent));
