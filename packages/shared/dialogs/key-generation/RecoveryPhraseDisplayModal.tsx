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

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { Text } from "@docspace/ui-kit/components/text";
import { toastr } from "@docspace/ui-kit/components/toast";
import { getBrandName } from "@docspace/shared/constants/brands";

import {
  buildRecoveryKitHtml,
  downloadRecoveryKitHtml,
  printRecoveryKit,
} from "./recovery-kit";
import styles from "./RecoveryPhraseDisplayModal.module.scss";

type RecoveryPhraseDisplayModalProps = {
  visible: boolean;
  mnemonic: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  accountLabel?: string;
};

export const RecoveryPhraseDisplayModal: React.FC<
  RecoveryPhraseDisplayModalProps
> = ({
  visible,
  mnemonic,
  onConfirm,
  onCancel,
  isLoading = false,
  accountLabel,
}) => {
  const { t, ready, i18n } = useTranslation(["Common"]);
  const [acknowledged, setAcknowledged] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  const words = useMemo(() => mnemonic.trim().split(/\s+/), [mnemonic]);
  const wordCount = words.length;

  useEffect(() => {
    if (visible) {
      setAcknowledged(false);
      setHasSaved(false);
    }
  }, [visible]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(mnemonic);
      setHasSaved(true);
      toastr.success(t("Common:Copied"));
    } catch {
      toastr.error(t("Common:CopyFailed"));
    }
  }, [mnemonic, t]);

  const buildKitHtml = useCallback(() => {
    const productName = getBrandName("ProductName");
    return buildRecoveryKitHtml({
      words,
      createdDate: new Date().toLocaleDateString(i18n.language),
      lang: i18n.language,
      dir: i18n.dir(),
      accountLabel,
      strings: {
        title: t("Common:RecoveryKitTitle", { productName }),
        subtitle: t("Common:RecoveryKitSubtitle"),
        createdLabel: t("Common:ByCreation"),
        accountLabel: t("Common:Account"),
        phraseLabel: t("Common:RecoveryKitPhraseLabel"),
        whatTitle: t("Common:RecoveryKitWhatTitle"),
        whatText: t("Common:RecoveryKitWhatText", {
          productName,
          wordCount,
        }),
        howTitle: t("Common:RecoveryKitHowTitle"),
        howText: t("Common:RecoveryKitHowText", {
          action: t("Common:UseRecoveryPhrase"),
          wordCount,
        }),
        storageTitle: t("Common:RecoveryKitStorageTitle"),
        storageText: t("Common:RecoveryKitStorageText"),
        warning: t("Common:RecoveryPhraseWarning"),
        footer: t("Common:RecoveryKitFooter", { productName }),
      },
    });
  }, [words, wordCount, accountLabel, i18n, t]);

  const handlePrintKit = useCallback(() => {
    printRecoveryKit(buildKitHtml());
    setHasSaved(true);
  }, [buildKitHtml]);

  const handleDownloadKit = useCallback(() => {
    const productName = getBrandName("ProductName");
    const filename = `${productName.replace(/\s+/g, "-")}-recovery-kit.html`;
    downloadRecoveryKitHtml(buildKitHtml(), filename);
    setHasSaved(true);
  }, [buildKitHtml]);

  const handleCancel = useCallback(() => {
    setAcknowledged(false);
    onCancel();
  }, [onCancel]);

  return (
    <ModalDialog
      zIndex={410}
      visible={visible}
      onClose={handleCancel}
      displayType={ModalDialogType.modal}
      isLoading={!ready}
      autoMaxHeight
    >
      <ModalDialog.Header>
        {t("Common:RecoveryPhraseTitle")}
      </ModalDialog.Header>

      <ModalDialog.Body>
        <div className={styles.container}>
          <Text className={styles.description}>
            {t("Common:RecoveryPhraseHint")}
          </Text>

          <div className={styles.warningBox}>
            <Text fontSize="13px" fontWeight={600}>
              {t("Common:RecoveryPhraseWarning")}
            </Text>
          </div>

          <div className={styles.phraseBox}>{words.join(" ")}</div>

          <div className={styles.saveActions}>
            <Button
              scale
              primary
              className={styles.printButton}
              size={ButtonSize.small}
              onClick={handlePrintKit}
              label={t("Common:RecoveryKitPrint")}
              isDisabled={isLoading}
            />
            <Button
              scale
              size={ButtonSize.small}
              onClick={handleDownloadKit}
              label={t("Common:Download")}
              isDisabled={isLoading}
            />
            <Button
              scale
              size={ButtonSize.small}
              onClick={handleCopy}
              label={t("Common:CopyToClipboard")}
              isDisabled={isLoading}
            />
          </div>

          <div className={styles.checkboxRow}>
            <Checkbox
              id="recoveryPhraseAcknowledged"
              isChecked={acknowledged}
              isDisabled={isLoading || !hasSaved}
              onChange={(e) => setAcknowledged(e.target.checked)}
              label={t("Common:RecoveryPhraseAcknowledge")}
              tabIndex={1}
            />
          </div>
          {!hasSaved ? (
            <Text className={styles.saveFirstHint} fontSize="12px">
              {t("Common:RecoveryPhraseSaveFirst")}
            </Text>
          ) : null}
        </div>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Button
          scale
          primary
          key="ContinueButton"
          onClick={onConfirm}
          size={ButtonSize.normal}
          label={t("Common:ContinueButton")}
          isDisabled={!acknowledged || isLoading}
          isLoading={isLoading}
          tabIndex={2}
        />
        <Button
          scale
          key="CancelButton"
          onClick={handleCancel}
          size={ButtonSize.normal}
          label={t("Common:CancelButton")}
          isDisabled={isLoading}
          tabIndex={3}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default RecoveryPhraseDisplayModal;
