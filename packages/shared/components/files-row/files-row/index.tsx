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

import React, { type PropsWithChildren } from "react";
import classNames from "classnames";

import { Row } from "../../rows";

import { FilesRowProps } from "./FilesRow.types";
import styles from "./FilesRow.module.scss";

export const FilesRow = (props: PropsWithChildren<FilesRowProps>) => {
  const {
    className,
    isThirdPartyFolder,
    checked,
    isActive,
    isFirstElem,
    isIndexUpdated,
    isDragging,
    showHotkeyBorder,
    isHighlight,
    canDrag,
    isEdit,
    folderCategory,
    withAccess,
    inProgress,
    contextOptions,
  } = props;

  const classes = classNames(styles.filesRow, className, {
    [styles.isThirdPartyFolder]: isThirdPartyFolder,
    [styles.isActive]: isActive,
    [styles.isFirstElem]: isFirstElem,
    [styles.isIndexUpdated]: isIndexUpdated,
    [styles.isDragging]: isDragging,
    [styles.showHotkeyBorder]: showHotkeyBorder,
    [styles.isHighlight]: isHighlight,
    [styles.canDrag]: canDrag,
    [styles.isEdit]: isEdit,
    [styles.folderCategory]: folderCategory,
    [styles.withAccess]: withAccess,
    [styles.inProgress]: inProgress,
    [styles.palmCursor]:
      canDrag && (checked || isActive) && !isThirdPartyFolder,
    [styles.hideLastDiv]: !contextOptions || isEdit,
  });

  return <Row {...props} className={classes} />;
};
