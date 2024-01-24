import { Button } from "@docspace/shared/components/button";
import React, { useState, useEffect, useTransition, Suspense } from "react";
import WebhookDialog from "./sub-components/WebhookDialog";
import WebhookInfo from "./sub-components/WebhookInfo";
import WebhooksTable from "./sub-components/WebhooksTable";

import { inject, observer } from "mobx-react";

import styled from "styled-components";
import { WebhookConfigsLoader } from "./sub-components/Loaders";
import { Base } from "@docspace/shared/themes";

import { isMobile } from "@docspace/shared/utils";

import { useTranslation } from "react-i18next";

import { DeleteWebhookDialog } from "./sub-components/DeleteWebhookDialog";
import { NoBoxShadowToast } from "./styled-components";
import { toastr } from "@docspace/shared/components/toast";

const MainWrapper = styled.div`
  width: 100%;

  .toggleButton {
    display: flex;
    align-items: center;
  }
`;

const ButtonSeating = styled.div`
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

ButtonSeating.defaultProps = { theme: Base };

const StyledCreateButton = styled(Button)`
  width: calc(100% - 32px);
`;

const Webhooks = (props) => {
  const {
    loadWebhooks,
    addWebhook,
    isWebhooksEmpty,
    setDocumentTitle,
    currentWebhook,
    editWebhook,
    deleteWebhook,
  } = props;

  const { t, ready } = useTranslation(["Webhooks", "Common"]);

  const [isPending, startTranslation] = useTransition();

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
              size={"normal"}
              onClick={openCreateModal}
            />
          </ButtonSeating>
        ) : (
          <Button
            id="create-webhook-button"
            label={t("CreateWebhook")}
            primary
            size={"small"}
            onClick={openCreateModal}
          />
        )}

        {!isWebhooksEmpty && (
          <WebhooksTable
            openSettingsModal={openSettingsModal}
            openDeleteModal={openDeleteModal}
          />
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
        <NoBoxShadowToast />
      </MainWrapper>
    </Suspense>
  );
};

export default inject(({ webhooksStore, auth }) => {
  const {
    state,
    loadWebhooks,
    addWebhook,
    isWebhooksEmpty,
    currentWebhook,
    editWebhook,
    deleteWebhook,
  } = webhooksStore;
  const { setDocumentTitle } = auth;

  return {
    state,
    loadWebhooks,
    addWebhook,
    isWebhooksEmpty,
    setDocumentTitle,
    currentWebhook,
    editWebhook,
    deleteWebhook,
  };
})(observer(Webhooks));
