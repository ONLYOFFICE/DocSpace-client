import React from "react";
import styled, { css } from "styled-components";
import { withTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { TableRow, TableCell } from "@docspace/shared/components/table";
import { Link } from "@docspace/shared/components/link";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { inject, observer } from "mobx-react";

import withContent from "SRC_DIR/HOCs/withPeopleContent";

import Badges from "../../Badges";
import { Base } from "@docspace/shared/themes";
import { Events } from "@docspace/common/constants";

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

  .type-combobox {
    visibility: ${(props) => (props.hideColumns ? "hidden" : "visible")};
    opacity: ${(props) => (props.hideColumns ? 0 : 1)};

    & > div {
      max-width: fit-content;
    }
  }

  .type-combobox,
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

  .room-combobox {
    .combo-buttons_arrow-icon {
      display: none;
    }
  }
`;

StyledPeopleRow.defaultProps = { theme: Base };

const GroupsTableItem = ({
  t,
  item,
  // checkedProps,
  // onContentRowSelect,
  // onContentRowClick,

  theme,

  isActive,
  hideColumns,
  // value,

  selection,
  setSelection,
  addGroupToSelection,
}) => {
  const navigate = useNavigate();

  const isChecked = selection.includes(item);

  const onChange = (e) => {
    if (!isChecked) setSelection([...selection, item]);
    else setSelection(selection.filter((g) => g.id !== item.id));
  };

  const onRowContextClick = () => {
    // onContentRowClick && onContentRowClick(!isChecked, item, false);
  };

  const onRowClick = (e) => {
    if (
      e.target.closest(".checkbox") ||
      e.target.closest(".table-container_row-checkbox") ||
      e.target.closest(".type-combobox") ||
      e.target.closest(".paid-badge") ||
      e.target.closest(".pending-badge") ||
      e.target.closest(".disabled-badge") ||
      e.detail === 0
    )
      return;

    if (selection.length === 1 && selection[0].id === item.id) {
      setSelection([]);
      return;
    }

    setSelection([item]);
  };

  const onLinkClick = () => {
    navigate(`/accounts/groups/${item.id}/filter`);
  };

  const contextOptionsProps = {
    contextOptions: [
      {
        id: "option_profile",
        key: "profile",
        icon: "http://192.168.0.105/static/images/check-box.react.svg?hash=079b6e8fa11a027ed622",
        label: "Select",
      },
      {
        key: "separator-1",
        isSeparator: true,
      },
      {
        id: "option_change-name",
        key: "change-name",
        icon: "http://192.168.0.105/static/images/pencil.react.svg?hash=7b1050767036ee383c82",
        label: "Edit department",
        onClick: () => {
          const event = new Event(Events.GROUP_EDIT);
          event.item = item;
          window.dispatchEvent(event);
        },
      },
      {
        icon: "http://192.168.0.105/static/images/info.outline.react.svg?hash=1341c2413ad79879439d",
        id: "option_details",
        key: "details",
        label: "Info",
        onClick: () => {
          onSelect();
        },
      },
      {
        key: "separator-2",
        isSeparator: true,
      },
      {
        id: "option_change-owner",
        key: "change-owner",
        icon: "http://192.168.0.105/static/images/catalog.trash.react.svg?hash=eba7f2edad4e3c4f6f77",
        label: "Delete",
      },
    ],
  };

  const value = item.id;

  const titleWithoutSpaces = item.name.replace(/\s+/g, " ").trim();
  const indexAfterLastSpace = titleWithoutSpaces.lastIndexOf(" ");
  const secondCharacter =
    indexAfterLastSpace === -1
      ? ""
      : titleWithoutSpaces[indexAfterLastSpace + 1];

  const groupName = (item.name[0] + secondCharacter).toUpperCase();

  return (
    <StyledWrapper
      className={`group-item ${
        isChecked || isActive ? "table-row-selected" : ""
      }`}
      value={value}
    >
      <StyledPeopleRow
        key={item.id}
        className="table-row"
        sideInfoColor={theme.peopleTableRow.sideInfoColor}
        checked={isChecked}
        isActive={isActive}
        onClick={onRowClick}
        fileContextClick={onRowContextClick}
        onDoubleClick={onLinkClick}
        hideColumns={hideColumns}
        {...contextOptionsProps}
      >
        <TableCell className={"table-container_user-name-cell"}>
          <TableCell
            hasAccess={true}
            className="table-container_row-checkbox-wrapper"
            checked={isChecked}
          >
            <div className="table-container_element">
              <div
                style={{
                  display: "flex",
                  width: "32px",
                  height: "32px",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: "700",
                  lineHeight: "16px",
                  background: "#ECEEF1",
                  color: "#333",
                  borderRadius: "50%",
                }}
              >
                {groupName}
              </div>
            </div>
            <Checkbox
              className="table-container_row-checkbox"
              onChange={onChange}
              isChecked={isChecked}
            />
          </TableCell>

          <Link
            onClick={onLinkClick}
            title={item.name}
            fontWeight="600"
            fontSize="13px"
            isTextOverflow
            className="table-cell_username"
          >
            {item.name}
          </Link>
        </TableCell>
      </StyledPeopleRow>
    </StyledWrapper>
  );
};

export default inject(({ peopleStore }) => ({
  selection: peopleStore.groupsStore.selection,
  setSelection: peopleStore.groupsStore.setSelection,
  addGroupToSelection: peopleStore.groupsStore.addGroupToSelection,
}))(
  withTranslation(["People", "Common", "PeopleTranslations"])(
    observer(GroupsTableItem)
  )
);
