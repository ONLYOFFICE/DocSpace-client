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

import { useState } from "react";
import { TFunction } from "i18next";

import { inject, observer } from "mobx-react";
import { Trans, useTranslation } from "react-i18next";
import { decode } from "he";
import classNames from "classnames";

import { Link } from "@docspace/shared/components/link";
import { Text } from "@docspace/shared/components/text";

import { RoomMember, TFeedAction } from "@docspace/shared/api/rooms/types";

import InfoPanelStore from "SRC_DIR/store/InfoPanelStore";

import styles from "../History.module.scss";

const EXPANSION_THRESHOLD = 8;

interface HistoryUserListProps {
  feed: TFeedAction<RoomMember>;
  openUser?: InfoPanelStore["openUser"];

  isVisitor?: boolean;
  isCollaborator?: boolean;
  withWrapping?: boolean;
}

const HistoryUserList = ({
  feed,
  openUser,
  isVisitor,
  isCollaborator,
  withWrapping,
}: HistoryUserListProps) => {
  const { t } = useTranslation(["InfoPanel"]);

  const [isExpanded, setIsExpanded] = useState(
    feed.related.length + 1 <= EXPANSION_THRESHOLD,
  );
  const onExpand = () => setIsExpanded(true);

  const usersData = [
    feed.data,
    ...feed.related.map((relatedFeed) => relatedFeed.data),
  ];

  return (
    <>
      {usersData.map(({ user }, i) => {
        if (!isExpanded && i > EXPANSION_THRESHOLD - 1) return null;
        const withComma = !isExpanded
          ? i < EXPANSION_THRESHOLD - 1
          : i < usersData.length - 1;

        const userName = decode(user.displayName);

        return (
          <div
            key={user.id}
            className={styles.historyLink}
            style={
              withWrapping ? { display: "inline", wordBreak: "break-all" } : {}
            }
            data-testid={`history_user_${i}`}
          >
            {isVisitor || isCollaborator ? (
              <Text as="span" className="text">
                {userName}
              </Text>
            ) : (
              <Link
                className="text link"
                onClick={() => openUser!(user)}
                style={
                  withWrapping ? { display: "inline", textWrap: "wrap" } : {}
                }
                title={userName}
                dataTestId={`history_user_link_${i}`}
              >
                {userName}
              </Link>
            )}

            {withComma ? "," : null}
            {feed.related.length > 0 ? <div className="space" /> : null}
          </div>
        );
      })}

      {!isExpanded ? (
        <div
          className={classNames(
            styles.historyBlockExpandLink,
            styles.userListExpandLink,
          )}
          onClick={onExpand}
          data-testid="history_users_expand_more"
        >
          <Trans
            t={t as TFunction}
            ns="InfoPanel"
            i18nKey="AndMoreLabel"
            values={{ count: usersData.length - EXPANSION_THRESHOLD }}
            components={{ 1: <strong /> }}
          />
        </div>
      ) : null}
    </>
  );
};

export default inject<TStore>(({ infoPanelStore, userStore }) => ({
  openUser: infoPanelStore.openUser,

  isVisitor: userStore?.user?.isVisitor,
  isCollaborator: userStore?.user?.isCollaborator,
}))(observer(HistoryUserList));
