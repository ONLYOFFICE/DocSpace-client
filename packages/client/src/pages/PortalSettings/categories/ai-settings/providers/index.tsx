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

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Link, LinkTarget, LinkType } from "@docspace/ui-kit/components/link";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { toastr } from "@docspace/ui-kit/components/toast";
import type {
  TAiProvider,
  TModelSettingsDto,
  TProviderTypeWithUrl,
} from "@docspace/shared/api/ai/types";
import {
  getAvailableProviderUrls,
  getProviderModelSettings,
} from "@docspace/shared/api/ai";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";

import type AISettingsStore from "SRC_DIR/store/portal-settings/AISettingsStore";

import styles from "../AISettings.module.scss";

import { AddUpdateProviderDialog } from "./dialogs/add-update";
import { DeleteAIProviderDialog } from "./dialogs/delete";

import { AiProviderTile } from "./Tile";
import { ProvidersLoader } from "./ProvidersLoader";
import { DefaultProvider } from "./DefaultProvider";
import { getBrandName } from "@docspace/shared/constants/brands";

type TDeleteDialogData =
  | {
      visible: false;
      providerId: null;
      showDefaultProviderWarning?: false;
    }
  | {
      visible: true;
      providerId: TAiProvider["id"];
      showDefaultProviderWarning?: boolean;
    };

type TUpdateDialogData =
  | {
      visible: false;
      provider: null;
      models: null;
    }
  | {
      visible: true;
      provider: TAiProvider;
      models: TModelSettingsDto[];
    };

type AIProviderProps = {
  aiProviders?: AISettingsStore["aiProviders"];
  aiProvidersInitied?: AISettingsStore["aiProvidersInitied"];
  checkUnavailableProviders?: AISettingsStore["checkUnavailableProviders"];
  isProviderAvailable?: AISettingsStore["isProviderAvailable"];
  cancelAvailabilityCheck?: AISettingsStore["cancelAvailabilityCheck"];
  aiProviderSettingsUrl?: SettingsStore["aiProviderSettingsUrl"];
  hasAIProviders?: AISettingsStore["hasAIProviders"];
  aiConfig?: SettingsStore["aiConfig"];
};

const AIProviderComponent = ({
  aiProviders,
  aiProvidersInitied,
  checkUnavailableProviders,
  isProviderAvailable,
  cancelAvailabilityCheck,
  aiProviderSettingsUrl,
  hasAIProviders,
  aiConfig,
}: AIProviderProps) => {
  const { t } = useTranslation(["Common", "AISettings"]);
  const [addDialogVisible, setaddDialogVisible] = useState(false);
  const [updateDialogData, setUpdateDialogData] = useState<TUpdateDialogData>({
    visible: false,
    provider: null,
    models: null,
  });
  const [deleteDialogData, setDeleteDialogData] = useState<TDeleteDialogData>({
    visible: false,
    providerId: null,
  });
  const [aiProviderTypesWithUrls, setAiProviderTypesWithUrls] = useState<
    TProviderTypeWithUrl[]
  >([]);

  const showAddProviderDialog = () => setaddDialogVisible(true);

  const hideAddProviderDialog = () => setaddDialogVisible(false);
  const hideUpdateDialog = () =>
    setUpdateDialogData({ visible: false, provider: null, models: null });

  const hideDeleteProviderDialog = () =>
    setDeleteDialogData({ visible: false, providerId: null });

  const onDeleteAIProvider = async (id: TAiProvider["id"]) => {
    const isDefaultProvider = aiProviders?.find((p) => p.id === id)?.isDefault;
    const isLastProvider = aiProviders && aiProviders.length === 1;

    setDeleteDialogData({
      visible: true,
      providerId: id,
      showDefaultProviderWarning: isDefaultProvider && !isLastProvider,
    });
  };

  const onUpdateAIProvider = async (provider: TAiProvider) => {
    try {
      const models = await getProviderModelSettings(provider.id);
      setUpdateDialogData({ visible: true, provider, models });
    } catch (e) {
      toastr.error(e as string);
    }
  };

  useEffect(() => {
    const init = async () => {
      const res = await getAvailableProviderUrls?.();

      setAiProviderTypesWithUrls(res);
    };

    init();
  }, []);

  useEffect(() => {
    if (!aiProvidersInitied) return;

    checkUnavailableProviders?.();
  }, [aiProvidersInitied, checkUnavailableProviders]);

  useEffect(() => {
    return () => {
      cancelAvailabilityCheck?.();
    };
  }, [cancelAvailabilityCheck]);

  if (!aiProvidersInitied) return <ProvidersLoader />;

  return (
    <div className={styles.aiProvider}>
      <Text
        className={styles.description}
        dataTestId="provider-section-description"
      >
        {t("AISettings:AIProviderSettingDescription", {
          productName: getBrandName("ProductName"),
          aiChats: t("Common:AIChats"),
        })}
      </Text>
      {aiProviderSettingsUrl ? (
        <Link
          className={styles.learnMoreLink}
          target={LinkTarget.blank}
          type={LinkType.page}
          fontWeight={600}
          isHovered
          href={aiProviderSettingsUrl}
          color="accent"
        >
          {t("Common:LearnMore")}
        </Link>
      ) : null}
      <Button
        testId="add-provider-button"
        primary
        size={ButtonSize.small}
        label={t("AISettings:AddAIProvider", {
          aiProvider: t("Common:AIProvider"),
        })}
        scale={false}
        className={styles.addProviderButton}
        onClick={showAddProviderDialog}
      />

      <div data-testid="ai-provider-list" className={styles.providerList}>
        {aiProviders?.map((provider) => (
          <AiProviderTile
            key={provider.id}
            item={provider}
            onDeleteClick={onDeleteAIProvider}
            onSettingsClick={onUpdateAIProvider}
            isAvailable={
              isProviderAvailable?.(provider.id) && !provider.needReset
            }
            enabled={aiConfig?.systemAiEnabled}
          />
        ))}
      </div>

      {aiProviders && aiProviders.length > 0 ? (
        <DefaultProvider aiConfig={aiConfig} />
      ) : null}

      {addDialogVisible ? (
        <AddUpdateProviderDialog
          variant="add"
          onClose={hideAddProviderDialog}
          aiProviderTypesWithUrls={aiProviderTypesWithUrls}
        />
      ) : null}

      {updateDialogData.visible ? (
        <AddUpdateProviderDialog
          variant="update"
          onClose={hideUpdateDialog}
          aiProviderTypesWithUrls={aiProviderTypesWithUrls}
          providerData={updateDialogData.provider}
          initialModels={updateDialogData.models}
        />
      ) : null}

      {deleteDialogData.visible ? (
        <DeleteAIProviderDialog
          onClose={hideDeleteProviderDialog}
          providerId={deleteDialogData.providerId}
          showDefaultProviderWarning={
            deleteDialogData.showDefaultProviderWarning
          }
        />
      ) : null}
    </div>
  );
};

export const AIProvider = inject(
  ({ aiSettingsStore, settingsStore }: TStore) => {
    return {
      aiProviders: aiSettingsStore.aiProviders,
      aiProvidersInitied: aiSettingsStore.aiProvidersInitied,
      checkUnavailableProviders: aiSettingsStore.checkUnavailableProviders,
      isProviderAvailable: aiSettingsStore.isProviderAvailable,
      cancelAvailabilityCheck: aiSettingsStore.cancelAvailabilityCheck,
      aiProviderSettingsUrl: settingsStore.aiProviderSettingsUrl,
      aiConfig: settingsStore.aiConfig,
      hasAIProviders: aiSettingsStore.hasAIProviders,
    };
  },
)(observer(AIProviderComponent));

export { ProvidersLoader };

