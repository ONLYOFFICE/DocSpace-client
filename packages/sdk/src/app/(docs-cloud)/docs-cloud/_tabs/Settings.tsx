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

"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { InputType, TextInput } from "@docspace/ui-kit/components/text-input";
import { RadioButtonGroup } from "@docspace/ui-kit/components/radio-button-group";

import { setTenantConfiguration } from "@docspace/shared/api/docs-cloud";
import type { TTenantConfig } from "@docspace/shared/api/docs-cloud";

import styles from "./Settings.module.scss";

type SettingsTabProps = {
  config: TTenantConfig;
  onConfigChange: (config: TTenantConfig) => void;
};

export function SettingsTab({ config, onConfigChange }: SettingsTabProps) {
  const { t } = useTranslation(["DocsCloud"]);
  const [draft, setDraft] = useState<TTenantConfig>({ ...config });
  const [isSaving, setIsSaving] = useState(false);
  const setField = <K extends keyof TTenantConfig>(
    key: K,
    value: TTenantConfig[K],
  ) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setTenantConfiguration(draft);
      onConfigChange(draft);
    } finally {
      setIsSaving(false);
    }
  };

  const hasError = (val: string) => val.trim().length === 0;

  return (
    <div className={styles.form}>
      <div className={styles.field}>
        <Text className={styles.fieldLabel} fontSize="13px" fontWeight={600}>
          {t("DocumentServiceAuthHeader")}
        </Text>
        <TextInput
          type={InputType.text}
          value={draft.authorizationHeader}
          onChange={(e) => setField("authorizationHeader", e.target.value)}
          maxLength={50}
          scale
        />
      </div>

      <div className={styles.field}>
        <Text className={styles.fieldLabel} fontSize="13px" fontWeight={600}>
          {t("DocsCloud:DocumentServerSecret")}
        </Text>
        <TextInput
          type={InputType.password}
          value={draft.documentServerSecret}
          onChange={(e) => setField("documentServerSecret", e.target.value)}
          maxLength={50}
          scale
        />
      </div>

      <div className={styles.field}>
        <Text className={styles.fieldLabel} fontSize="13px" fontWeight={600}>
          {t("DocsCloud:AnonymousSupport")}
        </Text>
        <div className={styles.radioGroup}>
          <RadioButtonGroup
            orientation="horizontal"
            name="anonymous-support"
            options={[
              { value: "true", label: t("Yes") },
              { value: "false", label: t("No") },
            ]}
            selected={draft.anonymousSupport ? "true" : "false"}
            onClick={(e) =>
              setField(
                "anonymousSupport",
                (e as React.ChangeEvent<HTMLInputElement>).target.value ===
                  "true",
              )
            }
            spacing="16px"
          />
        </div>
      </div>

      <div className={styles.saveRow}>
        <Button
          label={t("Common:SaveButton")}
          size={ButtonSize.normal}
          isLoading={isSaving}
          isDisabled={hasError(draft.name)}
          onClick={handleSave}
          primary
        />
      </div>
    </div>
  );
}
