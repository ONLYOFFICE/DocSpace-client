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

import React from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { ComboBox, type TOption } from "@docspace/ui-kit/components/combobox";
import { useStores } from "@docspace/ui-kit/ai-agent/providers";
import { RecomendedModel } from "@docspace/ui-kit/ai-agent/recomended-model";
import {
  isChatCapableProfile,
  OPENROUTER_AI_PROFILE_PROVIDER_TYPE,
  SYSTEM_AI_PROFILE_PROVIDER_TYPE,
} from "@docspace/shared/api/ai/enums";
import type { TAgentParams } from "@docspace/shared/utils/aiAgents";

import { StyledParam } from "../../../CreateEditDialogParams/StyledParam";

type ProfileSettingsProps = {
  agentParams: TAgentParams;
  isAdmin?: boolean;
  recommendedModelForForms?: string;
  /**
   * The dialog was opened from the in-chat notice about the model tested for
   * form results. That notice is the only entry point that raises the
   * recommendation here — opened from anywhere else, the dialog says nothing
   * about it.
   */
  openedFromChat?: boolean;
  /** Self-hosted portal — no ONLYOFFICE AI, models come through OpenRouter. */
  standalone?: boolean;
  setAgentParams: (value: Partial<TAgentParams>) => void;
};

// Where the model we recommend for forms can come from: OpenRouter on a
// standalone portal (the system provider is hidden there), the portal's own
// AI — the one billed through the wallet — on SaaS. A profile on any other
// provider may carry the same model id by coincidence; it is not what the
// recommendation is about.
const RECOMMENDED_MODEL_PROVIDER_TYPES: string[] = [
  OPENROUTER_AI_PROFILE_PROVIDER_TYPE,
  SYSTEM_AI_PROFILE_PROVIDER_TYPE,
];

// Single combobox with the AI profiles configured in the chat library
// (provider + model pairs). Replaces the previous provider/model pair of
// comboboxes: the new agent-creation endpoint (POST /ai/agents) takes a
// `profileId` and binds the profile to the created agent server-side.
const ProfileSettings = ({
  agentParams,
  isAdmin,
  recommendedModelForForms,
  openedFromChat,
  standalone,
  setAgentParams,
}: ProfileSettingsProps) => {
  const { t } = useTranslation(["Common"]);
  const navigate = useNavigate();
  const { useProfilesStore } = useStores();

  const profiles = useProfilesStore((s) => s.profiles);
  const chatProfile = useProfilesStore((s) => s.chatProfile);
  const defaultProfile = useProfilesStore((s) => s.defaultProfile);
  const initialized = useProfilesStore((s) => s.initialized);

  const selectedProfileId = agentParams.profileId;

  // Agents chat with their model, so image-only gateway profiles (Nano
  // Banana & co) are not offered — every send through them dies with an
  // upstream model_not_found (Bug 82663). Same filter the chat lib applies
  // in its own model pickers. A profile already saved on the agent is kept
  // as the selection even when filtered out, so opening the edit dialog
  // never reassigns the model silently.
  const chatProfiles = React.useMemo(
    () => profiles.filter(isChatCapableProfile),
    [profiles],
  );

  // Preselect the chat (or default, or first) profile once profiles arrive.
  // Only write to agentParams when the value actually changes — an
  // unconditional set produces a fresh state object every run and can
  // ping-pong with other agentParams effects into an infinite update loop.
  React.useEffect(() => {
    if (!chatProfiles.length) return;
    if (selectedProfileId && profiles.some((p) => p.id === selectedProfileId))
      return;

    const preferred =
      [chatProfile, defaultProfile].find(
        (p) => p && isChatCapableProfile(p),
      ) ?? chatProfiles[0];
    if (preferred && preferred.id !== selectedProfileId)
      setAgentParams({ profileId: preferred.id });
  }, [
    profiles,
    chatProfiles,
    chatProfile,
    defaultProfile,
    selectedProfileId,
    setAgentParams,
  ]);

  const options = React.useMemo<TOption[]>(
    () =>
      chatProfiles.map((profile) => ({
        key: profile.id,
        value: profile.id,
        label: profile.name,
      })),
    [chatProfiles],
  );

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);

  const selectedOption = React.useMemo<TOption>(
    () =>
      selectedProfile
        ? {
            key: selectedProfile.id,
            value: selectedProfile.id,
            label: selectedProfile.name,
          }
        : {
            key: "empty-selected-option",
            label: chatProfiles.length ? "" : t("Common:NoModelsFound"),
          },
    [selectedProfile, chatProfiles.length, t],
  );

  const onSelectProfile = React.useCallback(
    (option: TOption) => {
      const profile = profiles.find((p) => p.id === option.key);
      if (!profile) return;
      setAgentParams({ profileId: profile.id });
    },
    [profiles, setAgentParams],
  );

  const recommendedModel = recommendedModelForForms ?? "";

  // The recommended model is selectable here when a chat-capable profile from
  // one of its two sources carries it — profiles replaced the provider + model
  // pair, so this is what "the recommended model is available" means now.
  const recommendedProfile = React.useMemo(
    () =>
      recommendedModel
        ? chatProfiles.find(
            (p) =>
              p.modelId === recommendedModel &&
              RECOMMENDED_MODEL_PROVIDER_TYPES.includes(p.providerType),
          )
        : undefined,
    [chatProfiles, recommendedModel],
  );

  const onSelectRecomendedModel = React.useCallback(() => {
    if (!recommendedProfile) return;
    setAgentParams({ profileId: recommendedProfile.id });
  }, [recommendedProfile, setAgentParams]);

  const onOpenSettings = React.useCallback(() => {
    navigate("/portal-settings/ai-settings/ai-models");
  }, [navigate]);

  return (
    <StyledParam increaseGap>
      {/* width:100% so the scaled ComboBox spans the dialog width instead of
          shrinking to its content (the shared StyledParam info block sizes to
          content by default). */}
      <div className=" set_room_params-info" style={{ width: "100%" }}>
        <div>
          <Text fontSize="13px" lineHeight="20px" fontWeight={600} noSelect>
            {t("Common:AIAgentModel", { defaultValue: "Model" })}
          </Text>
          <Text
            fontSize="12px"
            lineHeight="16px"
            fontWeight={400}
            className="set_room_params-info-description"
            noSelect
          >
            {t("Common:AgentProfileDescription", {
              defaultValue:
                "Select the AI model to be used in this agent's chats.",
            })}
          </Text>
        </div>

        {/* Only when the user came from the in-chat notice, and not until
            profiles are loaded — otherwise it briefly flashes the wrong,
            not-available state. Hides itself once the selected profile is on
            the recommended model.

            The not-available branch tells admins to add OpenRouter, which is
            the answer on a standalone portal only: on SaaS the model comes
            with the portal's own AI, and a user who cannot switch to it here
            has nothing to add — say nothing rather than send them after a
            provider they do not need. */}
        {openedFromChat &&
        initialized &&
        recommendedModel &&
        (standalone || recommendedProfile) ? (
          <RecomendedModel
            isAdmin={!!isAdmin}
            isChat={false}
            selectedModel={selectedProfile?.modelId ?? ""}
            recomendedModel={recommendedModel}
            isAvailable={!!recommendedProfile}
            onOpenSettings={onOpenSettings}
            onSelectModel={onSelectRecomendedModel}
          />
        ) : null}

        <ComboBox
          options={options}
          selectedOption={selectedOption}
          onSelect={onSelectProfile}
          scaled
          scaledOptions
          dropDownMaxHeight={options.length > 7 ? 300 : undefined}
          isDefaultMode
          className="ai-combobox"
          displaySelectedOption
          isDisabled={!chatProfiles.length}
          dataTestId="create_agent_profile_combobox"
        />
      </div>
    </StyledParam>
  );
};

// Intentionally not wrapped in mobx `observer`: the component reads only
// zustand stores (useSyncExternalStore) and local props; mixing observer's
// reaction-driven re-renders with external-store subscriptions is what made
// the preselect loop surface as a mobx "Maximum update depth" crash.
export default ProfileSettings;
