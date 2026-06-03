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
import { PasswordInput } from "@docspace/ui-kit/components/password-input";
import { InputType, TextInput } from "@docspace/ui-kit/components/text-input";

import { setTenantConfiguration } from "@docspace/shared/api/docs-cloud";
import type { TTenantConfig } from "@docspace/shared/api/docs-cloud";

import type { SettingsTabProps } from "../types";
import styles from "./Settings.module.scss";

export const SettingsTab = ({ config, onConfigChange }: SettingsTabProps) => {
  const { t } = useTranslation(["DocsCloud", "Common"]);
  const [draft, setDraft] = useState<TTenantConfig>({ ...config });
  const [isSaving, setIsSaving] = useState(false);

  const setField = <K extends keyof TTenantConfig>(
    key: K,
    value: TTenantConfig[K],
  ) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const isDirty = JSON.stringify(draft) !== JSON.stringify(config);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setTenantConfiguration(draft);
      onConfigChange(draft);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft({ ...config });
  };

  return (
    <form
      className={styles.settings}
      autoComplete="off"
      onSubmit={(e) => e.preventDefault()}
    >
      {/* AUTHORIZATION */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionTitle}>
            {t("Common:Authorization")}
          </span>
        </div>
        <div className={styles.sectionCard}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              {t("DocumentServiceAuthHeader")}
            </label>
            <TextInput
              type={InputType.text}
              value={draft.authorizationHeader}
              onChange={(e) => setField("authorizationHeader", e.target.value)}
              maxLength={50}
              autoComplete="off"
              scale
            />
            <span className={styles.help}>{t("DocsCloud:AuthHeaderHelp")}</span>
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              {t("DocsCloud:DocumentServerSecret")}
            </label>
            <PasswordInput
              inputValue={draft.documentServerSecret}
              onChange={(_, value) =>
                setField("documentServerSecret", value ?? "")
              }
              placeholder={t("DocsCloud:JWTSecretPlaceholder")}
              simpleView
              isDisableTooltip
              isSimulateType
              simulateSymbol="•"
              autoComplete="new-password"
              scale
            />
            <span className={styles.help}>{t("DocsCloud:JWTSecretHelp")}</span>
          </div>
        </div>
      </div>

      {/* ACCESS */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionTitle}>{t("DocsCloud:Access")}</span>
        </div>
        <div className={styles.sectionCard}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              {t("DocsCloud:AnonymousSupport")}
            </label>
            <div className={styles.segmented}>
              <button
                type="button"
                className={draft.anonymousSupport ? styles.segmentOn : ""}
                onClick={() => setField("anonymousSupport", true)}
              >
                {t("Common:Yes")}
              </button>
              <button
                type="button"
                className={!draft.anonymousSupport ? styles.segmentOn : ""}
                onClick={() => setField("anonymousSupport", false)}
              >
                {t("Common:No")}
              </button>
            </div>
            <span className={styles.help}>
              {t("DocsCloud:AnonymousSupportHelp")}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.sectionFooter}>
        <Button
          label={t("Common:SaveButton")}
          size={ButtonSize.normal}
          isLoading={isSaving}
          isDisabled={!isDirty}
          onClick={handleSave}
          primary
        />
        <Button
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          isDisabled={isSaving || !isDirty}
          onClick={handleCancel}
        />
        {isDirty && !isSaving && (
          <span className={styles.dirtyNote}>{t("Common:UnsavedChanges")}</span>
        )}
      </div>
    </form>
  );
};

