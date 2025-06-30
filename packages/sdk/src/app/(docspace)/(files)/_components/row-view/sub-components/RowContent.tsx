/*
 * (c) Copyright Ascensio System SIA 2009-2025
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

"use client";

import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { useTheme } from "styled-components";

import { Link, LinkTarget, LinkType } from "@docspace/shared/components/link";
import { Text } from "@docspace/shared/components/text";
import { FilesRowContent } from "@docspace/shared/components/files-row";
import { getFileTypeName } from "@docspace/shared/utils/getFileType";
import getCorrectDate from "@docspace/shared/utils/getCorrectDate";
import { SortByFieldName } from "@docspace/shared/enums";

import useFolderActions from "@/app/(docspace)/_hooks/useFolderActions";
import useFilesActions from "@/app/(docspace)/_hooks/useFilesActions";

import getTitleWithoutExt from "../../../../_utils/get-title-without-ext";

import { RowContentProps } from "../RowView.types";
import styles from "../RowView.module.scss";

const RowContent = observer(
  ({
    item,
    filterSortBy,
    timezone,
    displayFileExtension,
    badgesComponent,
  }: RowContentProps) => {
    const { title, createdBy, created, updated } = item;

    const theme = useTheme();
    const { t, i18n } = useTranslation(["Common"]);

    const { openFolder } = useFolderActions({ t });
    const { openFile } = useFilesActions({ t });

    const titleWithoutExt =
      "fileExst" in item ? getTitleWithoutExt(title, item.fileExst) : title;

    const getContentComponent = () => {
      switch (filterSortBy) {
        case SortByFieldName.Size:
          if ("contentLength" in item) return item.contentLength;
          return "";
        case SortByFieldName.Author:
          return createdBy.displayName;
        case SortByFieldName.CreationDate:
          return getCorrectDate(
            i18n.language || "",
            created,
            "L",
            "LT",
            timezone ?? "UTC",
          );
        case SortByFieldName.Tags:
          return "";
        case SortByFieldName.Type:
          return getFileTypeName("fileType" in item ? item.fileType : "", t);
        case SortByFieldName.UsedSpace:
          return "";
        default:
          return getCorrectDate(
            i18n.language || "",
            updated,
            "L",
            "LT",
            timezone ?? "UTC",
          );
      }
    };

    const mainInfo = getContentComponent();

    return (
      <FilesRowContent sideColor={theme.filesSection.rowView.sideColor}>
        <Link
          className="row-content-link"
          type={LinkType.page}
          title={title}
          fontWeight="600"
          fontSize="15px"
          target={LinkTarget.blank}
          onClick={
            item.isFolder
              ? () => openFolder(item.id, item.title)
              : () => openFile(item)
          }
          isTextOverflow
          dir="auto"
          truncate
        >
          {titleWithoutExt}
          {displayFileExtension && "fileExst" in item ? (
            <span className="item-file-exst">{item.fileExst}</span>
          ) : null}
        </Link>
        <div className={classNames(styles.mobileBadges, "badges")}>
          {badgesComponent}
        </div>

        {mainInfo ? (
          <Text fontSize="12px" fontWeight={400} className="row_update-text">
            {mainInfo}
          </Text>
        ) : (
          <div />
        )}
      </FilesRowContent>
    );
  },
);

export { RowContent };
