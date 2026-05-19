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

import { useState, useCallback, useRef, useMemo, useEffect } from "react";

import { ProviderType } from "@docspace/shared/api/ai/enums";
import type {
  TModelCapabilities,
  TModelSettingsDto,
  TProviderModelInfo,
} from "@docspace/shared/api/ai/types";
import { previewProviderModels } from "@docspace/shared/api/ai";
import { toastr } from "@docspace/ui-kit/components/toast";

type TModelOverride = {
  displayName: string;
  capabilities: TModelCapabilities;
};

export type TModelSelectionState = {
  selectedIds: string[];
  overrides: Record<string, TModelOverride>;
  snapshots: Record<string, TModelOverride>;
};

const sortSelectedFirst = (
  models: TProviderModelInfo[],
  selectedIds: Set<string>,
) => {
  return [...models].sort((a, b) => {
    const aSelected = selectedIds.has(a.modelId) ? 0 : 1;
    const bSelected = selectedIds.has(b.modelId) ? 0 : 1;
    return aSelected - bSelected;
  });
};

const mapModelSettingsToModelInfo = (
  dto: TModelSettingsDto,
): TProviderModelInfo => ({
  modelId: dto.id,
  displayName: dto.alias ?? dto.id,
  isRecommended: dto.isRecommended,
  capabilities: dto.capabilities,
});

const DEBOUNCE_MS = 300;

export const useModelSelection = (
  providerType: ProviderType,
  providerKey: string,
  providerUrl?: string,
  initialModels?: TModelSettingsDto[],
) => {
  const [availableModels, setAvailableModels] = useState<TProviderModelInfo[]>(
    () => (initialModels ? initialModels.map(mapModelSettingsToModelInfo) : []),
  );
  const [selectedModelIds, setSelectedModelIds] = useState<Set<string>>(() =>
    initialModels
      ? new Set(initialModels.filter((d) => d.isEnabled).map((d) => d.id))
      : new Set(),
  );
  const [hasError, setHasError] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [settingsModelId, setSettingsModelId] = useState<string | null>(null);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(
    () => !!initialModels && initialModels.length > 0,
  );

  const [frozenSortIds, setFrozenSortIds] = useState<Set<string> | null>(null);
  const modelOverrides = useRef<Record<string, TModelOverride>>({});
  const settingsSnapshots = useRef<Record<string, TModelOverride>>({});
  const [overridesVersion, setOverridesVersion] = useState(0);

  useEffect(() => {
    if (initialModels) return;
    if (!providerKey) return;

    const abortController = new AbortController();

    const timer = setTimeout(async () => {
      setIsLoadingModels(true);
      try {
        const dtos = await previewProviderModels(
          {
            type: providerType,
            key: providerKey,
            url: providerUrl || undefined,
          },
          abortController,
        );
        const models = dtos.map(mapModelSettingsToModelInfo);
        setAvailableModels(models);

        const recommendedIds = dtos
          .filter((d) => d.isRecommended)
          .map((d) => d.id);
        setSelectedModelIds((prev) =>
          prev.size > 0 ? prev : new Set(recommendedIds),
        );

        setModelsLoaded(true);
      } catch (e) {
        if (abortController.signal.aborted) return;

        toastr.error(e as string);
        setAvailableModels([]);
        setModelsLoaded(false);
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoadingModels(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [providerType, providerKey, providerUrl, initialModels]);

  const loadModelsForProvider = useCallback(
    (
      savedState?: TModelSelectionState,
      cachedModels?: TProviderModelInfo[],
    ) => {
      if (savedState) {
        setSelectedModelIds(new Set(savedState.selectedIds));
        modelOverrides.current = { ...savedState.overrides };
        settingsSnapshots.current = { ...savedState.snapshots };
        setModelsLoaded(true);
      } else {
        setSelectedModelIds(new Set());
        modelOverrides.current = {};
        settingsSnapshots.current = {};
        setModelsLoaded(false);
      }

      setAvailableModels(cachedModels ?? []);
      setHasError(false);
      setOverridesVersion(0);
    },
    [],
  );

  const toggleModel = useCallback((modelId: string) => {
    setSelectedModelIds((prev) => {
      const next = new Set(prev);
      if (next.has(modelId)) {
        next.delete(modelId);
      } else {
        next.add(modelId);
      }
      return next;
    });
    setHasError(false);
  }, []);

  const updateModelSettings = useCallback(
    (
      modelId: string,
      displayName: string,
      capabilities: TModelCapabilities,
    ) => {
      modelOverrides.current[modelId] = { displayName, capabilities };
      setOverridesVersion((v) => v + 1);

      setAvailableModels((prev) =>
        prev.map((m) =>
          m.modelId === modelId ? { ...m, displayName, capabilities } : m,
        ),
      );
    },
    [],
  );

  const orderedModels = useMemo(() => {
    const sortIds = frozenSortIds ?? selectedModelIds;
    const recommended = availableModels.filter((m) => m.isRecommended);
    const other = availableModels.filter((m) => !m.isRecommended);

    return {
      recommended: sortSelectedFirst(recommended, sortIds),
      other: sortSelectedFirst(other, sortIds),
    };
  }, [availableModels, selectedModelIds, frozenSortIds]);

  const selectedModels = useMemo(() => {
    return availableModels.filter((m) => selectedModelIds.has(m.modelId));
  }, [availableModels, selectedModelIds]);

  const getState = useCallback((): TModelSelectionState => {
    return {
      selectedIds: Array.from(selectedModelIds),
      overrides: { ...modelOverrides.current },
      snapshots: { ...settingsSnapshots.current },
    };
  }, [selectedModelIds, overridesVersion]);

  const togglePopup = useCallback(() => {
    setIsPopupOpen((prev) => {
      if (prev) {
        setFrozenSortIds(null);
        if (selectedModelIds.size === 0) {
          setHasError(true);
        }
        return false;
      }
      setFrozenSortIds(new Set(selectedModelIds));
      return true;
    });
  }, [selectedModelIds]);

  const closePopup = useCallback(() => {
    setFrozenSortIds(null);
    setIsPopupOpen(false);
    if (selectedModelIds.size === 0) {
      setHasError(true);
    }
  }, [selectedModelIds]);

  const openSettings = useCallback(
    (modelId: string) => {
      if (!settingsSnapshots.current[modelId]) {
        const model = availableModels.find((m) => m.modelId === modelId);
        if (model) {
          settingsSnapshots.current[modelId] = {
            displayName: model.displayName,
            capabilities: { ...model.capabilities },
          };
        }
      }
      setSettingsModelId(modelId);
    },
    [availableModels],
  );

  const closeSettings = useCallback(() => {
    setSettingsModelId(null);
  }, []);

  const getModelForSettings = useCallback(() => {
    if (!settingsModelId) return null;
    return availableModels.find((m) => m.modelId === settingsModelId) ?? null;
  }, [settingsModelId, availableModels]);

  return {
    availableModels,
    selectedModelIds,
    hasError,
    isPopupOpen,
    settingsModelId,
    isLoadingModels,
    modelsLoaded,

    orderedModels,
    selectedModels,

    loadModelsForProvider,
    toggleModel,
    updateModelSettings,
    getState,

    togglePopup,
    closePopup,
    openSettings,
    closeSettings,
    getModelForSettings,
  };
};
