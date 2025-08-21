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
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";

import { TableCell } from "@docspace/shared/components/table";
import { Link } from "@docspace/shared/components/link";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { Text } from "@docspace/shared/components/text";
import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/shared/components/avatar";
import { globalColors } from "@docspace/shared/themes";
import { TGroup } from "@docspace/shared/api/groups/types";

import GroupsStore from "SRC_DIR/store/contacts/GroupsStore";
import ContactsHotkeysStore from "SRC_DIR/store/contacts/ContactsHotkeysStore";

import Badges from "../../Badges";

import { GroupsRowWrapper, GroupsRow } from "./TableView.styled";

type GroupsTableItemProps = {
  item: TGroup;
  itemIndex: number;
  isChecked: boolean;
  peopleGroupsColumnIsEnabled: boolean;
  managerGroupsColumnIsEnabled: boolean;

  bufferSelection?: GroupsStore["bufferSelection"];
  getGroupContextOptions?: GroupsStore["getGroupContextOptions"];
  getModel?: GroupsStore["getModel"];
  openGroupAction?: GroupsStore["openGroupAction"];
  selectRow?: GroupsStore["selectRow"];
  changeGroupSelection?: GroupsStore["changeGroupSelection"];
  changeGroupContextSelection?: GroupsStore["changeGroupContextSelection"];
  withContentSelection?: ContactsHotkeysStore["withContentSelection"];
};

const GroupsTableItem = ({
  item,
  itemIndex,
  bufferSelection,
  getGroupContextOptions,
  getModel,
  openGroupAction,
  peopleGroupsColumnIsEnabled,
  managerGroupsColumnIsEnabled,

  changeGroupSelection,
  changeGroupContextSelection,
  selectRow,
  isChecked,
  withContentSelection,
}: GroupsTableItemProps) => {
  const { t } = useTranslation(["People", "Common", "PeopleTranslations"]);
  const theme = useTheme();
  const isActive = bufferSelection?.id === item.id;

  const onChange = () => {
    changeGroupSelection!(item, isChecked);
  };

  const onRowContextClick = (rightMouseButtonClick?: boolean) => {
    changeGroupContextSelection!(item, !rightMouseButtonClick);
  };

  const onOpenGroup = (e: React.MouseEvent) => {
    openGroupAction!(item.id, true, item.name, e);
  };

  const onRowClick = (e: React.MouseEvent<Element>) => {
    if (withContentSelection) return;
    const target = e.target as Element;
    if (
      target?.tagName === "SPAN" ||
      target?.tagName === "A" ||
      target.closest(".checkbox") ||
      target.closest(".table-container_row-checkbox") ||
      e.detail === 0
    )
      return;

    selectRow!(item);
  };

  const getContextModel: () => ContextMenuModel[] = () => getModel!(t, item);

  const value = `folder_${item.id}_false_index_${itemIndex}`;

  return (
    <GroupsRowWrapper
      className={`group-item ${
        (isChecked || isActive) && "table-row-selected"
      } ${item.id}`}
      value={value}
      data-testid={`contacts_table_groups_row_${itemIndex}`}
    >
      <GroupsRow
        key={item.id}
        className="table-row"
        checked={isChecked}
        isActive={isActive}
        onClick={onRowClick}
        fileContextClick={onRowContextClick}
        contextOptions={
          getGroupContextOptions!(t, item) as unknown as ContextMenuModel[]
        }
        getContextModel={getContextModel!}
        badgeUrl=""
        isIndexEditingMode={false}
        dataTestId={`contacts_groups_row_${itemIndex}`}
      >
        <TableCell
          className="table-container_group-title-cell"
          dataTestId={`contacts_table_groups_title_cell_${itemIndex}`}
        >
          <TableCell
            hasAccess
            className="table-container_row-checkbox-wrapper"
            checked={isChecked}
          >
            <div className="table-container_element">
              <Avatar
                className="avatar"
                size={AvatarSize.min}
                userName={item.name}
                isGroup
                role={AvatarRole.user}
                source=""
                dataTestId={`contacts_table_groups_avatar_${itemIndex}`}
              />
            </div>
            <Checkbox
              className="table-container_row-checkbox"
              onChange={onChange}
              isChecked={isChecked}
              dataTestId={`contacts_table_groups_checkbox_${itemIndex}`}
            />
          </TableCell>

          <Link
            onClick={onOpenGroup}
            title={item.name}
            fontWeight="600"
            fontSize="13px"
            isTextOverflow
            className="table-cell_group-manager"
            truncate
            dataTestId={`contacts_table_groups_name_link_${itemIndex}`}
          >
            {item.name}
          </Link>

          <Badges isLDAP={item.isLDAP} />
        </TableCell>

        {peopleGroupsColumnIsEnabled ? (
          <TableCell
            className="table-container_group-people"
            dataTestId={`contacts_table_groups_members_count_cell_${itemIndex}`}
          >
            <Text
              title={item.membersCount.toString()}
              fontWeight="600"
              fontSize="13px"
              className="table-cell_group-people"
              color={theme.filesSection.tableView.row.sideColor}
            >
              {item.membersCount}
            </Text>
          </TableCell>
        ) : (
          <div />
        )}

        {managerGroupsColumnIsEnabled ? (
          <TableCell
            className="table-container_group-manager"
            dataTestId={`contacts_table_groups_manager_cell_${itemIndex}`}
          >
            <Text
              title={item.manager?.displayName}
              fontWeight="600"
              fontSize="13px"
              className="table-cell_group-manager"
              color={globalColors.gray}
              dir="auto"
              truncate
            >
              {item.manager?.displayName}
            </Text>
          </TableCell>
        ) : (
          <div />
        )}
      </GroupsRow>
    </GroupsRowWrapper>
  );
};

export default inject(({ peopleStore }: TStore) => ({
  bufferSelection: peopleStore.groupsStore!.bufferSelection,
  getGroupContextOptions: peopleStore.groupsStore!.getGroupContextOptions,
  getModel: peopleStore.groupsStore!.getModel,
  openGroupAction: peopleStore.groupsStore!.openGroupAction,
  changeGroupSelection: peopleStore.groupsStore!.changeGroupSelection,
  changeGroupContextSelection:
    peopleStore.groupsStore!.changeGroupContextSelection,
  selectRow: peopleStore.groupsStore!.selectRow,
  withContentSelection: peopleStore.contactsHotkeysStore!.withContentSelection,
}))(observer(GroupsTableItem));
