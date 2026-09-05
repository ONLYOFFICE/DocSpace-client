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

import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import { TableCell, TableRow } from "@docspace/ui-kit/components/table";
import { Tags } from "@docspace/ui-kit/components/tags";
import { Text } from "@docspace/ui-kit/components/text";
import { ToggleButton } from "@docspace/ui-kit/components/toggle-button";
import { getCorrectDate } from "@docspace/ui-kit/utils/date/getCorrectDate";
import { getCookie } from "@docspace/ui-kit/utils/cookie";
import { toastr } from "@docspace/ui-kit/components/toast";

import NameCell from "../columns/name";
import CreatorCell from "../columns/creator";

import styles from "../TableView.styled.module.scss";
import { RowProps } from "../TableView.types";

const Row = (props: RowProps) => {
  const {
    item,
    changeClientStatus,
    isChecked,
    inProgress,
    getContextMenuItems,
    setSelection,
    tagCount,
    setBufferSelection,
    setDisableDialogVisible,
  } = props;
  const navigate = useNavigate();

  const { t } = useTranslation(["OAuth", "Common", "Files"]);

  const editClient = () => {
    navigate(`${item.clientId}`);
  };

  const handleToggleEnabled = async () => {
    if (!changeClientStatus) return;
    try {
      if (item.enabled && setDisableDialogVisible) {
        setBufferSelection!(item.clientId);
        setDisableDialogVisible(true);
        return;
      }
      await changeClientStatus(item.clientId, !item.enabled);

      if (!item.enabled) {
        toastr.success(t("ApplicationEnabledSuccessfully"));
      } else {
        toastr.success(t("ApplicationDisabledSuccessfully"));
      }
    } catch (e) {
      toastr.error(e as string);
    }
  };

  const handleRowClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    if (
      target.closest(".checkbox") ||
      target.closest(".table-container_row-checkbox") ||
      target.closest(".advanced-tag") ||
      target.closest(".tag") ||
      e.detail === 0
    ) {
      return;
    }

    if (
      target.closest(".type-combobox") ||
      target.closest(".table-container_row-context-menu-wrapper") ||
      target.closest(".toggleButton")
    ) {
      return setSelection && setSelection("");
    }

    editClient();
  };

  const contextOptions = getContextMenuItems?.(t, item);

  const getContextMenuModel = () =>
    getContextMenuItems ? getContextMenuItems(t, item) : [];

  const locale = getCookie("asc_language");

  const modifiedDate = getCorrectDate(locale || "", item.modifiedOn || "");

  return (
    <div className={styles.styledRowWrapper}>
      <TableRow
        className={styles.styledTableRow}
        contextOptions={contextOptions || []}
        onClick={handleRowClick}
        fileContextClick={(isRightClick) => {
          if (isRightClick) return;
          setSelection!("");
          setBufferSelection!(item.clientId);
        }}
        getContextModel={getContextMenuModel}
        isIndexEditingMode={false}
        badgeUrl=""
        dataTestId={`${item.name}_table_row`}
      >
        <TableCell className="table-container_file-name-cell">
          <NameCell
            name={item.name}
            icon={item.logo}
            isChecked={isChecked}
            inProgress={inProgress}
            clientId={item.clientId}
            setSelection={setSelection}
          />
        </TableCell>
        <TableCell className="author-cell">
          <CreatorCell
            avatar={item.creatorAvatar || ""}
            displayName={item.creatorDisplayName || ""}
          />
        </TableCell>
        <TableCell className="">
          <Text
            as="span"
            fontWeight={400}
            className="mr-8 textOverflow description-text"
            dataTestId="app_modified_date_cell"
          >
            {modifiedDate}
          </Text>
        </TableCell>
        <TableCell className="">
          <Text
            as="span"
            fontWeight={400}
            className="mr-8 textOverflow description-text"
            dataTestId="app_scopes_tags_cell"
          >
            <Tags
              tags={item.scopes}
              columnCount={tagCount}
              onSelectTag={() => {}}
            />
          </Text>
        </TableCell>
        <TableCell className="">
          <ToggleButton
            className="toggle toggleButton"
            isChecked={item.enabled}
            onChange={handleToggleEnabled}
            dataTestId={`${item.name}_toggle_button`}
          />
        </TableCell>
      </TableRow>
    </div>
  );
};

export default Row;
