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

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { ProfilePickerAction } from "@onlyoffice/apps-ui-kit/ai-agent/providers";

import type { TAiPreset } from "SRC_DIR/store/AiPresetsStore";

/** Prefix of the picker row ids, so a pick is told apart from an agent's. */
export const AI_PRESET_ACTION_PREFIX = "ai-preset:";

export const isAiPresetActionId = (actionId?: string): boolean =>
  actionId !== undefined && actionId.startsWith(AI_PRESET_ACTION_PREFIX);

/**
 * Builds the "Choose AI Preset" entry for the chat model picker, next to
 * "Choose AI Agent": a submenu of the user's AI projects. Picking one hands
 * the preset to `onPresetPick`; a preset with a model also carries its
 * `profileId`, so the picker switches the model itself. Empty while the user
 * has no presets.
 */
export const useAiPresetsPickerActions = (
  presets: TAiPreset[],
  onPresetPick: (preset: TAiPreset) => void,
): ProfilePickerAction[] => {
  const { t } = useTranslation(["Common"]);

  return useMemo<ProfilePickerAction[]>(() => {
    if (presets.length === 0) return [];

    return [
      {
        id: "choose-ai-preset",
        text: t("Common:ChooseAIProject"),
        items: presets.map((preset) => ({
          id: `${AI_PRESET_ACTION_PREFIX}${preset.id}`,
          text: preset.name,
          profileId: preset.profileId ?? undefined,
          onClick: () => onPresetPick(preset),
        })),
      },
    ];
  }, [presets, onPresetPick, t]);
};

export default useAiPresetsPickerActions;
