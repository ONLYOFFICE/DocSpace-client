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

import React from "react";
import { inject, observer } from "mobx-react";
import { TableCell } from "@docspace/shared/components/table";
import { classNames, getLastColumn } from "@docspace/shared/utils";
import FileNameCell from "./FileNameCell";
import SizeCell from "./SizeCell";
import { StyledBadgesContainer } from "../StyledTable";
import { ComboBox, ComboBoxSize } from "@docspace/shared/components/combobox";
import { Text } from "@docspace/shared/components/text";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import DateCell from "./DateCell";
import TypeCell from "./TypeCell";

const OPTIONS = [
  { key: "0", days: "15" },
  { key: "1", days: "30" },
  { key: "2", days: "60" },
];

const TrashRoomRowDataComponent = (props) => {
  const {
    retentionPeriodColumnIsEnabled,
    trashRoomColumnActivityIsEnabled,
    sizeTrashColumnIsEnabled,
    dragStyles,
    selectionProp,
    value,
    theme,
    onContentFileSelect,
    checkedProps,
    element,
    inProgress,
    showHotkeyBorder,
    badgesComponent,
    tableStorageName,
    roomColumnTypeIsEnabled,
  } = props;

  const { t } = useTranslation(["Common"]);

  const defaultSelectedItem = {
    key: OPTIONS[1].key,
    label: `${OPTIONS[1].days} ${t("Common:Days")}`,
  };

  const [selectedItem, setSelectedItem] = useState(defaultSelectedItem);

  const onSelect = (e) => {
    const selectItemId = e.currentTarget.id;
    const selectItem = OPTIONS?.find((item) => item.key === selectItemId);

    setSelectedItem({
      key: selectItem?.key ?? "",
      label: `${selectItem?.days} ${t("Common:Days")}`,
    });
  };

  const advancedOptions = (
    <>
      {OPTIONS?.map((item) => {
        return (
          <DropDownItem onClick={onSelect} key={item.key} id={item.key}>
            <Text className="drop-down-item_text" fontWeight={600}>
              {item.days} {t("Common:Days")}
            </Text>
          </DropDownItem>
        );
      })}
    </>
  );

  const renderRetentionPeriodCell = () => {
    const combobox = (
      <ComboBox
        className="type-combobox"
        selectedOption={selectedItem}
        options={[]}
        advancedOptions={advancedOptions}
        onSelect={onSelect}
        scaled={false}
        directionY="both"
        size={ComboBoxSize.content}
        displaySelectedOption
        modernView
        manualWidth="auto"
      />
    );

    const text = (
      <Text
        className="plainTextItem"
        fontSize="13px"
        fontWeight={600}
        truncate
        noSelect
        dir="auto"
      >
        {defaultSelectedItem.label}
      </Text>
    );

    return combobox;
  };

  const retentionPeriodCell = renderRetentionPeriodCell();

  const lastColumn = getLastColumn(tableStorageName);

  return (
    <>
      <TableCell
        {...dragStyles}
        className={classNames(
          selectionProp?.className,
          "table-container_file-name-cell",
        )}
        value={value}
      >
        <FileNameCell
          theme={theme}
          onContentSelect={onContentFileSelect}
          checked={checkedProps}
          element={element}
          inProgress={inProgress}
          {...props}
        />
        <StyledBadgesContainer showHotkeyBorder={showHotkeyBorder}>
          {badgesComponent}
        </StyledBadgesContainer>
      </TableCell>

      {retentionPeriodColumnIsEnabled ? (
        <TableCell className="table-cell_retention-period">
          {retentionPeriodCell}
        </TableCell>
      ) : (
        <div />
      )}

      {sizeTrashColumnIsEnabled ? (
        <TableCell
          style={
            !sizeTrashColumnIsEnabled
              ? { background: "none" }
              : dragStyles.style
          }
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "SizeTrash" ? "no-extra-space" : "",
          )}
        >
          <SizeCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
        </TableCell>
      ) : (
        <div />
      )}

      {trashRoomColumnActivityIsEnabled ? (
        <TableCell
          style={
            !trashRoomColumnActivityIsEnabled
              ? { background: "none" }
              : dragStyles.style
          }
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            // lastColumn === "ActivityTemplates" ? "no-extra-space" : "",
          )}
        >
          <DateCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
          {/* {lastColumn === "ActivityTemplates"
            ? quickButtonsComponentNode
            : null} */}
        </TableCell>
      ) : (
        <div />
      )}

      {roomColumnTypeIsEnabled ? (
        <TableCell
          style={
            !roomColumnTypeIsEnabled
              ? { background: "none !important" }
              : dragStyles.style
          }
          {...selectionProp}
          className={classNames(
            selectionProp?.className,
            lastColumn === "Type" ? "no-extra-space" : "",
          )}
        >
          <TypeCell
            sideColor={theme.filesSection.tableView.row.sideColor}
            {...props}
          />
          {/* {lastColumn === "Type" ? quickButtonsComponentNode : null} */}
        </TableCell>
      ) : (
        <div />
      )}
    </>
  );
};

export default inject(({ tableStore }) => {
  const {
    retentionPeriodColumnIsEnabled,
    trashRoomColumnActivityIsEnabled,
    sizeTrashColumnIsEnabled,
    typeTrashColumnIsEnabled,
    roomColumnTypeIsEnabled,
    tableStorageName,
  } = tableStore;

  return {
    retentionPeriodColumnIsEnabled,
    trashRoomColumnActivityIsEnabled,
    sizeTrashColumnIsEnabled,
    typeTrashColumnIsEnabled,
    roomColumnTypeIsEnabled,
    tableStorageName,
  };
})(observer(TrashRoomRowDataComponent));
