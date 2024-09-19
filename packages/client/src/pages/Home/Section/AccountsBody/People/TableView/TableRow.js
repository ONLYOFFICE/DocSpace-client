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
    max-height: 48px;
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
    padding-inline-end: 12px;
  }

  .table-cell_email {
    a {
      margin-inline-end: 12px;
    }
  }

  .groups-combobox,
  .type-combobox {
    visibility: ${(props) => (props.hideColumns ? "hidden" : "visible")};
    opacity: ${(props) => (props.hideColumns ? 0 : 1)};

    & > div {
      width: auto;
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
        font-size: 13px;
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

const PeopleTableRow = (props) => {
  const {
    t,
    item,
    getContextModel,
    element,
    checkedProps,
    onContentRowSelect,
    onContentRowClick,
    onEmailClick,
    onUserContextClick,

    isOwner,
    theme,
    changeUserType,

    isActive,
    canChangeUserType,
    hideColumns,
    value,
    standalone,
    onOpenGroup,
    showStorageInfo,
    typeAccountsColumnIsEnabled,
    emailAccountsColumnIsEnabled,
    groupAccountsColumnIsEnabled,
    storageAccountsColumnIsEnabled,
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
    isLDAP,
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
      title: t("Common:PortalAdmin", { productName: t("Common:ProductName") }),
      label: t("Common:PortalAdmin", { productName: t("Common:ProductName") }),
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
      title: t("Common:User"),
      label: t("Common:User"),
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

  const onOpenGroupClick = React.useCallback(
    ({ action, title }) => onOpenGroup(action, true, title),
    [onOpenGroup],
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
        return t("Common:PortalAdmin", {
          productName: t("Common:ProductName"),
        });
      case "manager":
        return t("Common:RoomAdmin");
      case "collaborator":
        return t("Common:User");
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
          onSelect={onOpenGroupClick}
          options={groupItems}
          scaled={false}
          directionY="both"
          size="content"
          modernView
          manualWidth={"fit-content"}
          optionStyle={{ maxWidth: "400px" }}
          textOverflow
        />
      );

    if (groups.length === 1)
      return (
        <Link
          className="plainTextItem"
          type="page"
          title={email}
          fontSize="13px"
          fontWeight={600}
          color={sideInfoColor}
          onClick={() => onOpenGroupClick({ action: groups[0].id })}
          isTextOverflow
        >
          {groups[0].name}
        </Link>
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
        scaled={false}
        directionY="both"
        size="content"
        displaySelectedOption
        modernView
        manualWidth={"auto"}
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
    onContentRowSelect && onContentRowSelect(e.target.checked, item);
  };

  const onRowContextClick = React.useCallback(
    (rightMouseButtonClick) => {
      onUserContextClick?.(item, !rightMouseButtonClick);
    },
    [item, onUserContextClick],
  );

  const onRowClick = (e) => onContentRowClick?.(e, item);

  const isPaidUser = !standalone && !isVisitor;
  return (
    <StyledWrapper
      className={`user-item ${
        isChecked || isActive ? "table-row-selected" : ""
      } ${item.id}`}
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
        contextOptions={item.options}
        getContextModel={getContextModel}
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

          <Text
            type="page"
            title={displayName}
            fontWeight="600"
            fontSize="13px"
            color={nameColor}
            isTextOverflow
            className="table-cell_username"
            noHover
            dir="auto"
            truncate={true}
          >
            {statusType === "pending"
              ? email
              : displayName?.trim()
                ? displayName
                : email}
          </Text>
          <Badges
            statusType={statusType}
            isPaid={isPaidUser}
            isSSO={isSSO}
            isLDAP={isLDAP}
          />
        </TableCell>

        {typeAccountsColumnIsEnabled ? (
          <TableCell className={"table-cell_type"}>{typeCell}</TableCell>
        ) : (
          <div />
        )}

        {groupAccountsColumnIsEnabled ? (
          <TableCell className={"table-cell_groups"}>
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

        {emailAccountsColumnIsEnabled ? (
          <TableCell className={"table-cell_email"}>
            <Link
              type="page"
              title={email}
              fontSize="13px"
              fontWeight={600}
              color={sideInfoColor}
              onClick={onEmailClick}
              isTextOverflow
              dir="auto"
              enableUserSelect
            >
              {email}
            </Link>
          </TableCell>
        ) : (
          <div />
        )}

        {showStorageInfo &&
          (storageAccountsColumnIsEnabled ? (
            <TableCell className={"table-cell_Storage/Quota"}>
              <SpaceQuota hideColumns={hideColumns} item={item} type="user" />
            </TableCell>
          ) : (
            <div />
          ))}
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
