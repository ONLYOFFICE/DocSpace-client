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

import { Button } from "@docspace/shared/components/button";
import { useState, useEffect, useTransition, Suspense } from "react";

import { inject, observer } from "mobx-react";

import styled from "styled-components";

import { injectDefaultTheme, isMobile } from "@docspace/shared/utils";

import { useTranslation } from "react-i18next";

import { toastr } from "@docspace/shared/components/toast";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import { DeleteWebhookDialog } from "./sub-components/DeleteWebhookDialog";
import { WebhookConfigsLoader } from "./sub-components/Loaders";
import WebhooksTable from "./sub-components/WebhooksTable";
import WebhookInfo from "./sub-components/WebhookInfo";
import WebhookDialog from "./sub-components/WebhookDialog";

const MainWrapper = styled.div`
  width: 100%;

  .toggleButton {
    display: flex;
    align-items: center;
  }
`;

const ButtonSeating = styled.div.attrs(injectDefaultTheme)`
  position: fixed;
  z-index: 2;
  width: 100vw;
  height: 73px;
  bottom: 0;

  inset-inline-start: 0;
  background-color: ${(props) => props.theme.backgroundColor};

  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledCreateButton = styled(Button)`
  width: calc(100% - 32px);
`;

const Webhooks = (props) => {
  const {
    loadWebhooks,
    addWebhook,
    isWebhooksEmpty,
    currentWebhook,
    editWebhook,
    deleteWebhook,
  } = props;

  const { t, ready } = useTranslation(["Webhooks", "Common"]);

  const [, startTranslation] = useTransition();

  setDocumentTitle(t("Webhooks"));

  const [isCreateOpened, setIsCreateOpened] = useState(false);
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

  useEffect(() => {
    ready && startTranslation(loadWebhooks);
  }, [ready]);

  return (
    <Suspense fallback={<WebhookConfigsLoader />}>
      <MainWrapper>
        <WebhookInfo />
        {isMobile() ? (
          <ButtonSeating>
            <StyledCreateButton
              label={t("CreateWebhook")}
              primary
              size="normal"
              onClick={openCreateModal}
            />
          </ButtonSeating>
        ) : (
          <Button
            id="create-webhook-button"
            label={t("CreateWebhook")}
            primary
            size="small"
            onClick={openCreateModal}
          />
        )}

        {!isWebhooksEmpty ? (
          <WebhooksTable
            openSettingsModal={openSettingsModal}
            openDeleteModal={openDeleteModal}
          />
        ) : null}
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
      </MainWrapper>
    </Suspense>
  );
};

export default inject(({ webhooksStore }) => {
  const {
    state,
    loadWebhooks,
    addWebhook,
    isWebhooksEmpty,
    currentWebhook,
    editWebhook,
    deleteWebhook,
  } = webhooksStore;

  return {
    state,
    loadWebhooks,
    addWebhook,
    isWebhooksEmpty,
    currentWebhook,
    editWebhook,
    deleteWebhook,
  };
})(observer(Webhooks));
