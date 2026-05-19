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

import { useState } from "react";
import { TFunction } from "i18next";

import { inject, observer } from "mobx-react";
import { Trans, useTranslation } from "react-i18next";
import { decode } from "he";
import classNames from "classnames";

import SortDesc from "PUBLIC_DIR/images/sort.desc.react.svg";

import { Link } from "@docspace/ui-kit/components/link";
import { Text } from "@docspace/ui-kit/components/text";
import { TUser } from "@docspace/shared/api/people/types";

import {
  RoomMember,
  TFeedAction,
  FeedActionKeys,
} from "@docspace/shared/api/rooms/types";

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

  const usersData = [feed, ...feed.related];

  return (
    <>
      {usersData.map(({ id, data: member, action }, i) => {
        if (!isExpanded && i > EXPANSION_THRESHOLD - 1) return null;
        const withComma = !isExpanded
          ? i < EXPANSION_THRESHOLD - 1
          : i < usersData.length - 1;

        const user: TUser | null =
          "user" in member ? (member.user as TUser) : null;

        const isChangeOwnerAction =
          action.key === FeedActionKeys.RoomChangeOwner;

        if (isChangeOwnerAction) {
          const currentOwner: TUser | null =
            "owner" in member ? (member.owner as TUser) : null;
          const oldOwner: TUser | null =
            "oldOwner" in member ? (member.oldOwner as TUser) : null;

          if (!currentOwner || !oldOwner) return;

          const ownerName = decode(currentOwner?.displayName);
          const oldOwnerName = decode(oldOwner?.displayName);

          return (
            <div
              key={id}
              data-testid={`history_user_${i}`}
              className={styles.historyUserLink}
            >
              <Link
                className="text link"
                onClick={() => openUser!(oldOwner)}
                title={oldOwnerName}
                dataTestId={`history_user_link_${i}`}
              >
                {oldOwnerName}
              </Link>
              <div className="arrow-wrapper">
                <SortDesc className="arrow-index" />
              </div>
              <Link
                className="text link"
                onClick={() => openUser!(currentOwner)}
                title={ownerName}
                dataTestId={`history_user_link_${i}`}
              >
                {ownerName}
              </Link>
            </div>
          );
        }

        if (!user) return;

        const userName = decode(user?.displayName);

        return (
          <div
            key={id}
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
            components={{ 1: <strong key="count-strong" /> }}
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
