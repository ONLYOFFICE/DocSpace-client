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

import React, { useState } from "react";
import classNames from "classnames";

import ArrowIcon from "PUBLIC_DIR/images/arrow.react.svg";

import { Text } from "../../../components/text";
import { Checkbox } from "../../../components/checkbox";
import { LinkWithDropdown } from "../../../components/link-with-dropdown";
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
                directionY="bottom"
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
