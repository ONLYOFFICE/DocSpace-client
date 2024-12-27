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
import styled from "styled-components";
import { TableRow, TableCell } from "@docspace/shared/components/table";
import { Text } from "@docspace/shared/components/text";

import { ToggleButton } from "@docspace/shared/components/toggle-button";
import SettingsIcon from "PUBLIC_DIR/images/icons/16/catalog.settings.react.svg?url";
import HistoryIcon from "PUBLIC_DIR/images/history.react.svg?url";
import DeleteIcon from "PUBLIC_DIR/images/delete.react.svg?url";

import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { inject, observer } from "mobx-react";
import { globalColors } from "@docspace/shared/themes";
import StatusBadge from "../../StatusBadge";

const StyledWrapper = styled.div`
  display: contents;
`;

const StyledTableRow = styled(TableRow)`
  .table-container_cell {
    padding-inline-end: 30px;
    text-overflow: ellipsis;
  }

  .mr-8 {
    margin-inline-end: 8px;
  }
  .textOverflow {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const WebhooksTableRow = (props) => {
  const {
    webhook,
    toggleEnabled,
    openSettingsModal,
    openDeleteModal,
    setCurrentWebhook,
    hideColumns,
  } = props;
  const navigate = useNavigate();

  const { t } = useTranslation(["Webhooks", "Common"]);

  const [isChecked, setIsChecked] = useState(webhook.enabled);

  const redirectToHistory = () => {
    navigate(`${window.location.pathname}/${webhook.id}`);
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

    redirectToHistory();
  };
  const handleToggleEnabled = () => {
    toggleEnabled(webhook);
    setIsChecked((prevIsChecked) => !prevIsChecked);
  };

  const onSettingsOpen = () => {
    setCurrentWebhook(webhook);
    openSettingsModal();
  };
  const onDeleteOpen = () => {
    setCurrentWebhook(webhook);
    openDeleteModal();
  };

  const contextOptions = [
    {
      key: "Settings dropdownItem",
      label: t("Common:Settings"),
      icon: SettingsIcon,
      onClick: onSettingsOpen,
    },
    {
      key: "Webhook history dropdownItem",
      label: t("WebhookHistory"),
      icon: HistoryIcon,
      onClick: redirectToHistory,
    },
    {
      key: "Separator dropdownItem",
      isSeparator: true,
    },
    {
      key: "Delete webhook dropdownItem",
      label: t("DeleteWebhook"),
      icon: DeleteIcon,
      onClick: onDeleteOpen,
    },
  ];

  return (
    <StyledWrapper onClick={handleRowClick}>
      <StyledTableRow contextOptions={contextOptions} hideColumns={hideColumns}>
        <TableCell>
          <Text as="span" fontWeight={600} className="mr-8 textOverflow">
            {webhook.name}{" "}
          </Text>
          <StatusBadge status={webhook.status} />
        </TableCell>
        <TableCell>
          <Text
            as="span"
            fontSize="11px"
            color={globalColors.gray}
            fontWeight={600}
            className="textOverflow"
          >
            {webhook.uri}
          </Text>
        </TableCell>
        <TableCell>
          <ToggleButton
            className="toggle toggleButton"
            id="toggle id"
            isChecked={isChecked}
            onChange={handleToggleEnabled}
          />
        </TableCell>
      </StyledTableRow>
    </StyledWrapper>
  );
};

export default inject(({ webhooksStore }) => {
  const { toggleEnabled, setCurrentWebhook } = webhooksStore;

  return {
    toggleEnabled,
    setCurrentWebhook,
  };
})(observer(WebhooksTableRow));
