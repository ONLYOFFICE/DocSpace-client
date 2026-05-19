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
import classNames from "classnames";
import { useTranslation } from "react-i18next";

import { FolderType } from "../../enums";
import ShareLoader from "../../skeletons/share";

import type { ShareProps } from "./Share.types";
import styles from "./Share.module.scss";

import List from "./sub-components/List";
import { useShare } from "./hooks/useShare";
import ShareInfoBar from "./sub-components/ShareInfoBar";
import { useMembers } from "./hooks/useMembers";

const Share = (props: ShareProps) => {
  const {
    setView,
    infoPanelSelection,
    selfId,
    shareChanged,
    setShareChanged,
    onOpenPanel,
    onlyOneLink,
    setIsScrollLocked,
    setEditLinkPanelIsVisible,
    setLinkParams,
    setEmbeddingPanelData,
    fileLinkProps,
    members,
    shareMembersTotal = 0,
    isEditor = false,
    onAddUser,
    onClickGroup,
    disabledSharedUser: disabledSharedUserProp,
    hideLinkTypeSelector,
  } = props;

  // HACK: Hide share option for rooms — remove after implementation is ready
  const disabledSharedUser =
    disabledSharedUserProp ||
    infoPanelSelection.rootFolderType === FolderType.Rooms ||
    infoPanelSelection.rootFolderType === FolderType.AIAgents;

  const isFolder = infoPanelSelection.isFolder;
  const parentShared = infoPanelSelection.parentShared;
  const hideSharePanel = !infoPanelSelection?.canShare;

  const { t } = useTranslation(["Common"]);

  const [isLoading, setIsLoading] = useState(!fileLinkProps && !members);

  const { getLinkElements } = useShare({
    infoPanelSelection,
    setEditLinkPanelIsVisible,
    setIsLoading,
    setLinkParams,
    fileLinkProps,
    onlyOneLink,
    onOpenPanel,
    setEmbeddingPanelData,
    setIsScrollLocked,
    setShareChanged,
    setView,
    shareChanged,
    hideLinkTypeSelector,
  });

  const links = getLinkElements();

  const {
    getUsers,
    total,
    fetchMoreShareMembers,
    isLoading: isLoadingMembers,
  } = useMembers({
    members,
    selfId,
    shareMembersTotal,
    infoPanelSelection,
    linksCount: links.length,
    onAddUser,
    disabledSharedUser,
    onClickGroup,
  });

  if (hideSharePanel) return null;

  const { content, headersCount } = getUsers();

  return (
    <div
      className={classNames({
        [styles.shareContainer]: isEditor,
      })}
      data-testid="shared-links"
    >
      <ShareInfoBar
        t={t}
        selfId={selfId}
        isFolder={isFolder}
        parentShared={parentShared}
        isEditor={isEditor}
      />
      {isLoading || isLoadingMembers ? (
        <ShareLoader t={t} />
      ) : (
        <div className={styles.links}>
          <List
            hasNextPage={content.length - headersCount < total}
            itemCount={links.length + headersCount + total}
            linksBlockLength={links.length}
            loadNextPage={fetchMoreShareMembers}
            withoutTitlesAndLinks={false}
          >
            {links}
            {content}
          </List>
        </div>
      )}
    </div>
  );
};

export default Share;
