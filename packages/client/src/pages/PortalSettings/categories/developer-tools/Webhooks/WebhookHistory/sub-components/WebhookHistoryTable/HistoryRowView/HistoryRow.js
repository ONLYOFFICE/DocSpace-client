/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import { inject, observer } from "mobx-react";

import { useNavigate, useParams } from "react-router";

import { Row } from "@docspace/ui-kit/components/rows";
import { retryWebhook } from "@docspace/shared/api/settings";

import RetryIcon from "PUBLIC_DIR/images/icons/16/refresh.react.svg?url";
import InfoIcon from "PUBLIC_DIR/images/info.outline.react.svg?url";

import { toastr } from "@docspace/ui-kit/components/toast";

import { useTranslation } from "react-i18next";
import { formatFilters } from "SRC_DIR/helpers/webhooks";
import { HistoryRowContent } from "./HistoryRowContent";

const HistoryRow = (props) => {
  const {
    historyItem,
    sectionWidth,
    toggleEventId,
    isIdChecked,
    fetchHistoryItems,
    historyFilters,
    isRetryPending,
  } = props;
  const { t } = useTranslation(["Webhooks", "Common"]);
  const navigate = useNavigate();
  const { id } = useParams();

  const redirectToDetails = () =>
    navigate(`${window.location.pathname}/${historyItem.id}`);
  const handleRetryEvent = async () => {
    await retryWebhook(historyItem.id);
    await fetchHistoryItems({
      ...(historyFilters ? formatFilters(historyFilters) : {}),
      configId: id,
    });
    toastr.success(t("WebhookRedilivered"), <b>{t("Common:Done")}</b>);
  };
  const handleOnSelect = () => toggleEventId(historyItem.id);
  const handleRowClick = (e) => {
    if (
      e.target.closest(".checkbox") ||
      e.target.closest(".table-container_row-checkbox") ||
      e.target.closest(".type-combobox") ||
      e.target.closest(".table-container_row-context-menu-wrapper") ||
      e.target.closest(".row_context-menu-wrapper") ||
      e.detail === 0
    ) {
      return;
    }
    toggleEventId(historyItem.id);
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

  return (
    <Row
      sectionWidth={sectionWidth}
      key={historyItem.id}
      contextOptions={contextOptions}
      checkbox
      checked={isIdChecked(historyItem.id)}
      onSelect={handleOnSelect}
      className={
        isIdChecked(historyItem.id) ? "row-item selected-row-item" : "row-item "
      }
      onClick={handleRowClick}
    >
      <HistoryRowContent
        sectionWidth={sectionWidth}
        historyItem={historyItem}
      />
    </Row>
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
})(observer(HistoryRow));
