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

import DangerReactSvg from "PUBLIC_DIR/images/danger.toast.react.svg";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button, ButtonSize } from "@onlyoffice/apps-ui-kit/components/button";
import {
  ModalDialog,
  ModalDialogType,
} from "@onlyoffice/apps-ui-kit/components/modal-dialog";
import { RadioButton } from "@onlyoffice/apps-ui-kit/components/radio-button";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { ConflictResolveType } from "@docspace/shared/enums";

import type { TCascadeConflict, TCascadeItemType } from "../../types";
import styles from "../Panel.module.scss";

type ApplyMetadataDialogProps = {
  itemType: TCascadeItemType;
  templateName: string;
  onApply: (conflict: TCascadeConflict) => Promise<boolean>;
  onClose: () => void;
};

const ApplyMetadataDialog = ({
  itemType,
  templateName,
  onApply,
  onClose,
}: ApplyMetadataDialogProps) => {
  const { t } = useTranslation(["Metadata", "Common"]);
  const [conflict, setConflict] = useState<TCascadeConflict>(
    ConflictResolveType.Skip,
  );
  const [isApplying, setIsApplying] = useState(false);

  const overwriteDescriptions: Record<TCascadeItemType, string> = {
    folder: t("Metadata:OverwriteExistingValuesDescription"),
    room: t("Metadata:OverwriteExistingRoomValuesDescription"),
  };

  const options: {
    value: TCascadeConflict;
    title: string;
    description: string;
  }[] = [
    {
      value: ConflictResolveType.Skip,
      title: t("Metadata:SkipExistingValues"),
      description: t("Metadata:SkipExistingValuesDescription", {
        template: templateName,
      }),
    },
    {
      value: ConflictResolveType.Overwrite,
      title: t("Metadata:OverwriteExistingValues"),
      description: overwriteDescriptions[itemType],
    },
  ];

  const apply = async () => {
    setIsApplying(true);

    if (await onApply(conflict)) onClose();
    else setIsApplying(false);
  };

  return (
    <ModalDialog
      visible
      isLarge
      zIndex={312}
      displayType={ModalDialogType.modal}
      onClose={onClose}
      dataTestId="metadata_apply_dialog"
    >
      <ModalDialog.Header>{t("Metadata:ApplyMetadata")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.applyDialog}>
          <Text lineHeight="20px">
            {t("Metadata:ApplyMetadataDescription")}
          </Text>
          <div className={styles.infoBlock}>
            <DangerReactSvg className={styles.warningIcon} />
            <Text fontSize="12px" fontWeight={600} lineHeight="16px">
              {t("Metadata:NotImmediateOperation")}
            </Text>
          </div>
          <div className={styles.conflictActions}>
            <Text lineHeight="20px">
              {t("Common:ConflictResolveSelectAction")}
            </Text>
            {options.map((option) => (
              <div key={option.value} className={styles.conflictOption}>
                <RadioButton
                  name="metadata-cascade-conflict"
                  value={option.value}
                  label={option.title}
                  fontWeight={600}
                  isChecked={conflict === option.value}
                  onChange={() => setConflict(option.value)}
                  testId={`metadata_apply_conflict_${option.value}`}
                />
                <Text
                  className={styles.optionDescription}
                  fontSize="12px"
                  lineHeight="16px"
                >
                  {option.description}
                </Text>
              </div>
            ))}
          </div>
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          primary
          size={ButtonSize.normal}
          label={t("Common:ApplyButton")}
          isLoading={isApplying}
          onClick={apply}
          testId="metadata_apply_button"
        />
        <Button
          size={ButtonSize.normal}
          label={t("Common:CancelButton")}
          isDisabled={isApplying}
          onClick={onClose}
          testId="metadata_apply_cancel_button"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default ApplyMetadataDialog;
