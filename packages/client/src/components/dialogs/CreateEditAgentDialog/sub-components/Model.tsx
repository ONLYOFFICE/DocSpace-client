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
import { Trans, useTranslation } from "react-i18next";
import { useStores } from "@docspace/ui-kit/ai-agent/providers";
import type { Profile } from "@docspace/ui-kit/ai-agent/providers";

import { Text } from "@docspace/ui-kit/components/text";
import { ComboBox, type TOption } from "@docspace/ui-kit/components/combobox";
import type { TAgentParams } from "@docspace/shared/utils/aiAgents";

import { StyledParam } from "../../../CreateEditDialogParams/StyledParam";

type ModelSettingsProps = {
  agentParams: TAgentParams;
  setAgentParams: (value: Partial<TAgentParams>) => void;
};

const ModelSettings = ({ agentParams, setAgentParams }: ModelSettingsProps) => {
  const { t } = useTranslation(["Common"]);
  const { useProfilesStore } = useStores();
  const profiles = useProfilesStore((s) => s.profiles);
  const defaultProfile = useProfilesStore((s) => s.defaultProfile);

  const [selectedProfile, setSelectedProfile] = React.useState<Profile | null>(
    null,
  );
  const isInitializedRef = React.useRef(false);
  const prevModelIdRef = React.useRef<string | undefined>(undefined);

  React.useEffect(() => {
    if (isInitializedRef.current || profiles.length === 0) return;
    isInitializedRef.current = true;

    if (agentParams.modelId) {
      const match = profiles.find((p) => p.modelId === agentParams.modelId);
      if (match) {
        setSelectedProfile(match);
        return;
      }
    }

    setSelectedProfile(defaultProfile ?? profiles[0] ?? null);
  }, [profiles, defaultProfile, agentParams.modelId]);

  React.useEffect(() => {
    if (!selectedProfile) return;
    if (prevModelIdRef.current === selectedProfile.modelId) return;

    prevModelIdRef.current = selectedProfile.modelId;
    setAgentParams({
      modelId: selectedProfile.modelId,
      providerId: undefined,
      profileId: selectedProfile.id,
    });
  }, [selectedProfile, setAgentParams]);

  const options = React.useMemo<TOption[]>(
    () => profiles.map((p) => ({ key: p.id, value: p.id, label: p.name })),
    [profiles],
  );

  const hasNoProfiles = profiles.length === 0;

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
            label: hasNoProfiles ? t("Common:NoModelsFound") : "",
          },
    [selectedProfile, hasNoProfiles, t],
  );

  const onSelect = React.useCallback(
    (option: TOption) => {
      const profile = profiles.find((p) => p.id === option.key);
      if (profile) setSelectedProfile(profile);
    },
    [profiles],
  );

  return (
    <StyledParam increaseGap>
      <div className=" set_room_params-info">
        <div>
          <Text fontSize="13px" lineHeight="20px" fontWeight={600} noSelect>
            {t("AIProviderAndModel", {
              aiProvider: t("Common:AIProvider"),
            })}
          </Text>
          <Text
            fontSize="12px"
            lineHeight="16px"
            fontWeight={400}
            className="set_room_params-info-description"
            noSelect
          >
            {t("ModelDescription", {
              aiProvider: t("Common:AIProvider"),
            })}
          </Text>
          <Text
            fontSize="12px"
            lineHeight="16px"
            fontWeight={400}
            className="set_room_params-info-description"
            noSelect
          >
            <Trans
              t={t}
              i18nKey="ResponseQualityNode"
              ns="Common"
              components={{
                1: <span key="1" style={{ fontWeight: 600 }} />,
              }}
            />
          </Text>
        </div>
        <ComboBox
          options={options}
          selectedOption={selectedOption}
          onSelect={onSelect}
          scaled
          scaledOptions
          dropDownMaxHeight={options.length > 7 ? 300 : undefined}
          noBorder={false}
          className="ai-combobox"
          displaySelectedOption
          isDisabled={profiles.length === 0}
          dataTestId="create_agent_model_combobox"
        />
      </div>
    </StyledParam>
  );
};

export default ModelSettings;

