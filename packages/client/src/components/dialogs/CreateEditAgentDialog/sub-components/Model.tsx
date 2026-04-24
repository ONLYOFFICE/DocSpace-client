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

import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { useStores } from "@onlyoffice/ai-chat";
import type { Profile } from "@onlyoffice/ai-chat";

import { Text } from "@docspace/ui-kit/components/text";
import { ComboBox, type TOption } from "@docspace/ui-kit/components/combobox";
import type { TAgentParams } from "@docspace/shared/utils/aiAgents";

import { StyledParam } from "../../../CreateEditDialogParams/StyledParam";

type ModelSettingsProps = {
  agentParams: TAgentParams;
  setAgentParams: (value: Partial<TAgentParams>) => void;
};

const ModelSettings = ({ agentParams, setAgentParams }: ModelSettingsProps) => {
  const { t } = useTranslation(["AIRoom", "Common"]);
  const { useProfilesStore } = useStores();
  const profiles = useProfilesStore((s) => s.profiles);
  const defaultProfile = useProfilesStore((s) => s.defaultProfile);

  const [selectedProfile, setSelectedProfile] = React.useState<Profile | null>(null);
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
    setAgentParams({ modelId: selectedProfile.modelId, providerId: undefined, profileId: selectedProfile.id });
  }, [selectedProfile, setAgentParams]);

  const options = React.useMemo<TOption[]>(
    () => profiles.map((p) => ({ key: p.id, value: p.id, label: p.name })),
    [profiles],
  );

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
            label: profiles.length === 0 ? t("Common:NoModelsFound") : "",
          },
    [selectedProfile, profiles.length, t],
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
            {t("Model", {
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
              ns="AIRoom"
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
