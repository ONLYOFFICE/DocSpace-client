// (c) Copyright Ascensio System SIA 2009-2024
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

import { withTranslation } from "react-i18next";
import { TableCell } from "@docspace/shared/components/table";
import { Link } from "@docspace/shared/components/link";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { inject, observer } from "mobx-react";

import * as Styled from "./index.styled";
import { Text } from "@docspace/shared/components/text";
import { Avatar } from "@docspace/shared/components/avatar";
import Badges from "../../Badges";
import { globalColors } from "@docspace/shared/themes";

const GroupsTableItem = ({
  t,
  item,
  itemIndex,
  theme,
  hideColumns,
  bufferSelection,
  getGroupContextOptions,
  getModel,
  openGroupAction,
  peopleAccountsGroupsColumnIsEnabled,
  managerAccountsGroupsColumnIsEnabled,

  changeGroupSelection,
  changeGroupContextSelection,
  selectRow,
  isChecked,
}) => {
  const isActive = bufferSelection?.id === item.id;

  const onChange = () => {
    changeGroupSelection(item, isChecked);
  };

  const onRowContextClick = (rightMouseButtonClick) => {
    changeGroupContextSelection(item, !rightMouseButtonClick);
  };

  const onOpenGroup = (e) => {
    openGroupAction(item.id, true, item.name, e);
  };

  const onRowClick = (e) => {
    if (
      e.target?.tagName === "SPAN" ||
      e.target?.tagName === "A" ||
      e.target.closest(".checkbox") ||
      e.target.closest(".table-container_row-checkbox") ||
      e.detail === 0
    )
      return;

    selectRow(item);
  };

  const getContextModel = () => getModel(t, item);

  let value = `folder_${item.id}_false_index_${itemIndex}`;

  return (
    <Styled.GroupsRowWrapper
      className={`group-item ${
        (isChecked || isActive) && "table-row-selected"
      } ${item.id}`}
      value={value}
    >
      <Styled.GroupsRow
        key={item.id}
        className="table-row"
        sideInfoColor={theme.peopleTableRow.sideInfoColor}
        checked={isChecked}
        isActive={isActive}
        onClick={onRowClick}
        fileContextClick={onRowContextClick}
        onDoubleClick={onOpenGroup}
        hideColumns={hideColumns}
        contextOptions={getGroupContextOptions(t, item)}
        getContextModel={getContextModel}
      >
        <TableCell className={"table-container_group-title-cell"}>
          <TableCell
            hasAccess={true}
            className="table-container_row-checkbox-wrapper"
            checked={isChecked}
          >
            <div className="table-container_element">
              <Avatar
                className="avatar"
                size={"min"}
                userName={item.name}
                isGroup={true}
              />
            </div>
            <Checkbox
              className="table-container_row-checkbox"
              onChange={onChange}
              isChecked={isChecked}
            />
          </TableCell>

          <Link
            onClick={onOpenGroup}
            title={item.name}
            fontWeight="600"
            fontSize="12px"
            isTextOverflow
            className="table-cell_group-manager"
            dir="auto"
          >
            {item.name}
          </Link>

          <Badges isLDAP={item.isLDAP} />
        </TableCell>

        {peopleAccountsGroupsColumnIsEnabled ? (
          <TableCell className="table-container_group-people">
            <Text
              title={item.membersCount}
              fontWeight="600"
              fontSize="13px"
              isTextOverflow
              className="table-cell_group-people"
              color={theme.filesSection.tableView.row.sideColor}
            >
              {item.membersCount}
            </Text>
          </TableCell>
        ) : (
          <div />
        )}

        {managerAccountsGroupsColumnIsEnabled ? (
          <TableCell className={"table-container_group-manager"}>
            <Text
              title={item.manager?.displayName}
              fontWeight="600"
              fontSize="13px"
              isTextOverflow
              className="table-cell_group-manager"
              color={globalColors.gray}
              dir="auto"
            >
              {item.manager?.displayName}
            </Text>
          </TableCell>
        ) : (
          <div />
        )}
      </Styled.GroupsRow>
    </Styled.GroupsRowWrapper>
  );
};

export default inject(({ peopleStore }) => ({
  bufferSelection: peopleStore.groupsStore.bufferSelection,
  getGroupContextOptions: peopleStore.groupsStore.getGroupContextOptions,
  getModel: peopleStore.groupsStore.getModel,
  openGroupAction: peopleStore.groupsStore.openGroupAction,
  changeGroupSelection: peopleStore.groupsStore.changeGroupSelection,
  changeGroupContextSelection:
    peopleStore.groupsStore.changeGroupContextSelection,
  selectRow: peopleStore.groupsStore.selectRow,
}))(
  withTranslation(
    "People",
    "Common",
    "PeopleTranslations",
  )(observer(GroupsTableItem)),
);
