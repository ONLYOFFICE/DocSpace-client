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

import React from "react";
import { inject, observer } from "mobx-react";

import { useNavigate, useParams } from "react-router";

import { Row } from "@docspace/shared/components/rows";
import { retryWebhook } from "@docspace/shared/api/settings";

import RetryIcon from "PUBLIC_DIR/images/icons/16/refresh.react.svg?url";
import InfoIcon from "PUBLIC_DIR/images/info.outline.react.svg?url";

import { toastr } from "@docspace/shared/components/toast";

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
