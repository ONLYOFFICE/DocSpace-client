// (c) Copyright Ascensio System SIA 2009-2024
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

import React from "react";
import AtReactSvgUrl from "PUBLIC_DIR/images/@.react.svg?url";
import { Avatar } from "@docspace/shared/components/avatar";
import { Text } from "@docspace/shared/components/text";
import HistoryBlockMessage from "./HistoryBlockMessage";
import HistoryBlockItemList from "./HistoryBlockItemList";
import HistoryBlockUser from "./HistoryBlockUser";
import { FeedItemTypes } from "@docspace/shared/enums";
import DefaultUserAvatarSmall from "PUBLIC_DIR/images/default_user_photo_size_32-32.png";
import { StyledHistoryBlock } from "../../styles/history";
import { getDateTime } from "../../helpers/HistoryHelper";
import { decode } from "he";

const HistoryBlock = ({
  t,
  selectionIsFile,
  feed,
  selectedFolder,
  infoPanelSelection,
  getInfoPanelItemIcon,
  checkAndOpenLocationAction,
  openUser,
  isVisitor,
  isCollaborator,
  withFileList,
  isLastEntity,
}) => {
  const { target, initiator, json, groupedFeeds } = feed;

  const users = [target, ...groupedFeeds].filter(
    (user, index, self) =>
      self.findIndex((user2) => user2?.id === user?.id) === index,
  );

  const isUserAction = json.Item === FeedItemTypes.User && target;
  const isItemAction =
    json.Item === FeedItemTypes.File || json.Item === FeedItemTypes.Folder;

  const userAvatar = initiator.hasAvatar
    ? initiator.avatarSmall
    : DefaultUserAvatarSmall;

  return (
    <StyledHistoryBlock
      withBottomDivider={!isLastEntity}
      isUserAction={isUserAction}
    >
      <Avatar
        role="user"
        className="avatar"
        size="min"
        source={
          userAvatar ||
          (initiator.displayName ? "" : initiator.email && AtReactSvgUrl)
        }
        userName={initiator.displayName}
      />
      <div className="info">
        <div className="title">
          <Text className="name">{decode(initiator.displayName)}</Text>
          {initiator.isOwner && (
            <Text className="secondary-info">
              {t("Common:Owner").toLowerCase()}
            </Text>
          )}
          <Text className="date">{getDateTime(json.ModifiedDate)}</Text>
        </div>

        <HistoryBlockMessage
          t={t}
          className="message"
          action={json}
          groupedActions={groupedFeeds}
          selectedFolder={selectedFolder}
          infoPanelSelection={infoPanelSelection}
        />

        {isItemAction && withFileList && (
          <HistoryBlockItemList
            t={t}
            items={[json, ...groupedFeeds]}
            getInfoPanelItemIcon={getInfoPanelItemIcon}
            checkAndOpenLocationAction={checkAndOpenLocationAction}
          />
        )}

        {isUserAction &&
          users.map((user, i) => (
            <HistoryBlockUser
              isVisitor={isVisitor}
              isCollaborator={isCollaborator}
              key={user.id}
              user={user}
              withComma={i < users.length - 1}
              openUser={openUser}
            />
          ))}
      </div>
    </StyledHistoryBlock>
  );
};

export default HistoryBlock;
