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

import React, { useState } from "react";
import classNames from "classnames";

import ArrowIcon from "PUBLIC_DIR/images/arrow.react.svg";

import { Text } from "@docspace/ui-kit/components/text";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { LinkWithDropdown } from "@docspace/ui-kit/components/link-with-dropdown";
import { isMobile } from "../../../utils";
import styles from "../DownloadDialog.module.scss";
import {
  type DownloadContentProps,
  isFile,
  type TDownloadedFile,
} from "../DownloadDialog.types";
import { DownloadRow } from "./DownloadRow";

export const DownloadContent = (props: DownloadContentProps) => {
  const {
    t,
    items,
    onSelectFormat,
    onRowSelect,
    titleFormat,
    type,
    extsConvertible,
    title,
    isChecked,
    isIndeterminate,
    getItemIcon,
    dataTestId,
  } = props;

  const getTitleExtensions = () => {
    let arr: string[] = [];
    items.forEach((item) => {
      const exst = isFile(item) ? item.fileExst : undefined;

      if (exst) {
        arr = [...arr, ...extsConvertible[exst]];
      }
    });

    arr = arr.filter((x, pos) => arr.indexOf(x) !== pos);
    arr = arr.filter((x, pos) => arr.indexOf(x) === pos);

    const formats = [
      {
        key: "original",
        label: t("Common:OriginalFormat"),
        onClick: onSelectFormat,
        "data-format": t("Common:OriginalFormat"),
        "data-type": type,
      },
    ];

    arr.forEach((f) => {
      formats.push({
        key: f,
        label: f,
        onClick: onSelectFormat,
        "data-format": f,
        "data-type": type,
      });
    });

    return formats;
  };

  const getFormats = (item: TDownloadedFile) => {
    const arrayFormats =
      item && isFile(item) ? extsConvertible[item.fileExst] : [];
    const formats = [
      {
        key: "original",
        label: t("Common:OriginalFormat"),
        onClick: onSelectFormat,
        "data-format": t("Common:OriginalFormat"),
        "data-type": type,
        "data-file-id": item.id,
      },
    ];
    arrayFormats.forEach((f) => {
      formats.push({
        key: f,
        label: f,
        onClick: onSelectFormat,
        "data-format": f,
        "data-type": type,
        "data-file-id": item.id,
      });
    });

    return type === "other" ? [] : formats;
  };

  const isOther = type === "other";

  const titleData = !isOther ? getTitleExtensions() : undefined;

  const [isOpen, setIsOpen] = useState(false);

  const onOpen = () => {
    setIsOpen(!isOpen);
  };

  const showHeader = items.length > 1;

  return (
    <div
      className={classNames(styles.downloadContent, {
        [styles.isOpen]: showHeader ? isOpen : true,
      })}
      data-testid={dataTestId || "download-dialog-content"}
    >
      {showHeader ? (
        <div
          className={classNames(
            styles.downloadDialogContentWrapper,
            styles.downloadDialogRow,
          )}
        >
          <div className={styles.downloadDialogMainContent}>
            <Checkbox
              data-item-id="All"
              data-type={type}
              isChecked={isChecked}
              isIndeterminate={isIndeterminate}
              onChange={onRowSelect}
              className={styles.downloadDialogCheckbox}
              dataTestId={`${dataTestId}_checkbox`}
            />
            <div
              onClick={onOpen}
              className={classNames(
                styles.downloadDialogHeading,
                styles.downloadDialogTitle,
              )}
            >
              <Text noSelect fontSize="16px" fontWeight={600}>
                {title}
              </Text>
              <ArrowIcon className={styles.downloadDialogIcon} />
            </div>
          </div>
          <div className={styles.downloadDialogActions}>
            {(isChecked || isIndeterminate) && !isOther ? (
              <LinkWithDropdown
                className={styles.downloadDialogLink}
                dropDownClassName="download-dialog-dropDown"
                data={titleData}
                directionY="both"
                topSpace={16}
                bottomSpace={80}
                withDynamicScrollbar
                dropdownType="alwaysDashed"
                fontSize="13px"
                fontWeight={600}
                withExpander
                directionX="left"
                isAside
                withoutBackground
                hasScroll={isMobile()}
                manualWidth={isMobile() ? "148px" : undefined}
              >
                {titleFormat}
              </LinkWithDropdown>
            ) : null}
          </div>
        </div>
      ) : null}
      <div className={styles.downloadDialogHiddenItems}>
        {items.map((file, index) => {
          const dropdownItems = !isOther
            ? getFormats(file).filter(
                (x) => isFile(file) && x.label !== file.fileExst,
              )
            : undefined;

          return (
            <DownloadRow
              t={t}
              key={file.id}
              file={file}
              isChecked={file.checked}
              onRowSelect={onRowSelect}
              type={type}
              isOther={isOther}
              dropdownItems={dropdownItems}
              getItemIcon={getItemIcon}
              dataTestId={`${dataTestId}_row_${index}`}
            />
          );
        })}
      </div>
    </div>
  );
};
