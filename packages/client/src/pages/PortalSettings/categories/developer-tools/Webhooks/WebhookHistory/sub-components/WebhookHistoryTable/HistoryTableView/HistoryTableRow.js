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

import RetryIcon from "PUBLIC_DIR/images/icons/16/refresh.react.svg?url";
import InfoIcon from "PUBLIC_DIR/images/info.outline.react.svg?url";

import React from "react";
import styled, { css } from "styled-components";
import { inject, observer } from "mobx-react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";

import { retryWebhook } from "@docspace/shared/api/settings";

import { TableRow, TableCell } from "@docspace/shared/components/table";
import { Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { toastr } from "@docspace/shared/components/toast";

import { getCorrectDate } from "@docspace/shared/utils";

import { formatFilters } from "SRC_DIR/helpers/webhooks";

import StatusBadge from "../../../../sub-components/StatusBadge";
import { getTriggerTranslate } from "../../../../Webhooks.helpers";

const StyledTableRow = styled(TableRow)`
  .textOverflow {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .p-menuitem-icon {
    svg {
      path {
        fill: red;
      }
    }
  }
  .p-menuitem-text {
    color: red;
  }

  ${(props) =>
    props.isHighlight &&
    css`
      .table-container_cell {
        background-color: ${({ theme }) =>
          theme.client.settings.webhooks.tableCellBackground};
      }
    `}
`;

const StyledWrapper = styled.div`
  display: contents;
`;

const HistoryTableRow = (props) => {
  const {
    item,
    toggleEventId,
    isIdChecked,
    hideColumns,
    fetchHistoryItems,
    historyFilters,
    isRetryPending,
  } = props;
  const { t, i18n } = useTranslation(["Webhooks", "Files", "Common"]);
  const navigate = useNavigate();
  const { id } = useParams();

  const redirectToDetails = () =>
    navigate(`${window.location.pathname}/${item.id}`);
  const handleRetryEvent = async () => {
    if (isRetryPending) {
      return;
    }
    await retryWebhook(item.id);
    await fetchHistoryItems({
      ...(historyFilters ? formatFilters(historyFilters) : {}),
      configId: id,
    });
    toastr.success(t("WebhookRedilivered"), <b>{t("Common:Done")}</b>);
  };

  const contextOptions = [
    {
      id: "webhook-details",
      key: "Webhook details dropdownItem",
      label: t("WebhookDetails"),
      icon: InfoIcon,
      onClick: redirectToDetails,
    },
    {
      id: "retry",
      key: "Retry dropdownItem",
      label: t("Retry"),
      icon: RetryIcon,
      onClick: handleRetryEvent,
      disabled: isRetryPending,
    },
  ];

  const formattedDelivery = getCorrectDate(i18n.language, item.delivery);

  const onRowClick = (e) => {
    if (
      e.target.closest(".checkbox") ||
      e.target.closest(".table-container_row-checkbox") ||
      e.target.closest(".type-combobox") ||
      e.target.closest(".table-container_row-context-menu-wrapper") ||
      e.detail === 0
    ) {
      return;
    }
    redirectToDetails();
  };

  const onCheckboxClick = () => {
    toggleEventId(item.id);
  };

  const isChecked = isIdChecked(item.id);

  const webhookTrigger = getTriggerTranslate(item.trigger, t);

  return (
    <StyledWrapper
      className={isChecked ? "selected-table-row" : ""}
      onClick={onRowClick}
    >
      <StyledTableRow
        contextOptions={contextOptions}
        checked={isChecked}
        hideColumns={hideColumns}
      >
        <TableCell>
          <TableCell checked={isChecked} className="checkboxWrapper">
            <Checkbox
              className="checkbox"
              onChange={onCheckboxClick}
              isChecked={isChecked}
            />
          </TableCell>

          <Text fontWeight={600}>{item.id}</Text>
        </TableCell>
        <TableCell>
          <StatusBadge status={item.status} />
        </TableCell>
        <TableCell>
          <Text fontWeight={600} fontSize="11px" className="textOverflow">
            {webhookTrigger}
          </Text>
        </TableCell>
        <TableCell>
          <Text fontWeight={600} fontSize="11px" className="textOverflow">
            {formattedDelivery}
          </Text>
        </TableCell>
      </StyledTableRow>
    </StyledWrapper>
  );
};

export default inject(({ webhooksStore }) => {
  const {
    toggleEventId,
    isIdChecked,
    fetchHistoryItems,
    historyFilters,
    isRetryPending,
  } = webhooksStore;

  return {
    toggleEventId,
    isIdChecked,
    fetchHistoryItems,
    historyFilters,
    isRetryPending,
  };
})(observer(HistoryTableRow));
