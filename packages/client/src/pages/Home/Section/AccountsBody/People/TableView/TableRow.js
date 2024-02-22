import React, { useState } from "react";
import styled, { css } from "styled-components";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import ExpanderDownReactSvgUrl from "PUBLIC_DIR/images/expander-down.react.svg?url";
import { TableRow } from "@docspace/shared/components/table";
import { TableCell } from "@docspace/shared/components/table";
import { Link } from "@docspace/shared/components/link";
import { Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { ComboBox } from "@docspace/shared/components/combobox";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { LinkWithDropdown } from "@docspace/shared/components/link-with-dropdown";
import withContent from "SRC_DIR/HOCs/withPeopleContent";
import { ReactSVG } from "react-svg";
import Badges from "../../Badges";
import { Base } from "@docspace/shared/themes";
import { DropDown } from "@docspace/shared/components/drop-down";
import { useNavigate } from "react-router-dom";

import SpaceQuota from "SRC_DIR/components/SpaceQuota";

const StyledWrapper = styled.div`
  display: contents;
`;

const StyledPeopleRow = styled(TableRow)`
  :hover {
    .table-container_cell {
      cursor: pointer;
      background: ${(props) =>
        `${props.theme.filesSection.tableView.row.backgroundActive} !important`};
      border-top: ${(props) =>
        `1px solid ${props.theme.filesSection.tableView.row.borderColor}`};
      margin-top: -1px;
    }

    .table-container_user-name-cell {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-right: -24px;
              padding-right: 24px;
            `
          : css`
              margin-left: -24px;
              padding-left: 24px;
            `}
    }
    .table-container_row-context-menu-wrapper {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-left: -20px;
              padding-left: 20px;
            `
          : css`
              margin-right: -20px;
              padding-right: 20px;
            `}
    }

    .groups-combobox .combo-button {
      background-color: ${(props) =>
        `${props.theme.filesSection.tableView.row.backgroundActive}`};
    }
  }

  .table-container_cell {
    height: 48px;
    max-height: 48px;

    background: ${(props) =>
      (props.checked || props.isActive) &&
      `${props.theme.filesSection.tableView.row.backgroundActive} !important`};
  }

  .table-container_row-checkbox-wrapper {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding-left: 0px;
          `
        : css`
            padding-right: 0px;
          `}
    min-width: 48px;

    .table-container_row-checkbox {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-right: -4px;
              padding: 16px 12px 16px 0px;
            `
          : css`
              margin-left: -4px;
              padding: 16px 0px 16px 12px;
            `}
    }
  }

  .link-with-dropdown-group {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 12px;
          `
        : css`
            margin-right: 12px;
          `}
  }

  .table-cell_username {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 12px;
          `
        : css`
            margin-right: 12px;
          `}
  }

  .table-container_row-context-menu-wrapper {
    justify-content: flex-end;

    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding-left: 0px;
          `
        : css`
            padding-right: 0px;
          `}
  }

  .table-cell_type,
  .table-cell_groups,
  .table-cell_room {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: -8px;
          `
        : css`
            margin-left: -8px;
          `}
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
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding-right: 8px;
          `
        : css`
            padding-left: 8px;
          `}
    overflow: hidden;
  }

  .type-combobox,
  .groups-combobox,
  .room-combobox {
    .combo-button {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              padding-right: 8px;
              margin-right: -8px;
            `
          : css`
              padding-left: 8px;
              margin-left: -8px;
            `}

      .combo-button-label {
        font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
        font-weight: 600;
      }
    }
  }

  .groups-combobox {
    .combo-button {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              padding-right: 8px;
              margin-right: -8px;
            `
          : css`
              padding-left: 8px;
              margin-left: -8px;
            `}

      &:hover {
        background-color: #fff !important;
      }

      .combo-button-label {
        font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
        color: ${(props) => props.theme.peopleTableRow.sideInfoColor};
        font-weight: 600;
      }

      .combo-buttons_arrow-icon {
        svg path {
          fill: ${(props) => props.theme.peopleTableRow.sideInfoColor};
        }
      }
    }
  }

  .room-combobox {
    .combo-buttons_arrow-icon {
      display: none;
    }
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
    background-color: ${({ isChecked, theme }) =>
      !isChecked ? "#fff" : theme.filesSection.tableView.row.backgroundActive};

    ${({ isOpened }) => isOpened && "background-color: #fff !important"}

    border-radius: 3px;

    &:hover {
      background-color: #fff;
    }
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

const PeopleTableRow = (props) => {
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
    setCurrentGroup,
    showStorageInfo,
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

  const navigate = useNavigate();

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

  const onOpenGroup = ({ action }) => {
    setCurrentGroup(null);
    navigate(`/accounts/groups/${action}`);
  };

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
          type="page"
          title={position}
          fontSize="13px"
          fontWeight={600}
          color={sideInfoColor}
          truncate
          noSelect
          style={{ paddingLeft: "8px" }}
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
        type="page"
        title={position}
        fontSize="13px"
        fontWeight={600}
        color={sideInfoColor}
        truncate
        noSelect
        style={{ paddingLeft: "8px" }}
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
          >
            {statusType === "pending"
              ? email
              : displayName?.trim()
                ? displayName
                : email}
          </Link>
          <Badges statusType={statusType} isPaid={isPaidUser} isSSO={isSSO} />
        </TableCell>

        <TableCell className={"table-cell_type"}>{typeCell}</TableCell>

        <TableCell
          className={"table-cell_groups"}
          onClick={(e) => e.stopPropagation()}
        >
          {renderGroupsCell()}
        </TableCell>

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

        {showStorageInfo && (
          <TableCell className={"table-cell_Storage/Quota"}>
            <SpaceQuota hideColumns={hideColumns} item={item} type="user" />
          </TableCell>
        )}
      </StyledPeopleRow>
    </StyledWrapper>
  );
};

export default inject(({ currentQuotaStore }) => {
  const { showStorageInfo } = currentQuotaStore;

  return {
    showStorageInfo,
  };
})(
  withContent(
    withTranslation(["People", "Common", "Settings"])(observer(PeopleTableRow)),
  ),
);
