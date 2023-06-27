import React, { useState } from "react";
import styled from "styled-components";
import TableRow from "@docspace/components/table-container/TableRow";
import TableCell from "@docspace/components/table-container/TableCell";
import Text from "@docspace/components/text";

import ToggleButton from "@docspace/components/toggle-button";
import SettingsIcon from "PUBLIC_DIR/images/catalog.settings.react.svg?url";
import HistoryIcon from "PUBLIC_DIR/images/history.react.svg?url";
import DeleteIcon from "PUBLIC_DIR/images/delete.react.svg?url";
import LinuxIcon from "PUBLIC_DIR/images/linux.react.svg?url";
//import StatusBadge from "../../StatusBadge";

import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { inject, observer } from "mobx-react";

const StyledWrapper = styled.div`
  display: contents;
`;

const StyledTableRow = styled(TableRow)`
  .table-container_cell {
    padding-right: 30px;
    text-overflow: ellipsis;
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
  }
`;

const Row = (props) => {
  const {
    item,
    setEnabled,
    openDeleteModal,
    setCurrentClient,
    hideColumns,
  } = props;
  const navigate = useNavigate();

  const { t } = useTranslation(["Webhooks", "Common"]);

  const [isChecked, setIsChecked] = useState(item.enabled);

  const openClientSettings = () => {
    navigate(window.location.pathname + `/${item.id}`);
  };

  const handleToggleEnabled = () => {
    setEnabled(item.id);
    setIsChecked((prevIsChecked) => !prevIsChecked);
  };

  const onSettingsOpen = () => {
    setCurrentClient(item);
    openClientSettings();
  };

  const onDeleteOpen = () => {
    setCurrentClient(item);
    openDeleteModal();
  };

  const handleRowClick = (e) => {
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

    onSettingsOpen();
  };

  const contextOptions = [
    {
      key: "settings",
      label: t("Common:Settings"),
      icon: SettingsIcon,
      onClick: onSettingsOpen,
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
      <StyledWrapper onClick={handleRowClick}>
        <StyledTableRow
          contextOptions={contextOptions}
          hideColumns={hideColumns}
        >
          <TableCell>
            <img src={LinuxIcon} />
          </TableCell>
          <TableCell>
            <Text as="span" fontWeight={600} className="mr-8 textOverflow">
              {item.name}
            </Text>
          </TableCell>
          <TableCell>
            <Text as="span" fontWeight={400} className="mr-8 textOverflow">
              {item.description}
            </Text>
          </TableCell>
          <TableCell>
            <ToggleButton
              className="toggle toggleButton"
              isChecked={isChecked}
              onChange={handleToggleEnabled}
            />
          </TableCell>
        </StyledTableRow>
      </StyledWrapper>
    </>
  );
};

export default inject(({ oauthStore }) => {
  const { setCurrentClient, setEnabled } = oauthStore;

  return { setEnabled, setCurrentClient };
})(observer(Row));
