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

import { Text } from "@docspace/shared/components/text";
import {
  InputSize,
  InputType,
  TextInput,
} from "@docspace/shared/components/text-input";
import { ComboBox, TOption } from "@docspace/shared/components/combobox";
import { ProviderType } from "@docspace/shared/api/ai/enums";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import {
  createProvider,
  deleteProvider,
  getProviders,
} from "@docspace/shared/api/ai";
import { TAiProvider, TCreateAiProvider } from "@docspace/shared/api/ai/types";
import { IconButton } from "@docspace/shared/components/icon-button";

import DeleteIconReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.trash.react.svg?url";

import { AiProvider } from "./sub-components/ai-provider";
import { McpServers } from "./sub-components/mcp-servers";
import styles from "./AISettings.module.scss";

const getProviderLabel = (type: ProviderType) => {
  switch (type) {
    case ProviderType.OpenAi:
      return "OpenAI";
    case ProviderType.TogetherAi:
      return "TogetherAI";
    case ProviderType.OpenAiCompatible:
      return "OpenAI-compatible";
    case ProviderType.Anthropic:
      return "Anthropic ";
    default:
      return "";
  }
};

const providerTypes: TOption[] = [
  { key: ProviderType.OpenAi, label: getProviderLabel(ProviderType.OpenAi) },
  {
    key: ProviderType.TogetherAi,
    label: getProviderLabel(ProviderType.TogetherAi),
  },

  {
    key: ProviderType.OpenAiCompatible,
    label: getProviderLabel(ProviderType.OpenAiCompatible),
  },
  {
    key: ProviderType.Anthropic,
    label: getProviderLabel(ProviderType.Anthropic),
  },
];

const AISettngs = ({ standalone }: { standalone?: boolean }) => {
  const [selectedOption, setSelectedOption] = React.useState(providerTypes[0]);
  const [providerTitle, setProviderTitle] = React.useState("");
  const [providerKey, setProviderKey] = React.useState("");
  const [providerUrl, setProviderUrl] = React.useState("");

  const [providers, setProviders] = React.useState<TAiProvider[]>([]);

  const onAddProvider = async () => {
    let provider: TCreateAiProvider;

    if (selectedOption.key === ProviderType.OpenAiCompatible) {
      provider = {
        type: ProviderType.OpenAiCompatible,
        title: providerTitle,
        key: providerKey,
        url: providerUrl,
      };
    } else {
      provider = {
        type: selectedOption.key as ProviderType,
        title: providerTitle,
        key: providerKey,
      };
    }

    const newProvider = await createProvider(provider);

    setProviders((val) => [newProvider, ...val]);

    setProviderTitle("");
    setProviderKey("");
    setProviderUrl("");
  };

  const onDeleteProvider = async (providerId: TAiProvider["id"]) => {
    await deleteProvider({ ids: [providerId] });

    setProviders((val) => val.filter((p) => p.id !== providerId));
  };

  React.useEffect(() => {
    const fetchProviders = async () => {
      const newProviders = await getProviders();

      setProviders(newProviders);
    };

    fetchProviders();
  }, []);

  return (
    <div>
      <div className={styles.aiSettingsContainer}>
        {standalone ? <AiProvider /> : null}
        <McpServers standalone={standalone} />
        <div className={styles.addProvider}>
          <FieldContainer
            labelText="Provider type"
            labelVisible
            isVertical
            removeMargin
          >
            <ComboBox
              options={providerTypes}
              selectedOption={selectedOption}
              onSelect={(option) => setSelectedOption(option)}
              scaled
              scaledOptions
            />
          </FieldContainer>
          <FieldContainer
            labelText="Provider title"
            labelVisible
            isVertical
            removeMargin
          >
            <TextInput
              size={InputSize.base}
              type={InputType.text}
              value={providerTitle}
              onChange={(e) => setProviderTitle(e.target.value)}
              scale
              placeholder="Provider title"
            />
          </FieldContainer>

          <FieldContainer
            labelText="Provider key"
            labelVisible
            isVertical
            removeMargin
          >
            <TextInput
              size={InputSize.base}
              type={InputType.text}
              value={providerKey}
              onChange={(e) => setProviderKey(e.target.value)}
              scale
              placeholder="Provider key"
            />
          </FieldContainer>
          <FieldContainer
            labelText="Provider url"
            labelVisible
            isVertical
            removeMargin
          >
            <TextInput
              size={InputSize.base}
              type={InputType.text}
              value={providerUrl}
              onChange={(e) => setProviderUrl(e.target.value)}
              scale
              placeholder="Provider url"
            />
          </FieldContainer>
          <Button
            size={ButtonSize.normal}
            label="Add provider"
            onClick={onAddProvider}
            primary
            isDisabled={!selectedOption || !providerTitle || !providerKey}
            style={{ marginTop: "8px" }}
          />
        </div>
        <div className={styles.listProviders}>
          {providers.map((provider) => (
            <div className={styles.providerItem} key={provider.id}>
              <div className={styles.providerItemTitle}>
                <Text isBold fontSize="16px" lineHeight="20px">
                  {provider.title}
                </Text>
                <IconButton
                  iconName={DeleteIconReactSvgUrl}
                  onClick={() => onDeleteProvider(provider.id)}
                  size={16}
                />
              </div>

              <div>Type: {getProviderLabel(provider.type)}</div>
              <div>Url: {provider.url}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AISettngs;
