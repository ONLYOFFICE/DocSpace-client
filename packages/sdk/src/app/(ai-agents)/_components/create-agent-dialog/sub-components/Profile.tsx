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

// (c) Copyright Ascensio System SIA 2009-2026
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

"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { ComboBox, type TOption } from "@docspace/ui-kit/components/combobox";
import { useStores } from "@docspace/ui-kit/ai-agent/providers";
import type { TAgentParams } from "@docspace/shared/utils/aiAgents";

import { StyledParam } from "./StyledParam";

type ProfileSettingsProps = {
  agentParams: TAgentParams;
  setAgentParams: (value: Partial<TAgentParams>) => void;
};

// Single combobox with the AI profiles configured in the chat library
// (provider + model pairs). Replaces the previous provider/model pair of
// comboboxes: the new agent-creation endpoint (POST /new-ai/agents) takes a
// `profileId` and binds the profile to the created agent server-side.
const ProfileSettings = ({
  agentParams,
  setAgentParams,
}: ProfileSettingsProps) => {
  const { t } = useTranslation(["Common"]);
  const stores = useStores();

  const profiles = stores.useProfilesStore((s) => s.profiles);
  const chatProfile = stores.useProfilesStore((s) => s.chatProfile);
  const defaultProfile = stores.useProfilesStore((s) => s.defaultProfile);

  const selectedProfileId = agentParams.profileId;

  // Preselect the chat (or default, or first) profile once profiles arrive.
  // Only write to agentParams when the value actually changes — an
  // unconditional set produces a fresh state object every run and can
  // ping-pong with other agentParams effects into an infinite update loop.
  React.useEffect(() => {
    if (!profiles.length) return;
    if (selectedProfileId && profiles.some((p) => p.id === selectedProfileId))
      return;

    const preferred = chatProfile ?? defaultProfile ?? profiles[0];
    if (preferred && preferred.id !== selectedProfileId)
      setAgentParams({ profileId: preferred.id });
  }, [
    profiles,
    chatProfile,
    defaultProfile,
    selectedProfileId,
    setAgentParams,
  ]);

  const options = React.useMemo<TOption[]>(
    () =>
      profiles.map((profile) => ({
        key: profile.id,
        value: profile.id,
        label: profile.name,
      })),
    [profiles],
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
            label: profiles.length ? "" : t("Common:NoModelsFound"),
          },
    [selectedProfile, profiles.length, t],
  );

  const onSelectProfile = React.useCallback(
    (option: TOption) => {
      const profile = profiles.find((p) => p.id === option.key);
      if (!profile) return;
      setAgentParams({ profileId: profile.id });
    },
    [profiles, setAgentParams],
  );

  return (
    <StyledParam increaseGap>
      <div className=" set_room_params-info">
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
          isDisabled={!profiles.length}
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
