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

import React, { useState } from "react";
import { inject, observer } from "mobx-react";

import { Row } from "@docspace/shared/components/rows";

import SettingsIcon from "PUBLIC_DIR/images/icons/16/catalog.settings.react.svg?url";
import HistoryIcon from "PUBLIC_DIR/images/history.react.svg?url";
import DeleteIcon from "PUBLIC_DIR/images/delete.react.svg?url";

import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { WebhookRowContent } from "./WebhookRowContent";

const WebhookRow = (props) => {
  const {
    webhook,
    sectionWidth,
    toggleEnabled,
    openSettingsModal,
    openDeleteModal,
    setCurrentWebhook,
  } = props;
  const navigate = useNavigate();
  const { t } = useTranslation(["Webhooks", "Common"]);

  const [isChecked, setIsChecked] = useState(webhook.enabled);
  const [isLoading, setIsLoading] = useState(webhook.enabled);

  const handleToggleEnabled = async () => {
    setIsLoading(true);
    const res = await toggleEnabled(webhook, t);
    if (res) {
      setIsChecked(!!res.enabled);
    }
    setIsLoading(false);
  };

  const redirectToHistory = () => {
    navigate(`${window.location.pathname}/${webhook.id}`);
  };
  const handleRowClick = (e) => {
    if (
      e.target.closest(".table-container_row-context-menu-wrapper") ||
      e.target.closest(".toggleButton") ||
      e.target.closest(".row_context-menu-wrapper") ||
      e.detail === 0
    ) {
      return;
    }

    redirectToHistory();
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
      id: "settings",
      key: "Settings dropdownItem",
      label: t("Common:Settings"),
      icon: SettingsIcon,
      onClick: onSettingsOpen,
    },
    {
      id: "webhook-history",
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
      id: "delete-webhook",
      key: "Delete webhook dropdownItem",
      label: t("DeleteWebhook"),
      icon: DeleteIcon,
      onClick: onDeleteOpen,
    },
  ];

  return (
    <Row
      sectionWidth={sectionWidth}
      key={webhook.id}
      data={webhook}
      contextOptions={contextOptions}
      onClick={handleRowClick}
    >
      <WebhookRowContent
        sectionWidth={sectionWidth}
        webhook={webhook}
        isChecked={isChecked}
        isDisabled={isLoading}
        handleToggleEnabled={handleToggleEnabled}
      />
    </Row>
  );
};

export default inject(({ webhooksStore }) => {
  const { toggleEnabled, deleteWebhook, editWebhook, setCurrentWebhook } =
    webhooksStore;

  return { toggleEnabled, deleteWebhook, editWebhook, setCurrentWebhook };
})(observer(WebhookRow));
