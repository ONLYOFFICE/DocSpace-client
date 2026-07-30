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

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { ModalDialogType } from "@docspace/ui-kit/components/modal-dialog/ModalDialog.enums";
import { Text } from "@docspace/ui-kit/components/text";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { TextInput, InputType } from "@docspace/ui-kit/components/text-input";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";
import { ComboBox } from "@docspace/ui-kit/components/combobox";

import styles from "../TenantPanel.module.scss";

interface AddRuleDialogProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (type: "allow" | "deny", value: string) => Promise<boolean>;
}

const AddRuleDialog = ({ visible, onClose, onAdd }: AddRuleDialogProps) => {
  const { t } = useTranslation(["DocsConnect", "Common"]);
  const [ruleType, setRuleType] = useState<"allow" | "deny">("allow");
  const [address, setAddress] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const ruleTypeOptions = [
    { key: "allow", label: t("DocsConnect:RuleAllow") },
    { key: "deny", label: t("DocsConnect:RuleDeny") },
  ];

  const onSubmit = async () => {
    const value = address.trim();
    if (!value) return;

    setIsSaving(true);
    try {
      const ok = await onAdd(ruleType, value);
      if (ok) onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ModalDialog
      visible={visible}
      displayType={ModalDialogType.modal}
      onClose={onClose}
      autoMaxHeight
    >
      <ModalDialog.Header>{t("DocsConnect:AddAccessRule")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.addRuleBody}>
          <Text fontSize="13px">
            {t("DocsConnect:AddAccessRuleDescription", {
              service: t("DocsConnect:DocsConnect"),
            })}
          </Text>
          <FieldContainer
            isVertical
            removeMargin
            labelVisible
            labelText={t("DocsConnect:RuleType")}
          >
            <ComboBox
              options={ruleTypeOptions}
              selectedOption={
                ruleTypeOptions.find((option) => option.key === ruleType) ??
                ruleTypeOptions[0]
              }
              onSelect={(option) =>
                setRuleType(option.key === "deny" ? "deny" : "allow")
              }
              scaled
            />
          </FieldContainer>
          <FieldContainer
            isVertical
            removeMargin
            labelVisible
            labelText={t("Common:Address")}
          >
            <TextInput
              type={InputType.text}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t("DocsConnect:RuleAddressPlaceholder")}
              scale
            />
            <Text fontSize="12px" className={styles.settingsHint}>
              {t("DocsConnect:RuleAddressExamples")}
            </Text>
          </FieldContainer>
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          primary
          scale
          size={ButtonSize.normal}
          label={t("Common:AddButton")}
          isLoading={isSaving}
          isDisabled={!address.trim() || isSaving}
          onClick={onSubmit}
        />
        <Button
          scale
          size={ButtonSize.normal}
          label={t("Common:CancelButton")}
          isDisabled={isSaving}
          onClick={onClose}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default AddRuleDialog;
