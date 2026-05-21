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

"use client";

import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import { Link, LinkTarget, LinkType } from "@docspace/ui-kit/components/link";
import { Text } from "@docspace/ui-kit/components/text";
import { FilesRowContent } from "@docspace/shared/components/files-row";
import { getFileTypeName } from "@docspace/shared/utils/getFileType";
import { getCorrectDate } from "@docspace/ui-kit/utils/date/getCorrectDate";
import { SortByFieldName } from "@docspace/shared/enums";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";

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

    const { isBase } = useTheme();
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
      <FilesRowContent
        sideColor={isBase ? globalColors.gray : globalColors.grayDark}
      >
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
          <Text
            containerMinWidth="200px"
            containerWidth="15%"
            fontSize="12px"
            fontWeight={400}
            className="row_update-text"
          >
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
