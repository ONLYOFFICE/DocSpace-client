import React, { useState } from "react";
import styled, { css } from "styled-components";
import { withTranslation } from "react-i18next";
import { TableRow } from "@docspace/shared/components/table";
import { TableCell } from "@docspace/shared/components/table";
import { Link } from "@docspace/shared/components/link";
import { Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { ComboBox } from "@docspace/shared/components/combobox";
import withContent from "SRC_DIR/HOCs/withPeopleContent";
import Badges from "../../Badges";
import { Base } from "@docspace/shared/themes";
import { useNavigate } from "react-router-dom";

const StyledWrapper = styled.div`
  display: contents;
`;

const StyledPeopleRow = styled(TableRow)`
  .table-container_cell {
    border-top: ${(props) =>
      `1px solid ${props.theme.filesSection.tableView.row.borderColor}`};
    margin-top: -1px;
  }

  :hover {
    .table-container_cell {
      cursor: pointer;
      background: ${(props) =>
        `${props.theme.filesSection.tableView.row.backgroundActive} !important`};
    }

    .table-container_user-name-cell {
      margin-inline-start: -24px;
      padding-inline-start: 24px;
    }
    .table-container_row-context-menu-wrapper {
      margin-inline-end: -20px;
      padding-inline-end: 20px;
    }
  }

  .table-container_row-context-menu-wrapper {
    height: 49px !important;
    max-height: none !important;
    box-sizing: border-box;
  }

  .table-container_cell:not(.table-container_row-checkbox-wrapper) {
    height: auto;
    max-height: 48;
  }

  .table-container_cell {
    background: ${(props) =>
      (props.checked || props.isActive) &&
      `${props.theme.filesSection.tableView.row.backgroundActive} !important`};
  }

  .table-container_row-checkbox-wrapper {
    padding-inline-end: 0;
    min-width: 48px;

    .table-container_row-checkbox {
      margin-inline-start: -4px;
      padding-block: 16px;
      padding-inline: 12px 0;
    }
  }

  .link-with-dropdown-group {
    margin-inline-end: 12px;
  }

  .table-cell_username {
    margin-inline-end: 12px;
  }

  .table-container_row-context-menu-wrapper {
    justify-content: flex-end;
    padding-inline-end: 0;
  }

  .table-cell_type,
  .table-cell_groups,
  .table-cell_room {
    margin-inline-start: -8px;
  }

  .groups-combobox,
  .type-combobox {
    visibility: ${(props) => (props.hideColumns ? "hidden" : "visible")};
    opacity: ${(props) => (props.hideColumns ? 0 : 1)};

    & > div {
      max-width: fit-content;
    }
  }

  .type-combobox,
  .groups-combobox,
  .room-combobox {
    padding-inline-start: 8px;
    overflow: hidden;
  }

  .type-combobox,
  .groups-combobox,
  .room-combobox {
    .combo-button {
      padding-inline-start: 8px;
      margin-inline-start: -8px;

      .combo-button-label {
        font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
        font-weight: 600;
      }
    }
  }

  .groups-combobox {
    .combo-button {
      padding-inline-start: 8px;
      margin-inline-start: -8px;
    }
  }

  .room-combobox {
    .combo-buttons_arrow-icon {
      display: none;
    }
  }

  .plainTextItem {
    padding-inline-start: 8px;
  }
`;

StyledPeopleRow.defaultProps = { theme: Base };

const StyledGroupsComboBox = styled(ComboBox)`
  .combo-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 4px 8px;

    border-radius: 3px;
  }

  .dropdown {
    z-index: 105;
  }
`;

StyledGroupsComboBox.defaultProps = { theme: Base };

const fakeRooms = [
  {
    name: "Room 1",
    role: "Viewer",
  },
  {
    name: "Room 2",
    role: "Co-worker",
  },
];

const InsideGroupTableRow = (props) => {
  const {
    t,
    item,
    contextOptionsProps,
    element,
    checkedProps,
    onContentRowSelect,
    onContentRowClick,
    onEmailClick,

    isOwner,
    theme,
    changeUserType,

    setBufferSelection,
    isActive,
    isSeveralSelection,
    canChangeUserType,
    hideColumns,
    value,
    standalone,
    openGroupAction,

    typeAccountsInsideGroupColumnIsEnabled,
    groupAccountsInsideGroupColumnIsEnabled,
    emailAccountsInsideGroupColumnIsEnabled,
  } = props;

  const {
    displayName,
    email,
    statusType,

    position,
    rooms,

    role,
    isVisitor,
    isCollaborator,
    isSSO,
  } = item;

  const isPending = statusType === "pending" || statusType === "disabled";

  const [groupDropDownIsOpened, setGroupDropDownIsOpened] = useState(false);
  const onToggleGroupDropdown = () =>
    setGroupDropDownIsOpened(!groupDropDownIsOpened);

  const [isLoading, setIsLoading] = React.useState(false);

  const nameColor = isPending
    ? theme.peopleTableRow.pendingNameColor
    : theme.peopleTableRow.nameColor;
  const sideInfoColor = theme.peopleTableRow.sideInfoColor;

  const getTypesOptions = React.useCallback(() => {
    const options = [];

    const adminOption = {
      key: "admin",
      title: t("Common:DocSpaceAdmin"),
      label: t("Common:DocSpaceAdmin"),
      action: "admin",
    };
    const managerOption = {
      key: "manager",
      title: t("Common:RoomAdmin"),
      label: t("Common:RoomAdmin"),
      action: "manager",
    };
    const collaboratorOption = {
      key: "collaborator",
      title: t("Common:PowerUser"),
      label: t("Common:PowerUser"),
      action: "collaborator",
    };
    const userOption = {
      key: "user",
      title: t("Common:User"),
      label: t("Common:User"),
      action: "user",
    };

    isOwner && options.push(adminOption);

    options.push(managerOption);

    if (isCollaborator || isVisitor) options.push(collaboratorOption);

    isVisitor && options.push(userOption);

    return options;
  }, [t, isOwner, isVisitor, isCollaborator]);

  const onAbort = () => {
    setIsLoading(false);
  };

  const onSuccess = () => {
    setIsLoading(false);
  };

  const onTypeChange = React.useCallback(
    ({ action }) => {
      setIsLoading(true);
      if (!changeUserType(action, [item], onSuccess, onAbort)) {
        setIsLoading(false);
      }
    },
    [item, changeUserType],
  );

  const onOpenGroup = React.useCallback(
    ({ action, title }) => openGroupAction(action, false, title),
    [openGroupAction],
  );

  // const getRoomsOptions = React.useCallback(() => {
  //   const options = [];

  //   fakeRooms.forEach((room) => {
  //     options.push(
  //       <DropDownItem key={room.name} noHover={true}>
  //         {room.name} &nbsp;
  //         <Text fontSize="13px" fontWeight={600} color={sideInfoColor} truncate>
  //           ({room.role})
  //         </Text>
  //       </DropDownItem>
  //     );
  //   });

  //   return <>{options.map((option) => option)}</>;
  // }, []);

  const getUserTypeLabel = React.useCallback((role) => {
    switch (role) {
      case "owner":
        return t("Common:Owner");
      case "admin":
        return t("Common:DocSpaceAdmin");
      case "manager":
        return t("Common:RoomAdmin");
      case "collaborator":
        return t("Common:PowerUser");
      case "user":
        return t("Common:User");
    }
  }, []);

  const typeLabel = getUserTypeLabel(role);

  const isChecked = checkedProps.checked;

  const renderGroupsCell = () => {
    const groups = item.groups || [];
    const groupItems = groups
      .map((group) => ({
        key: group.id,
        title: group.name,
        label: group.name,
        action: group.id,
      }))
      .slice(0, 5);

    if (groups.length > 1)
      return (
        <StyledGroupsComboBox
          // isActive={groupDropDownIsOpened}
          // isChecked={isChecked}
          // onToggle={onToggleGroupDropdown}
          className="groups-combobox"
          selectedOption={{
            key: "first-group",
            title: groups[0].name,
            label: groups[0].name + " ",
          }}
          plusBadgeValue={groups.length - 1}
          onSelect={onOpenGroup}
          options={groupItems}
          scaled
          directionY="both"
          size="content"
          modernView
          manualWidth={"fit-content"}
          isLoading={isLoading}
        />
      );

    if (groups.length === 1)
      return (
        <Text
          className="plainTextItem"
          type="page"
          title={position}
          fontSize="13px"
          fontWeight={600}
          color={sideInfoColor}
          truncate
          noSelect
          dir="auto"
        >
          {groups[0].name}
        </Text>
      );

    return null;
  };

  const renderTypeCell = () => {
    const typesOptions = getTypesOptions();

    const combobox = (
      <ComboBox
        className="type-combobox"
        selectedOption={
          typesOptions.find((option) => option.key === role) || {}
        }
        options={typesOptions}
        onSelect={onTypeChange}
        scaled
        directionY="both"
        size="content"
        displaySelectedOption
        modernView
        manualWidth={"fit-content"}
        isLoading={isLoading}
      />
    );

    const text = (
      <Text
        className="plainTextItem"
        type="page"
        title={position}
        fontSize="13px"
        fontWeight={600}
        color={sideInfoColor}
        truncate
        noSelect
        dir="auto"
      >
        {typeLabel}
      </Text>
    );

    const canChange = canChangeUserType(item);

    return canChange ? combobox : text;
  };

  const typeCell = renderTypeCell();

  const onChange = (e) => {
    //console.log("onChange");
    onContentRowSelect && onContentRowSelect(e.target.checked, item);
  };

  const onRowContextClick = React.useCallback(() => {
    //console.log("userContextClick");
    onContentRowClick && onContentRowClick(!isChecked, item, false);
  }, [isChecked, item, onContentRowClick]);

  const onRowClick = (e) => {
    if (
      e.target.closest(".checkbox") ||
      e.target.closest(".table-container_row-checkbox") ||
      e.target.closest(".type-combobox") ||
      e.target.closest(".paid-badge") ||
      e.target.closest(".pending-badge") ||
      e.target.closest(".disabled-badge") ||
      e.detail === 0
    ) {
      return;
    }

    //console.log("onRowClick");

    onContentRowClick && onContentRowClick(!isChecked, item);
  };
  const isPaidUser = !standalone && !isVisitor;
  return (
    <StyledWrapper
      className={`user-item ${
        isChecked || isActive ? "table-row-selected" : ""
      }`}
      value={value}
    >
      <StyledPeopleRow
        key={item.id}
        className="table-row"
        sideInfoColor={sideInfoColor}
        checked={isChecked}
        isActive={isActive}
        onClick={onRowClick}
        fileContextClick={onRowContextClick}
        hideColumns={hideColumns}
        {...contextOptionsProps}
      >
        <TableCell className={"table-container_user-name-cell"}>
          <TableCell
            hasAccess={true}
            className="table-container_row-checkbox-wrapper"
            checked={isChecked}
          >
            <div className="table-container_element">{element}</div>
            <Checkbox
              className="table-container_row-checkbox"
              onChange={onChange}
              isChecked={isChecked}
            />
          </TableCell>

          <Link
            type="page"
            title={displayName}
            fontWeight="600"
            fontSize="13px"
            color={nameColor}
            isTextOverflow
            className="table-cell_username"
            noHover
            dir="auto"
          >
            {statusType === "pending"
              ? email
              : displayName?.trim()
                ? displayName
                : email}
          </Link>
          <Badges statusType={statusType} isPaid={isPaidUser} isSSO={isSSO} />
        </TableCell>

        {typeAccountsInsideGroupColumnIsEnabled ? (
          <TableCell className={"table-cell_type"}>{typeCell}</TableCell>
        ) : (
          <div />
        )}

        {groupAccountsInsideGroupColumnIsEnabled ? (
          <TableCell
            className={"table-cell_groups"}
            onClick={(e) => e.stopPropagation()}
          >
            {renderGroupsCell()}
          </TableCell>
        ) : (
          <div />
        )}

        {/* <TableCell className="table-cell_room">
          {!rooms?.length ? (
            <Text
              type="page"
              title={position}
              fontSize="13px"
              fontWeight={400}
              color={sideInfoColor}
              truncate
              noSelect
              style={{ paddingLeft: "8px" }}
            >
              —
            </Text>
          ) : rooms?.length === 1 ? (
            <Text
              type="page"
              title={position}
              fontSize="13px"
              fontWeight={400}
              color={sideInfoColor}
              truncate
              style={{ paddingLeft: "8px" }}
            >
              {rooms[0].name} ({rooms[0].role})
            </Text>
          ) : (
            <ComboBox
              className="room-combobox"
              selectedOption={{ key: "length", label: `${fakeRooms.length}` }}
              options={[]}
              onSelect={onTypeChange}
              advancedOptions={getRoomsOptions()}
              scaled={false}
              size="content"
              displaySelectedOption
              modernView
            />
          )}
        </TableCell> */}

        {emailAccountsInsideGroupColumnIsEnabled ? (
          <TableCell>
            <Link
              type="page"
              title={email}
              fontSize="13px"
              fontWeight={600}
              color={sideInfoColor}
              onClick={onEmailClick}
              isTextOverflow
              enableUserSelect
            >
              {email}
            </Link>
          </TableCell>
        ) : (
          <div />
        )}
      </StyledPeopleRow>
    </StyledWrapper>
  );
};

export default withTranslation(["People", "Common", "Settings"])(
  withContent(InsideGroupTableRow),
);
