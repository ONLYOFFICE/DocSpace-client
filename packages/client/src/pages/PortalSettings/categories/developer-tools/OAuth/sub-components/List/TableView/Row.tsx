import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styled, { css } from "styled-components";

//@ts-ignore
import TableRow from "@docspace/components/table-container/TableRow";

//@ts-ignore
import TableCell from "@docspace/components/table-container/TableCell";
import Text from "@docspace/components/text";
import ToggleButton from "@docspace/components/toggle-button";
import { Base } from "@docspace/components/themes";

import SettingsIcon from "PUBLIC_DIR/images/catalog.settings.react.svg?url";
import DeleteIcon from "PUBLIC_DIR/images/delete.react.svg?url";

import { ClientProps } from "@docspace/common/utils/oauth/interfaces";

import NameCell from "./columns/name";

const StyledWrapper = styled.div`
  display: contents;
`;

const StyledTableRow = styled(TableRow)`
  .table-container_cell {
    text-overflow: ellipsis;

    padding-right: 8px;
  }

  .mr-8 {
    margin-right: 8px;
  }

  .textOverflow {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .toggleButton {
    display: contents;

    input {
      position: relative;

      margin-left: -8px;
    }
  }

  .table-container_row-loader {
    margin-left: 8px;
    margin-right: 16px;
  }

  :hover {
    .table-container_cell {
      cursor: pointer;
      background: ${(props) =>
        `${props.theme.filesSection.tableView.row.backgroundActive} !important`};

      margin-top: -1px;

      border-top: ${(props) =>
        `1px solid ${props.theme.filesSection.tableView.row.borderColor}`};
    }

    .table-container_file-name-cell {
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
              padding-left: 18px;
            `
          : css`
              margin-right: -20px;
              padding-right: 18px;
            `}
    }
  }
`;

StyledTableRow.defaultProps = { theme: Base };

interface RowProps {
  item: ClientProps;
  isChecked: boolean;
  inProgress: boolean;
  setSelection?: (clientId: string) => void;
  changeClientStatus?: (clientId: string, status: boolean) => Promise<void>;
}

const Row = (props: RowProps) => {
  const { item, changeClientStatus, isChecked, inProgress, setSelection } =
    props;
  const navigate = useNavigate();

  const { t } = useTranslation(["Webhooks", "Common"]);

  const editClient = () => {
    navigate(window.location.pathname + `/${item.clientId}`);
  };

  const handleToggleEnabled = async () => {
    if (!changeClientStatus) return;
    await changeClientStatus(item.clientId, !item.enabled);
  };

  const onDeleteOpen = () => {};

  const handleRowClick = (e: any) => {
    if (
      e.target.closest(".checkbox") ||
      e.target.closest(".table-container_row-checkbox") ||
      e.target.closest(".type-combobox") ||
      e.target.closest(".table-container_row-context-menu-wrapper") ||
      e.target.closest(".toggleButton") ||
      e.detail === 0
    ) {
      return;
    }

    editClient();
  };

  const contextOptions = [
    {
      key: "settings",
      label: t("Common:Settings"),
      icon: SettingsIcon,
      onClick: editClient,
    },
    {
      key: "Separator dropdownItem",
      isSeparator: true,
    },
    {
      key: "delete",
      label: t("Common:Delete"),
      icon: DeleteIcon,
      onClick: onDeleteOpen,
    },
  ];

  return (
    <>
      <StyledWrapper className="handle">
        <StyledTableRow
          contextOptions={contextOptions}
          onClick={handleRowClick}
        >
          <TableCell className={"table-container_file-name-cell"}>
            <NameCell
              name={item.name}
              icon={item.logoUrl}
              isChecked={isChecked}
              inProgress={inProgress}
              clientId={item.clientId}
              setSelection={setSelection}
            />
          </TableCell>
          <TableCell>
            {/* @ts-ignore */}
            <Text as="span" fontWeight={400} className="mr-8 textOverflow">
              {item.description}
            </Text>
          </TableCell>
          <TableCell>
            <ToggleButton
              className="toggle toggleButton"
              isChecked={item.enabled}
              onChange={handleToggleEnabled}
            />
          </TableCell>
        </StyledTableRow>
      </StyledWrapper>
    </>
  );
};

export default Row;
