/*
 * (c) Copyright Ascensio System SIA 2009-2025
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { ComboBox, TOption } from "@docspace/shared/components/combobox";
import {
  InputSize,
  InputType,
  TextInput,
} from "@docspace/shared/components/text-input";
import { ProviderType } from "@docspace/shared/api/ai/enums";
import { getAiProviderLabel } from "@docspace/shared/utils";

import styles from "./AddAIProviderDialog.module.scss";

type AddAIProviderDialogProps = {
  onClose: () => void;
};

const providerTypes: TOption[] = [
  { key: ProviderType.OpenAi, label: getAiProviderLabel(ProviderType.OpenAi) },
  {
    key: ProviderType.TogetherAi,
    label: getAiProviderLabel(ProviderType.TogetherAi),
  },

  {
    key: ProviderType.OpenAiCompatible,
    label: getAiProviderLabel(ProviderType.OpenAiCompatible),
  },
  {
    key: ProviderType.Anthropic,
    label: getAiProviderLabel(ProviderType.Anthropic),
  },
];

export const AddAIProviderDialog = ({ onClose }: AddAIProviderDialogProps) => {
  const { t } = useTranslation(["Common", "AISettings"]);
  const [selectedOption, setSelectedOption] = useState(providerTypes[0]);
  const [providerTitle, setProviderTitle] = useState("");
  const [providerKey, setProviderKey] = useState("");
  const [providerUrl, setProviderUrl] = useState("");

  const canSubmit =
    providerTitle.trim().length > 0 && providerUrl.trim().length > 0;

  return (
    <ModalDialog
      visible
      displayType={ModalDialogType.aside}
      onClose={onClose}
      withBodyScroll
    >
      <ModalDialog.Header>{t("AISettings:AIProvider")}</ModalDialog.Header>

      <ModalDialog.Body>
        <div className={styles.modalBody}>
          <FieldContainer
            labelText={t("AISettings:Provider")}
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
            labelText={t("Common:Label")}
            labelVisible
            isVertical
            removeMargin
            isRequired
          >
            <TextInput
              size={InputSize.base}
              type={InputType.text}
              value={providerTitle}
              onChange={(e) => setProviderTitle(e.target.value)}
              scale
              placeholder={t("AISettings:EnterLabel")}
            />
          </FieldContainer>

          <FieldContainer
            labelText={t("AISettings:ProviderURL")}
            labelVisible
            isVertical
            removeMargin
            isRequired
          >
            <TextInput
              size={InputSize.base}
              type={InputType.text}
              value={providerUrl}
              onChange={(e) => setProviderUrl(e.target.value)}
              scale
              placeholder={t("AISettings:EnterURL")}
            />
          </FieldContainer>
          <FieldContainer
            labelText={t("AISettings:ProviderKey")}
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
              placeholder={t("AISettings:EnterKey")}
            />
          </FieldContainer>
        </div>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Button
          primary
          size={ButtonSize.normal}
          label={t("Common:AddButton")}
          scale
          // onClick={onSubmitAction}
          // isLoading={loading}
          isDisabled={!canSubmit}
        />
        <Button
          size={ButtonSize.normal}
          label={t("Common:CancelButton")}
          scale
          onClick={onClose}
          // isDisabled={loading}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};
