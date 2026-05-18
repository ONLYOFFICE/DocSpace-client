/*
 * (c) Copyright Ascensio System SIA 2009-2026
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

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import equal from "fast-deep-equal/react";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";
import {
  InputSize,
  InputType,
  TextInput,
} from "@docspace/ui-kit/components/text-input";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { Text } from "@docspace/ui-kit/components/text";

import type {
  TModelCapabilities,
  TProviderModelInfo,
} from "@docspace/shared/api/ai/types";
import { getBrandName } from "@docspace/shared/constants/brands";

import styles from "./ModelSettingsPanel.module.scss";

type ModelSettingsPanelProps = {
  model: TProviderModelInfo;
  onSave: (
    modelId: string,
    displayName: string,
    capabilities: TModelCapabilities,
  ) => void;
  onClose: () => void;
};

export const ModelSettingsPanel = ({
  model,
  onSave,
  onClose,
}: ModelSettingsPanelProps) => {
  const { t } = useTranslation(["AISettings", "Common"]);

  const [displayName, setDisplayName] = useState(model.displayName);
  const [capabilities, setCapabilities] = useState<TModelCapabilities>({
    ...model.capabilities,
  });

  const hasChanges = useMemo(() => {
    if (displayName !== model.displayName) return true;
    return !equal(capabilities, model.capabilities);
  }, [displayName, capabilities, model.displayName, model.capabilities]);

  const handleCapabilityChange = (key: keyof TModelCapabilities) => {
    setCapabilities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    onSave(model.modelId, displayName, capabilities);
    onClose();
  };

  return (
    <ModalDialog
      visible
      displayType={ModalDialogType.aside}
      onClose={onClose}
      withBodyScroll
      backdropVisible={false}
      isBackButton
      onBackClick={onClose}
      zIndex={451}
    >
      <ModalDialog.Header>{t("Common:ModelSettings")}</ModalDialog.Header>

      <ModalDialog.Body>
        <div className={styles.body}>
          <FieldContainer
            labelText={t("AISettings:ModelName")}
            labelVisible
            isVertical
            removeMargin
          >
            <TextInput
              size={InputSize.base}
              type={InputType.text}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              scale
              testId="model-name-input"
            />
            <Text className={styles.hint}>{t("AISettings:ModelNameHint")}</Text>
          </FieldContainer>

          <FieldContainer
            labelText={t("AISettings:Capabilities")}
            labelVisible
            isVertical
            removeMargin
            className={styles.capabilitiesField}
          >
            <Text className={styles.capabilitiesDescription}>
              {t("AISettings:CapabilitiesDescription", {
                productName: getBrandName("ProductName"),
              })}
            </Text>
            <div className={styles.checkboxList}>
              <Checkbox
                label={t("AISettings:CapabilityVision")}
                isChecked={capabilities.vision}
                onChange={() => handleCapabilityChange("vision")}
              />
              <Checkbox
                label={t("AISettings:CapabilityToolCalling")}
                isChecked={capabilities.toolCalling}
                onChange={() => handleCapabilityChange("toolCalling")}
              />
              <Checkbox
                label={t("AISettings:CapabilityExtendedThinking")}
                isChecked={capabilities.thinking}
                onChange={() => handleCapabilityChange("thinking")}
              />
            </div>
          </FieldContainer>
        </div>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Button
          primary
          size={ButtonSize.normal}
          label={t("Common:SaveButton")}
          scale
          onClick={handleSave}
          isDisabled={!hasChanges || displayName.trim().length === 0}
          testId="model-settings-save-button"
        />
        <Button
          size={ButtonSize.normal}
          label={t("Common:CancelButton")}
          scale
          onClick={onClose}
          testId="model-settings-cancel-button"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

