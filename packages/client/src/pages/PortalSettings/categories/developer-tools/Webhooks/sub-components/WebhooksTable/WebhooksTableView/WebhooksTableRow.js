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

import SettingsIcon from "PUBLIC_DIR/images/icons/16/catalog.settings.react.svg?url";
import HistoryIcon from "PUBLIC_DIR/images/history.react.svg?url";
import DeleteIcon from "PUBLIC_DIR/images/delete.react.svg?url";
import DefaultUserPhotoSize32PngUrl from "PUBLIC_DIR/images/default_user_photo_size_32-32.png";

import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { TableRow, TableCell } from "@docspace/ui-kit/components/table";
import { Text } from "@docspace/ui-kit/components/text";
import { Avatar } from "@docspace/ui-kit/components/avatar";
import { ToggleButton } from "@docspace/ui-kit/components/toggle-button";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import { Encoder } from "@docspace/ui-kit/utils/encoder";

import StatusBadge from "../../StatusBadge";

import styles from "../WebhooksTable.styled.module.scss";

const WebhooksTableRow = (props) => {
  const {
    webhook,
    toggleEnabled,
    openSettingsModal,
    openDeleteModal,
    setCurrentWebhook,
    hideColumns,
    isAdmin,
  } = props;
  const navigate = useNavigate();

  const { t } = useTranslation(["Webhooks", "Common"]);

  const [isChecked, setIsChecked] = useState(webhook.enabled);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleToggleEnabled = async () => {
    setIsLoading(true);
    const res = await toggleEnabled(webhook, t);
    if (res) {
      setIsChecked(!!res.enabled);
    }
    setIsLoading(false);
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
      dataTestId: "webhook_settings_item",
    },
    {
      key: "Webhook history dropdownItem",
      label: t("WebhookHistory"),
      icon: HistoryIcon,
      onClick: redirectToHistory,
      dataTestId: "webhook_history_item",
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
      dataTestId: "webhook_delete_item",
    },
  ];

  const avatarSource = webhook.createdBy?.hasAvatar
    ? webhook.createdBy?.avatarSmall
    : DefaultUserPhotoSize32PngUrl;

  return (
    <div className={styles.styledWrapper} onClick={handleRowClick}>
      <TableRow
        className={styles.styledTableRow}
        contextOptions={contextOptions}
        hideColumns={hideColumns}
        contextMenuTestId="webhook_table_contextmenu"
      >
        <TableCell>
          <Text as="span" fontWeight={600} className="mr-8 textOverflow">
            {webhook.name}{" "}
          </Text>
          <StatusBadge status={webhook.status} />
        </TableCell>
        {isAdmin ? (
          <TableCell>
            {webhook.createdBy?.hasAvatar ? (
              <Avatar
                source={avatarSource}
                className="author-avatar-cell"
                role="user"
                dataTestId={`avatar_${webhook.name}`}
              />
            ) : null}
            <Text
              fontSize="12px"
              fontWeight={600}
              title={webhook.createdBy?.displayName}
              truncate
              dataTestId={`author_name_${webhook.name}`}
            >
              {Encoder.htmlDecode(webhook.createdBy?.displayName)}
            </Text>
          </TableCell>
        ) : (
          <div />
        )}
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
            dataTestId={`toggle_button_${webhook.name}`}
            className="toggle toggleButton"
            id="toggle id"
            isChecked={isChecked}
            onChange={handleToggleEnabled}
            isDisabled={isLoading}
          />
        </TableCell>
      </TableRow>
    </div>
  );
};

export default inject(({ webhooksStore, userStore }) => {
  const { toggleEnabled, setCurrentWebhook } = webhooksStore;

  return {
    toggleEnabled,
    setCurrentWebhook,
    isAdmin: userStore.user.isAdmin || userStore.user.isOwner,
  };
})(observer(WebhooksTableRow));
