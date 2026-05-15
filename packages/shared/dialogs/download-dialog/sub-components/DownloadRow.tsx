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

import { LinkWithDropdown } from "@docspace/ui-kit/components/link-with-dropdown";
import { Text } from "@docspace/ui-kit/components/text";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { isMobile } from "../../../utils";

import { type DownloadRowProps, isFile } from "../DownloadDialog.types";
import styles from "../DownloadDialog.module.scss";

export const DownloadRow = (props: DownloadRowProps) => {
  const {
    t,
    file,
    onRowSelect,
    type,
    dropdownItems,
    isOther,
    isChecked,
    getItemIcon,
    dataTestId,
  } = props;

  const element = getItemIcon(file);

  return (
    <div className={styles.downloadDialogRow} data-testid={dataTestId}>
      <div className={styles.downloadDialogMainContent}>
        <Checkbox
          className={styles.downloadDialogCheckbox}
          data-item-id={file.id}
          data-type={type}
          onChange={onRowSelect}
          isChecked={isChecked}
          dataTestId={`checkbox_${dataTestId}`}
        />
        <div className={styles.downloadDialogIconContainer}>{element}</div>
        <Text
          className={styles.downloadDialogTitle}
          truncate
          title={file.title}
          fontSize="14px"
          fontWeight={600}
          dir="auto"
        >
          {file.title}
        </Text>
      </div>

      <div className={styles.downloadDialogActions}>
        {file.checked && !isOther ? (
          <LinkWithDropdown
            className={styles.downloadDialogLink}
            dropDownClassName="download-dialog-dropDown"
            isOpen={false}
            dropdownType="alwaysDashed"
            data={dropdownItems}
            directionY="both"
            topSpace={16}
            bottomSpace={80}
            withDynamicScrollbar
            fontSize="13px"
            fontWeight={600}
            hasScroll={isMobile()}
            withExpander
            manualWidth={isMobile() ? "148px" : undefined}
            directionX="left"
            isAside
            withoutBackground
          >
            {file.format || t("Common:OriginalFormat")}
          </LinkWithDropdown>
        ) : null}
        {isOther && isFile(file) && file.fileExst ? (
          <Text
            className={styles.downloadDialogOtherText}
            truncate
            title={file.title}
            fontSize="13px"
            fontWeight={600}
            noSelect
          >
            {t("Common:OriginalFormat")}
          </Text>
        ) : null}
      </div>
    </div>
  );
};
