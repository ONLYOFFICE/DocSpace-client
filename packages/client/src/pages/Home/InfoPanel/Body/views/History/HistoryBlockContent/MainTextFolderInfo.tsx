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
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import classNames from "classnames";

import { TTranslation } from "@docspace/shared/types";
import { FolderType } from "@docspace/shared/enums";
import { FeedAction } from "@docspace/shared/api/rooms/types";
import { TooltipContainer } from "@docspace/ui-kit/components/tooltip";

import { Feed } from "./HistoryBlockContent.types";
import styles from "../History.module.scss";

type HistoryMainTextFolderInfoProps = {
  t: TTranslation;
  feed: Feed;
  selectedFolderId?: number;
  actionType: string;
};

const HistoryMainTextFolderInfo = ({
  t,
  feed,
  actionType,
  selectedFolderId,
}: HistoryMainTextFolderInfoProps) => {
  const {
    parentId,
    toFolderId,
    parentTitle,
    parentType,
    fromParentType,
    fromParentTitle,
    id,
    title,
  } = feed.data;

  const isStartedFilling = actionType === FeedAction.StartedFilling;
  const isSubmitted = actionType === FeedAction.Submitted;
  const isReorderFolder = actionType === FeedAction.Reorder && id !== parentId;

  if (
    (parentId === selectedFolderId && !isReorderFolder) ||
    toFolderId === selectedFolderId ||
    (selectedFolderId === id && isReorderFolder)
  )
    return null;

  if (!parentTitle) return null;

  const isSection = parentType === FolderType.USER;
  const isFolder =
    parentType === FolderType.DEFAULT ||
    parentType === FolderType.Knowledge ||
    parentType === FolderType.ResultStorage ||
    isSubmitted ||
    isStartedFilling ||
    isReorderFolder;

  const isFromFolder = fromParentType === FolderType.DEFAULT;

  const destination = isFolder
    ? t("FeedLocationLabel", {
        folderTitle: isReorderFolder ? title! : parentTitle,
      })
    : isSection
      ? t("FeedLocationSectionLabel", { folderTitle: parentTitle })
      : t("FeedLocationRoomLabel", { folderTitle: parentTitle });

  const sourceDestination = isFromFolder
    ? t("FeedLocationLabelFrom", { folderTitle: fromParentTitle })
    : t("FeedLocationRoomLabel", { folderTitle: parentTitle });

  const className = isFromFolder ? "source-folder-label" : "folder-label";

  return (
    <span className={classNames("message", styles.historyBlockMessage)}>
      <TooltipContainer
        as="span"
        className={className}
        title={isFromFolder ? fromParentTitle : parentTitle}
      >
        {` ${isFromFolder ? sourceDestination : destination}`}
      </TooltipContainer>
    </span>
  );
};

export default inject<TStore>(({ selectedFolderStore }) => ({
  selectedFolderId: selectedFolderStore.id,
}))(
  withTranslation(["InfoPanel", "Common", "Translations"])(
    observer(HistoryMainTextFolderInfo),
  ),
);
