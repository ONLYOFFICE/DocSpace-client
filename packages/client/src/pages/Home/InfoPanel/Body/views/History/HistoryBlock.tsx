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

import classNames from "classnames";

import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/shared/components/avatar";

import AtReactSvgUrl from "PUBLIC_DIR/images/@.react.svg?url";
import DefaultUserAvatarSmall from "PUBLIC_DIR/images/default_user_photo_size_32-32.png";

import {
  TFeedAction,
  TFeedData,
  RoomMember,
} from "@docspace/shared/api/rooms/types";

import HistoryTitleBlock from "./HistoryBlockContent/HistoryTitleBlock";
import HistoryBlockContent from "./HistoryBlockContent";
import styles from "./History.module.scss";

type HistoryBlockProps = {
  feed: TFeedAction<TFeedData | RoomMember>;
  isLastEntity: boolean;
  dataTestId?: string;
};

const HistoryBlock = ({
  feed,
  isLastEntity,
  dataTestId,
}: HistoryBlockProps) => {
  const { initiator, date } = feed;

  return (
    <div
      className={classNames(date, styles.historyBlock, {
        [styles.withBottomDivider]: !isLastEntity,
      })}
      data-testid={dataTestId ?? "history_block"}
    >
      <Avatar
        role={AvatarRole.user}
        className="avatar"
        size={AvatarSize.min}
        userName={initiator.displayName}
        source={
          initiator.hasAvatar
            ? initiator.avatar
            : DefaultUserAvatarSmall ||
              (initiator.displayName ? "" : initiator.email && AtReactSvgUrl)
        }
      />
      <div className="info">
        <HistoryTitleBlock feed={feed} />
        <HistoryBlockContent feed={feed} />
      </div>
    </div>
  );
};

export default HistoryBlock;
