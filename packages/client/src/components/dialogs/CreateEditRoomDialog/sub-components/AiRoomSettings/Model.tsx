// (c) Copyright Ascensio System SIA 2009-2025
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
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import { TAiProvider, TModel } from "@docspace/shared/api/ai/types";
import { ComboBox, TOption } from "@docspace/shared/components/combobox";
import { getModels, getProviders } from "@docspace/shared/api/ai";
import { toastr } from "@docspace/shared/components/toast";
import { RectangleSkeleton } from "@docspace/shared/skeletons";
import { TRoomParams } from "@docspace/shared/utils/rooms";

import { StyledParam } from "../Params/StyledParam";

type ModelSettingsProps = {
  roomParams: TRoomParams;
  setRoomParams: (value: TRoomParams) => void;
};

const ModelSettings = ({ roomParams, setRoomParams }: ModelSettingsProps) => {
  const { t } = useTranslation(["AIRoom", "Common"]);

  const [providers, setProviders] = React.useState<TAiProvider[]>([]);
  const [models, setModels] = React.useState<TModel[]>([]);

  const [selectedProvider, setSelectedProvider] = React.useState<TAiProvider>({
    id: roomParams.providerId ?? -1,
  } as TAiProvider);
  const [selectedModel, setSelectedModel] = React.useState<TModel | null>({
    modelId: roomParams.modelId ?? "",
  } as TModel);

  const [isProvidersLoading, setIsProvidersLoading] = React.useState(false);
  const [isProvidersFetched, setIsProvidersFetched] = React.useState(false);

  const prevSelectedModel = React.useRef<TModel | null>(null);

  React.useEffect(() => {
    const fetchProviders = async () => {
      try {
        setIsProvidersLoading(true);

        const p = await getProviders();
        setProviders(p);

        setIsProvidersFetched(true);

        if (selectedProvider.id === -1) {
          setSelectedProvider(p[0]);
        } else {
          const provider = p.find((pr) => pr.id === selectedProvider.id);

          if (!provider) return;

          setSelectedProvider(provider);
        }
      } catch (e) {
        toastr.error(e as string);
      } finally {
        setIsProvidersLoading(false);
      }
    };

    if (providers.length || isProvidersLoading || isProvidersFetched) return;

    fetchProviders();
  }, [
    selectedProvider?.id,
    providers.length,
    isProvidersLoading,
    isProvidersFetched,
  ]);

  React.useEffect(() => {
    const fetchModels = async () => {
      try {
        const m = await getModels(selectedProvider?.id);
        setModels(m);

        if (selectedModel?.modelId) {
          const model = m.find((mo) => mo.modelId === selectedModel.modelId);

          if (!model) return;

          setSelectedModel(model);
        } else {
          setSelectedModel(m[0]);
        }
      } catch (e) {
        toastr.error(e as string);
      }
    };

    if (!selectedProvider?.id || selectedProvider.id === -1) return;

    setSelectedModel(null);

    fetchModels();
  }, [selectedProvider?.id]);

  const providerOptions = React.useMemo(() => {
    return providers.map((provider) => ({
      key: provider.id,
      value: provider.id,
      label: provider.title,
    }));
  }, [providers]);

  const providerSelectedOption = React.useMemo(() => {
    return selectedProvider
      ? {
          key: selectedProvider.id,
          value: selectedProvider.id,
          label: selectedProvider.title,
        }
      : {
          key: "empty-selected-option",
          label: "",
        };
  }, [selectedProvider]);

  const onSelectProvider = React.useCallback(
    (option: TOption) => {
      const provider = providers.find((p) => p.id === option.key);

      if (!provider) return;

      setSelectedProvider(provider);
      setSelectedModel(null);
    },
    [providers],
  );

  const modelOptions = React.useMemo(() => {
    return models.map((model) => ({
      key: model.modelId,
      value: model.modelId,
      label: model.modelId,
    }));
  }, [models]);

  const modelSelectedOptions = React.useMemo(() => {
    return selectedModel
      ? {
          key: selectedModel.modelId,
          value: selectedModel.modelId,
          label: selectedModel.modelId,
        }
      : {
          key: "empty-selected-option",
          label: "",
        };
  }, [selectedModel]);

  const onSelectModel = React.useCallback(
    (option: TOption) => {
      const model = models.find((m) => m.modelId === option.key);

      if (!model) return;

      setSelectedModel(model);
    },
    [models],
  );

  React.useEffect(() => {
    if (!selectedModel) return;

    if (
      prevSelectedModel.current?.modelId === selectedModel?.modelId ||
      !selectedModel.providerId
    )
      return;

    setRoomParams({
      ...roomParams,
      modelId: selectedModel?.modelId,
      providerId: selectedModel?.providerId,
    });

    prevSelectedModel.current = selectedModel;
  }, [selectedModel?.modelId, roomParams]);

  return (
    <StyledParam increaseGap>
      <div className=" set_room_params-info">
        <div>
          <Text fontSize="13px" lineHeight="20px" fontWeight={600} noSelect>
            {t("Model")}
          </Text>
          <Text
            fontSize="12px"
            lineHeight="16px"
            fontWeight={400}
            className="set_room_params-info-description"
            noSelect
          >
            {t("ModelDescription")}
          </Text>
        </div>
        {isProvidersLoading ? (
          <RectangleSkeleton width="100%" height="32px" />
        ) : (
          <ComboBox
            options={providerOptions}
            selectedOption={providerSelectedOption}
            onSelect={onSelectProvider}
            scaled
            scaledOptions
            noBorder={false}
            className="ai-combobox"
          />
        )}
        {!selectedModel ? (
          <RectangleSkeleton width="100%" height="32px" />
        ) : (
          <ComboBox
            options={modelOptions}
            selectedOption={modelSelectedOptions}
            onSelect={onSelectModel}
            scaled
            scaledOptions
            dropDownMaxHeight={modelOptions.length > 7 ? 300 : undefined}
            isDefaultMode
            className="ai-combobox"
          />
        )}
      </div>
    </StyledParam>
  );
};

export default ModelSettings;
