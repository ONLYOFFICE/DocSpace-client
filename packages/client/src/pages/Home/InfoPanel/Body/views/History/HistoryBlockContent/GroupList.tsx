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
import { useNavigate } from "react-router";
import { decode } from "he";
import { inject, observer } from "mobx-react";
import { Trans, useTranslation } from "react-i18next";
import classNames from "classnames";

import { Link } from "@docspace/ui-kit/components/link";
import { Text } from "@docspace/ui-kit/components/text";
import { TFeedAction, TFeedData } from "@docspace/shared/api/rooms/types";

import SelectedFolderStore from "SRC_DIR/store/SelectedFolderStore";
import UsersStore from "SRC_DIR/store/contacts/UsersStore";
import FilesStore from "SRC_DIR/store/FilesStore";

import styles from "../History.module.scss";

const EXPANSION_THRESHOLD = 8;

interface HistoryGroupListProps {
  feed: TFeedAction<TFeedData>;

  isVisitor?: boolean;
  isCollaborator?: boolean;

  setPeopleSelection?: UsersStore["setSelection"];
  setPeopleBufferSelection?: UsersStore["setBufferSelection"];
  setFilesSelection?: FilesStore["setSelection"];
  setFilesBufferSelection?: FilesStore["setBufferSelection"];
  setSelectedFolder?: SelectedFolderStore["setSelectedFolder"];

  withWrapping?: boolean;
}

const HistoryGroupList = ({
  feed,
  isVisitor,
  isCollaborator,
  setPeopleSelection,
  setPeopleBufferSelection,
  setFilesSelection,
  setFilesBufferSelection,
  setSelectedFolder,
  withWrapping,
}: HistoryGroupListProps) => {
  const { t } = useTranslation(["InfoPanel"]);

  const navigate = useNavigate();

  const [isExpanded, setIsExpanded] = useState(
    1 + feed.related.length <= EXPANSION_THRESHOLD,
  );
  const onExpand = () => setIsExpanded(true);

  const groupsData = [
    feed.data,
    ...feed.related.map((relatedFeed) => relatedFeed.data),
  ];

  const onGroupClick = (groupId: string) => {
    setSelectedFolder?.(null);
    setPeopleSelection?.([]);
    setPeopleBufferSelection?.(null);
    setFilesSelection?.([]);
    setFilesBufferSelection?.(null);
    navigate(`/accounts/groups/${groupId}/filter`);
  };

  return (
    <>
      {groupsData.map(({ group }, i) => {
        if (!isExpanded && i > EXPANSION_THRESHOLD - 1) return null;
        const withComma = !isExpanded
          ? i < EXPANSION_THRESHOLD - 1
          : i < groupsData.length - 1;

        if (!group) return null;

        return (
          <div
            className={styles.historyLink}
            key={group.id}
            style={
              withWrapping ? { display: "inline", wordBreak: "break-all" } : {}
            }
            data-testid={`history_group_${i}`}
          >
            {isVisitor || isCollaborator ? (
              <Text as="span" className="text" fontWeight={600}>
                {decode(group.name)}
              </Text>
            ) : (
              <Link
                className={classNames("text link", styles.groupLink, {
                  [styles.notClickable]: group.isSystem,
                })}
                onClick={
                  group.isSystem ? undefined : () => onGroupClick(group.id)
                }
                style={
                  withWrapping ? { display: "inline", textWrap: "wrap" } : {}
                }
                dataTestId={`history_group_link_${i}`}
                noHover={group.isSystem}
              >
                {decode(group.name)}
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
          data-testid="history_groups_expand_more"
        >
          <Trans
            t={t as TFunction}
            ns="InfoPanel"
            i18nKey="AndMoreLabel"
            values={{ count: groupsData.length - EXPANSION_THRESHOLD }}
            components={{ 1: <strong /> }}
          />
        </div>
      ) : null}
    </>
  );
};

export default inject<TStore>(
  ({ userStore, peopleStore, filesStore, selectedFolderStore }) => {
    return {
      isVisitor: userStore.user!.isVisitor,
      isCollaborator: userStore.user!.isCollaborator,
      setPeopleSelection: peopleStore.usersStore.setSelection,
      setPeopleBufferSelection: peopleStore.usersStore.setBufferSelection,
      setFilesSelection: filesStore.setSelection,
      setFilesBufferSelection: filesStore.setBufferSelection,
      setSelectedFolder: selectedFolderStore.setSelectedFolder,
    };
  },
)(observer(HistoryGroupList));
