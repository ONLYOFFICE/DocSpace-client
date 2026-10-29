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
import { useTranslation } from "react-i18next";

import { Button, ButtonSize } from "@onlyoffice/apps-ui-kit/components/button";
import { ComboBox, type TOption } from "@onlyoffice/apps-ui-kit/components/combobox";
import { FieldContainer } from "@onlyoffice/apps-ui-kit/components/field-container";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import type { TByokProvider } from "@docspace/shared/api/ai/types";

import ByokKeyField from "./ByokKeyField";
import styles from "./Byok.module.scss";

type ByokKeyFormProps = {
  providers: TByokProvider[];
  onSave: (modelId: string, provider: string, key: string) => Promise<void>;
  onCancel: () => void;
};

const ByokKeyForm = ({ providers, onSave, onCancel }: ByokKeyFormProps) => {
  const { t } = useTranslation(["Common"]);

  const [providerId, setProviderId] = React.useState("");
  const [modelId, setModelId] = React.useState("");
  const [apiKey, setApiKey] = React.useState("");
  const [error, setError] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  const providerOptions: TOption[] = providers.map(({ id, name }) => ({
    key: id,
    label: name,
  }));

  const modelOptions: TOption[] = (
    providers.find(({ id }) => id === providerId)?.models ?? []
  ).map(({ id, name }) => ({ key: id, label: name }));

  const selectedProvider = providerOptions.find(
    ({ key }) => key === providerId,
  );
  const selectedModel = modelOptions.find(({ key }) => key === modelId);

  const onSelectProvider = (option: TOption) => {
    if (option.key === providerId) return;
    setProviderId(String(option.key));
    setModelId("");
    setError("");
  };

  const onSubmit = async () => {
    setIsSaving(true);
    setError("");
    try {
      await onSave(modelId, providerId, apiKey.trim());
    } catch (e) {
      setError((e as Error).message);
      setIsSaving(false);
    }
  };

  const isSubmitDisabled = !providerId || !modelId || !apiKey.trim();

  return (
    <div className={styles.form} data-testid="byok-key-form">
      <Text fontSize="14px" fontWeight={600}>
        {t("Common:ConnectNewAIModel")}
      </Text>
      <FieldContainer
        labelVisible
        isVertical
        labelText={t("Common:Provider")}
        removeMargin
      >
        <ComboBox
          options={providerOptions}
          selectedOption={
            selectedProvider ??
            ({ label: t("Common:SelectProvider") } as TOption)
          }
          scaled
          scaledOptions
          displayArrow
          displaySelectedOption
          onSelect={onSelectProvider}
          isDisabled={isSaving}
          dataTestId="byok-provider-combobox"
          dropDownTestId="byok-provider-dropdown"
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
          selectedOption={
            selectedModel ?? ({ label: t("Common:SelectModel") } as TOption)
          }
          scaled
          scaledOptions
          displayArrow
          displaySelectedOption
          onSelect={(option) => setModelId(String(option.key))}
          isDisabled={!providerId || isSaving}
          dataTestId="byok-model-combobox"
          dropDownTestId="byok-model-dropdown"
        />
      </FieldContainer>
      <ByokKeyField
        providerId={providerId}
        value={apiKey}
        error={error}
        isDisabled={isSaving}
        onChange={(value) => {
          setApiKey(value);
          setError("");
        }}
      />
      <div className={styles.formButtons}>
        <Button
          size={ButtonSize.small}
          label={t("Common:CancelButton")}
          onClick={onCancel}
          isDisabled={isSaving}
          testId="byok-cancel-button"
        />
        <Button
          primary
          size={ButtonSize.small}
          label={t("Common:AddModel")}
          onClick={onSubmit}
          isLoading={isSaving}
          isDisabled={isSubmitDisabled}
          testId="byok-submit-button"
        />
      </div>
    </div>
  );
};

export default ByokKeyForm;
