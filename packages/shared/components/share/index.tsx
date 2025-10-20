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
  } = props;

  // HACK: Hide share option for rooms — remove after implementation is ready
  const disabledSharedUser =
    infoPanelSelection.rootFolderType === FolderType.Rooms;

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
