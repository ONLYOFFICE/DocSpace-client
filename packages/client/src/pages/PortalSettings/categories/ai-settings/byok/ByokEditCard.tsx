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
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import type { TByokKey } from "@docspace/shared/api/ai/types";

import ByokKeyField from "./ByokKeyField";
import { getByokProviderMeta } from "./providers";
import styles from "./Byok.module.scss";

type ByokEditCardProps = {
  byokKey: TByokKey;
  providerName: string;
  onSave: (modelId: string, provider: string, key: string) => Promise<void>;
  onDelete: (byokKey: TByokKey) => Promise<void>;
  onCancel: () => void;
};

const ByokEditCard = ({
  byokKey,
  providerName,
  onSave,
  onDelete,
  onCancel,
}: ByokEditCardProps) => {
  const { t } = useTranslation(["Common"]);

  const [apiKey, setApiKey] = React.useState("");
  const [error, setError] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const icon = getByokProviderMeta(byokKey.provider)?.icon;
  const isBusy = isSaving || isDeleting;

  const onSubmit = async () => {
    setIsSaving(true);
    setError("");
    try {
      await onSave(byokKey.id, byokKey.provider, apiKey.trim());
    } catch (e) {
      setError((e as Error).message);
      setIsSaving(false);
    }
  };

  const onDeleteClick = async () => {
    setIsDeleting(true);
    try {
      await onDelete(byokKey);
    } catch (e) {
      toastr.error(e as Error);
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.form} data-testid="byok-edit-card">
      <Text fontSize="14px" fontWeight={600}>
        {t("Common:ReplaceKey")}
      </Text>
      <div className={styles.editModel}>
        <div className={styles.cardIcon}>
          {icon ? <img src={icon} alt="" /> : null}
        </div>
        <div className={styles.cardInfo}>
          <Text fontSize="14px" fontWeight={600} truncate>
            {byokKey.name ?? byokKey.id}
          </Text>
          <Text className={styles.cardProvider} fontSize="12px" truncate>
            {providerName}
          </Text>
        </div>
      </div>
      <ByokKeyField
        providerId={byokKey.provider}
        value={apiKey}
        error={error}
        isDisabled={isBusy}
        onChange={(value) => {
          setApiKey(value);
          setError("");
        }}
      />
      <div className={styles.editFooter}>
        <Button
          size={ButtonSize.small}
          label={t("Common:Delete")}
          onClick={onDeleteClick}
          isLoading={isDeleting}
          isDisabled={isSaving}
          testId="byok-edit-delete-button"
        />
        <div className={styles.formButtons}>
          <Button
            size={ButtonSize.small}
            label={t("Common:CancelButton")}
            onClick={onCancel}
            isDisabled={isBusy}
            testId="byok-edit-cancel-button"
          />
          <Button
            primary
            size={ButtonSize.small}
            label={t("Common:SaveButton")}
            onClick={onSubmit}
            isLoading={isSaving}
            isDisabled={!apiKey.trim() || isDeleting}
            testId="byok-edit-save-button"
          />
        </div>
      </div>
    </div>
  );
};

export default ByokEditCard;
