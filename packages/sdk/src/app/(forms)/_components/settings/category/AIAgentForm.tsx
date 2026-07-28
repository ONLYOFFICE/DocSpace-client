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

"use client";

import { useCallback, useEffect, useState } from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { ToggleButton } from "@docspace/ui-kit/components/toggle-button";
import { ComboBox, type TOption } from "@docspace/ui-kit/components/combobox";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Loader, LoaderTypes } from "@docspace/ui-kit/components/loader";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";

import type { TAiProvider, TModel } from "@docspace/shared/api/ai/types";
import type { TFolder } from "@docspace/shared/api/files/types";
import {
  getProviders,
  getModels,
  updateDefaultProvider,
} from "@docspace/shared/api/ai";
import api from "@docspace/shared/api";
import FilesFilter from "@docspace/shared/api/files/filter";
import { FilterType, FolderType } from "@docspace/shared/enums";

import { useFormsAiAgentStore } from "../../../_store/FormsAiAgentStore";
import { useFormsSettingsStore } from "../../../_store/FormsSettingsStore";
import { useFormsTourStore } from "../../../_store/FormsTourStore";

import styles from "./SettingsPanel.module.scss";

type AIAgentFormProps = {
  inline?: boolean;
};

const AIAgentForm = ({ inline }: AIAgentFormProps) => {
  const { t } = useTranslation(["Common"]);
  const store = useFormsAiAgentStore();
  const tourStore = useFormsTourStore();
  const {
    aiAgentEnabled,
    setAiAgentEnabled,
    defaultProvider,
    aiProvidersAvailable,
    isCheckingProviders,
    isCreatingAgents,
    vectorizationEnabled,
  } = store;
  const { roomId } = useFormsSettingsStore();

  const [providers, setProviders] = useState<TAiProvider[]>([]);
  const [models, setModels] = useState<TModel[]>([]);
  const [isModelsLoading, setIsModelsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(
    defaultProvider?.providerId ?? null,
  );
  const [selectedModelId, setSelectedModelId] = useState<string | null>(
    defaultProvider?.defaultModel ?? null,
  );

  const isEnabled = aiAgentEnabled;

  const isProviderChanged = selectedProviderId !== defaultProvider?.providerId;
  const isModelChanged = selectedModelId !== defaultProvider?.defaultModel;
  const hasChanges = isProviderChanged || isModelChanged;

  // Check AI availability when settings page opens
  useEffect(() => {
    if (tourStore.showMockItems) return;
    store.checkAiAvailability();
  }, [store, tourStore.showMockItems]);

  useEffect(() => {
    if (tourStore.showMockItems) return;
    if (aiProvidersAvailable) {
      getProviders()
        .then((items) => setProviders(items))
        .catch(() => {});
    }
  }, [aiProvidersAvailable, tourStore.showMockItems]);

  useEffect(() => {
    if (defaultProvider) {
      setSelectedProviderId(defaultProvider.providerId);
      setSelectedModelId(defaultProvider.defaultModel);
    }
  }, [defaultProvider]);

  const fetchModels = useCallback(async (providerId: number) => {
    setIsModelsLoading(true);
    try {
      const result = await getModels(providerId);
      setModels(result);
      return result;
    } catch {
      setModels([]);
      return [];
    } finally {
      setIsModelsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tourStore.showMockItems) return;
    if (defaultProvider?.providerId) {
      fetchModels(defaultProvider.providerId);
    }
  }, [defaultProvider?.providerId, fetchModels, tourStore.showMockItems]);

  const providerOptions: TOption[] = providers.map((p) => ({
    key: p.id,
    label: p.title,
  }));

  const modelOptions: TOption[] = models.map((m) => ({
    key: m.modelId,
    label: m.modelId,
  }));

  const selectedProviderOption: TOption = providers.length
    ? (providerOptions.find((o) => o.key === selectedProviderId) ??
      providerOptions[0])
    : {
        key: defaultProvider?.providerId ?? "-1",
        label: defaultProvider?.providerTitle ?? "",
      };

  const selectedModelOption: TOption = models.length
    ? (modelOptions.find((o) => o.key === selectedModelId) ?? modelOptions[0])
    : {
        key: defaultProvider?.defaultModel ?? "-1",
        label: defaultProvider?.defaultModel ?? t("Common:NoModelsFound"),
      };

  const onSelectProvider = async (option: TOption) => {
    if (option.key === selectedProviderId) return;

    setSelectedProviderId(option.key as number);

    const newModels = await fetchModels(option.key as number);
    const hasDefault =
      defaultProvider?.defaultModel &&
      newModels.some((m) => m.modelId === defaultProvider.defaultModel);
    setSelectedModelId(
      hasDefault
        ? defaultProvider!.defaultModel
        : (newModels[0]?.modelId ?? null),
    );
  };

  const onSelectModel = (option: TOption) => {
    if (option.key === selectedModelId) return;
    setSelectedModelId(option.key as string);
  };

  const fetchCompletedFoldersWithFiles = useCallback(async () => {
    if (!roomId) return [];

    const roomFilter = FilesFilter.getDefault();
    roomFilter.page = 0;
    roomFilter.pageCount = 100;

    const roomRes = await api.files.getFolder(roomId, roomFilter);
    const doneFolder = roomRes.folders.find(
      (f: TFolder) => f.type === FolderType.Done,
    );
    if (!doneFolder) return [];

    const doneFilter = FilesFilter.getDefault();
    doneFilter.page = 0;
    doneFilter.pageCount = 100;

    const doneRes = await api.files.getFolder(doneFolder.id, doneFilter);
    const subFolders: TFolder[] = doneRes.folders;

    const results: {
      folder: TFolder;
      files: { id: number; title: string }[];
    }[] = [];

    for (const folder of subFolders) {
      const fileFilter = FilesFilter.getDefault();
      fileFilter.page = 0;
      fileFilter.pageCount = 100;
      fileFilter.filterType = FilterType.PDFForm;

      try {
        const folderRes = await api.files.getFolder(folder.id, fileFilter);
        results.push({
          folder,
          files: folderRes.files.map((f: { id: number; title: string }) => ({
            id: f.id,
            title: f.title,
          })),
        });
      } catch {
        results.push({ folder, files: [] });
      }
    }

    return results;
  }, [roomId]);

  const onToggleAiAgent = useCallback(async () => {
    if (isEnabled) {
      await store.disableAiAgents();
    } else {
      try {
        setAiAgentEnabled(true);
        const foldersWithFiles = await fetchCompletedFoldersWithFiles();
        if (foldersWithFiles.length > 0) {
          store.ensureAgentsForFolders(foldersWithFiles);
        }
      } catch {
        // Rollback on failure
        setAiAgentEnabled(false);
      }
    }
  }, [isEnabled, setAiAgentEnabled, fetchCompletedFoldersWithFiles, store]);

  const onSave = async () => {
    if (!selectedProviderId || !selectedModelId) return;

    setIsSaving(true);
    try {
      const updated = await updateDefaultProvider({
        providerId: selectedProviderId,
        defaultModel: selectedModelId,
      });
      store.setDefaultProvider(updated);
    } catch {
      // ignore
    } finally {
      setIsSaving(false);
    }
  };

  const onCancel = () => {
    if (!defaultProvider) return;

    setSelectedProviderId(defaultProvider.providerId);
    setSelectedModelId(defaultProvider.defaultModel);

    if (isProviderChanged) {
      fetchModels(defaultProvider.providerId);
    }
  };

  const toggleDisabled =
    !tourStore.showMockItems &&
    (isCheckingProviders ||
      isCreatingAgents ||
      (!isEnabled && !aiProvidersAvailable));

  return (
    <div className={inline ? styles.inlineBody : styles.panelBody}>
      <div className={styles.toggleBlock}>
        <div className={styles.toggleHeader}>
          <Text fontSize="16px" fontWeight={700}>
            {t("Common:EnableAIAgent")}
          </Text>
          <ToggleButton
            className={styles.toggle}
            isChecked={isEnabled}
            isDisabled={toggleDisabled}
            onChange={onToggleAiAgent}
          />
        </div>
        <Text fontSize="12px" fontWeight={400}>
          {t("Common:AIAgentDescription")}
        </Text>
        {!tourStore.showMockItems && isCheckingProviders && (
          <div className={styles.statusRow}>
            <Loader type={LoaderTypes.track} size="16px" />
            <Text fontSize="12px">{t("Common:CheckingAIProviders")}</Text>
          </div>
        )}
        {!tourStore.showMockItems && !isCheckingProviders && !aiProvidersAvailable && (
          <div className={styles.statusRow}>
            <Text fontSize="12px" fontWeight={400} color={globalColors.gray}>
              {t("Common:AIProvidersNotAvailable")}
            </Text>
            <Button
              label={t("Common:TryAgain")}
              size={ButtonSize.extraSmall}
              onClick={() => store.checkAiAvailability()}
              scale={false}
            />
          </div>
        )}
        {isCreatingAgents && (
          <div className={styles.statusRow}>
            <Loader type={LoaderTypes.track} size="16px" />
            <Text fontSize="12px">{t("Common:CreatingAIAgents")}</Text>
          </div>
        )}
        {!tourStore.showMockItems &&
          !isCheckingProviders &&
          aiProvidersAvailable &&
          !vectorizationEnabled && (
            <Text fontSize="12px" fontWeight={400} color={globalColors.mainRed}>
              {t("Common:KnowledgeBaseNotConfigured")}
            </Text>
          )}
      </div>

      {providers.length > 0 && aiProvidersAvailable && isEnabled && (
        <div className={styles.formBlock}>
          <FieldContainer
            labelVisible
            isVertical
            labelText={t("Common:AIProvider")}
            removeMargin
          >
            <ComboBox
              options={providerOptions}
              selectedOption={selectedProviderOption}
              displayArrow
              onSelect={onSelectProvider}
              displaySelectedOption
              directionY="both"
              dropDownMaxHeight={300}
            />
          </FieldContainer>

          <FieldContainer
            labelVisible
            isVertical
            labelText={t("Common:AIAgentModel")}
            removeMargin
          >
            <ComboBox
              options={modelOptions}
              selectedOption={selectedModelOption}
              displayArrow
              onSelect={onSelectModel}
              displaySelectedOption
              isDisabled={models.length === 0 && !defaultProvider}
              directionY="both"
              dropDownMaxHeight={300}
            />
          </FieldContainer>

          <div className={styles.buttonWrapper}>
            <Button
              primary
              size={ButtonSize.small}
              label={t("Common:SaveButton")}
              onClick={onSave}
              isLoading={isSaving}
              isDisabled={!hasChanges || isModelsLoading}
              style={{ marginInlineEnd: "8px" }}
            />
            <Button
              size={ButtonSize.small}
              label={t("Common:CancelButton")}
              onClick={onCancel}
              isDisabled={!hasChanges || isModelsLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default observer(AIAgentForm);
