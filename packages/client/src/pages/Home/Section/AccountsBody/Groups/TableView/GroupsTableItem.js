import React from "react";
import { withTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { TableRow, TableCell } from "@docspace/shared/components/table";
import { Link } from "@docspace/shared/components/link";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { inject, observer } from "mobx-react";

import withContent from "SRC_DIR/HOCs/withPeopleContent";
import * as Styled from "./index.styled";
import Badges from "../../Badges";
import { Base } from "@docspace/shared/themes";
import { Events } from "@docspace/shared/enums";
import { Text } from "@docspace/shared/components/text";
import { Avatar } from "@docspace/shared/components/avatar";

const GroupsTableItem = ({
  t,
  item,
  itemIndex,
  theme,
  hideColumns,
  selection,
  setSelection,
  bufferSelection,
  setBufferSelection,
  getGroupContextOptions,
  openGroupAction,
  managerAccountsGroupsColumnIsEnabled,
}) => {
  const isChecked = selection.includes(item);
  const isActive = bufferSelection?.id === item.id;

  const onChange = (e) => {
    if (!isChecked) setSelection([...selection, item]);
    else setSelection(selection.filter((g) => g.id !== item.id));
  };

  const onRowContextClick = () => {
    setBufferSelection(item);
  };

  const onOpenGroup = () => {
    setSelection([]);
    setBufferSelection(null);
    openGroupAction(item.id, true, item.name);
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

    setBufferSelection(item);

    if (selection.length === 1 && selection[0].id === item.id) {
      setSelection([]);
      return;
    }

    setSelection([item]);
  };

  let value = `folder_${item.id}_false_index_${itemIndex}`;

  return (
    <Styled.GroupsRowWrapper
      className={`group-item ${
        (isChecked || isActive) && "table-row-selected"
      }`}
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
        </TableCell>

        {managerAccountsGroupsColumnIsEnabled ? (
          <TableCell className={"table-container_group-manager"}>
            <Text
              title={item.manager?.displayName}
              fontWeight="600"
              fontSize="13px"
              isTextOverflow
              className="table-cell_group-manager"
              color={"#A3A9AE"}
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
  selection: peopleStore.groupsStore.selection,
  setSelection: peopleStore.groupsStore.setSelection,
  bufferSelection: peopleStore.groupsStore.bufferSelection,
  setBufferSelection: peopleStore.groupsStore.setBufferSelection,
  getGroupContextOptions: peopleStore.groupsStore.getGroupContextOptions,
  openGroupAction: peopleStore.groupsStore.openGroupAction,
}))(
  withTranslation(
    "People",
    "Common",
    "PeopleTranslations",
  )(observer(GroupsTableItem)),
);
