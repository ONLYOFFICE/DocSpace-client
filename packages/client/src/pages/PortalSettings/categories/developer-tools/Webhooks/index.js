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

import { Button } from "@docspace/ui-kit/components/button";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";

import { inject, observer } from "mobx-react";

import { isMobile } from "@docspace/shared/utils";

import { useTranslation } from "react-i18next";

import { toastr } from "@docspace/ui-kit/components/toast";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import { EmptyServerErrorContainer } from "SRC_DIR/components/EmptyContainer/EmptyServerErrorContainer";
import { DeleteWebhookDialog } from "./sub-components/DeleteWebhookDialog";
import { WebhookConfigsLoader } from "./sub-components/Loaders";
import WebhooksTable from "./sub-components/WebhooksTable";
import WebhookInfo from "./sub-components/WebhookInfo";
import WebhookDialog from "./sub-components/WebhookDialog";

import styles from "./Webhooks.styled.module.scss";

const Webhooks = (props) => {
  const {
    addWebhook,
    isWebhooksEmpty,
    currentWebhook,
    editWebhook,
    deleteWebhook,
    errorWebhooks,

    isLoadedArticleBody,
    isLoadedSectionHeader,
  } = props;

  const { t } = useTranslation(["Webhooks", "Common"]);

  setDocumentTitle(t("Webhooks"));

  const [searchParams] = useSearchParams();
  const [isCreateOpened, setIsCreateOpened] = useState(
    () => searchParams.get("create") === "true",
  );
  const [isSettingsOpened, setIsSettingsOpened] = useState(false);
  const [isDeleteOpened, setIsDeleteOpened] = useState(false);

  const closeCreateModal = () => setIsCreateOpened(false);
  const openCreateModal = () => setIsCreateOpened(true);
  const closeSettingsModal = () => setIsSettingsOpened(false);
  const openSettingsModal = () => setIsSettingsOpened(true);
  const closeDeleteModal = () => setIsDeleteOpened(false);
  const openDeleteModal = () => setIsDeleteOpened(true);

  const handleWebhookUpdate = async (webhookInfo) => {
    await editWebhook(currentWebhook, webhookInfo);
  };

  const handleWebhookDelete = async () => {
    try {
      await deleteWebhook(currentWebhook);
      toastr.success(t("WebhookRemoved"));
    } catch (error) {
      toastr.error(error);
    }
  };

  isLoadedArticleBody && isLoadedSectionHeader ? (
    <WebhookConfigsLoader />
  ) : null;

  return (
    <div className={styles.mainWrapper}>
      <div
        className={`${styles.webhookInfoWrapper}${errorWebhooks ? ` ${styles.error}` : ""}`}
      >
        <WebhookInfo />
      </div>

      {errorWebhooks ? (
        <EmptyServerErrorContainer />
      ) : (
        <>
          {isMobile() ? (
            <div className={styles.buttonSeating}>
              <Button
                className={styles.styledCreateButton}
                label={t("CreateWebhook")}
                primary
                size="normal"
                onClick={openCreateModal}
                testId="create_webhook_button"
              />
            </div>
          ) : (
            <Button
              id="create-webhook-button"
              label={t("CreateWebhook")}
              primary
              size="small"
              onClick={openCreateModal}
              testId="create_webhook_button"
            />
          )}
          {!isWebhooksEmpty ? (
            <WebhooksTable
              openSettingsModal={openSettingsModal}
              openDeleteModal={openDeleteModal}
            />
          ) : null}
        </>
      )}
      <WebhookDialog
        visible={isCreateOpened}
        onClose={closeCreateModal}
        header={t("CreateWebhook")}
        onSubmit={addWebhook}
        additionalId="create-webhook"
        isSettingsModal={false}
      />
      <WebhookDialog
        visible={isSettingsOpened}
        onClose={closeSettingsModal}
        header={t("SettingsWebhook")}
        isSettingsModal
        webhook={currentWebhook}
        onSubmit={handleWebhookUpdate}
        additionalId="settings-webhook"
      />
      <DeleteWebhookDialog
        visible={isDeleteOpened}
        onClose={closeDeleteModal}
        header={t("DeleteWebhookForeverQuestion")}
        handleSubmit={handleWebhookDelete}
      />
    </div>
  );
};

export default inject(({ webhooksStore, common }) => {
  const {
    state,
    addWebhook,
    isWebhooksEmpty,
    currentWebhook,
    editWebhook,
    deleteWebhook,
    errorWebhooks,
  } = webhooksStore;

  const { isLoadedArticleBody, isLoadedSectionHeader } = common;

  return {
    state,
    addWebhook,
    isWebhooksEmpty,
    currentWebhook,
    editWebhook,
    deleteWebhook,
    errorWebhooks,
    isLoadedArticleBody,
    isLoadedSectionHeader,
  };
})(observer(Webhooks));
