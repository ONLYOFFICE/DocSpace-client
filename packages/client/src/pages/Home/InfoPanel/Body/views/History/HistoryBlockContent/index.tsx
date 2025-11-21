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

import { inject, observer } from "mobx-react";

import {
  TFeedAction,
  TFeedData,
  RoomMember,
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
  const { actionType, targetType } = getFeedInfo(feed);

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
