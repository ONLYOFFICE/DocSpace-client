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


import React, { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  PasswordInput,
  type PasswordInputHandle,
} from "@onlyoffice/apps-ui-kit/components/password-input";
import { InputSize } from "@onlyoffice/apps-ui-kit/components/text-input";
import { FieldContainer } from "@onlyoffice/apps-ui-kit/components/field-container";
import { Link, LinkType } from "@onlyoffice/apps-ui-kit/components/link";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";

import {
  PASSPHRASE_MIN_LENGTH,
  PASSPHRASE_SETTINGS,
  containsCommonPattern,
} from "@docspace/shared/services/encryption/passphrase-strength";

import { activateAsButton } from "../key-dialog-keys";
import { PassphraseStrengthLine } from "./PassphraseStrengthLine";
import styles from "./PassphraseModal.module.scss";

// Spec: private-rooms/key-management, "The passphrase rules tooltip leaves the dialog readable"
export const RULES_TOOLTIP_PLACE = "right";

type PassphraseCreationFieldsProps = {
  passphrase: string;
  confirmPassphrase: string;
  onPassphraseChange: (value: string, generated: boolean) => void;
  onConfirmPassphraseChange: (value: string) => void;
  onRulesPassedChange: (rulesPassed: boolean) => void;
  /** The error shown under the passphrase field, if any. */
  error: string;
  rulesPassed: boolean;
  isLoading: boolean;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

/**
 * The fields of a new passphrase: the generate action, the passphrase with
 * its rules, strength and common-pattern warning, and its confirmation. The
 * values live with the caller, so a dialog can keep them across its steps.
 */
export const PassphraseCreationFields = ({
  passphrase,
  confirmPassphrase,
  onPassphraseChange,
  onConfirmPassphraseChange,
  onRulesPassedChange,
  error,
  rulesPassed,
  isLoading,
  onKeyDown,
}: PassphraseCreationFieldsProps) => {
  const { t } = useTranslation(["Common"]);
  const inputRef = useRef<PasswordInputHandle>(null);
  // The kit input shows its own copy of the value and reads the prop only
  // when it mounts, so a value set from outside needs a fresh mount.
  const [confirmInputKey, setConfirmInputKey] = useState(0);

  // Spec: private-rooms/key-management, "A generated passphrase fills both fields"
  const generatingRef = useRef(false);
  const handleGeneratePassword = useCallback((e: React.MouseEvent) => {
    generatingRef.current = true;
    try {
      inputRef.current?.onGeneratePassword(e);
    } finally {
      generatingRef.current = false;
    }
  }, []);

  const passphraseHasError =
    !!error || (passphrase.length >= PASSPHRASE_MIN_LENGTH && !rulesPassed);
  const confirmMismatch =
    !!confirmPassphrase && passphrase !== confirmPassphrase;

  return (
    <>
      <div className={styles.passphraseField}>
        <div className={styles.generateRow}>
          <Link
            type={LinkType.action}
            role="button"
            tabIndex={0}
            fontWeight="600"
            fontSize="13px"
            isHovered
            onClick={handleGeneratePassword}
            onKeyDown={activateAsButton}
            dataTestId="generate_passphrase_link"
          >
            {t("Common:GenerateLogoButton")}
          </Link>
        </div>

        <FieldContainer
          isVertical
          labelVisible
          labelText={t("Common:Passphrase")}
          labelFor="passphrase"
          removeMargin
          hasError={passphraseHasError}
          errorMessage={error}
          errorMessageWidth="100%"
          className={styles.inputWrapper}
        >
          <PasswordInput
            ref={inputRef}
            id="passphrase"
            inputName="passphrase"
            inputValue={passphrase}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const generated = generatingRef.current;
              onPassphraseChange(e.target.value, generated);
              if (generated) setConfirmInputKey((key) => key + 1);
            }}
            placeholder={t("Common:Passphrase")}
            scale
            size={InputSize.base}
            isFullWidth
            passwordSettings={PASSPHRASE_SETTINGS}
            onValidateInput={(progressScore) =>
              onRulesPassedChange(progressScore)
            }
            tooltipPasswordTitle={`${t("Common:PassphraseLimitMessage")}:`}
            tooltipPasswordLength={`${t(
              "Common:PasswordMinimumLength",
            )}: ${PASSPHRASE_MIN_LENGTH}`}
            tooltipPasswordDigits={t("Common:PasswordLimitDigits")}
            tooltipPasswordCapital={t("Common:PasswordLimitUpperCase")}
            tooltipPasswordSpecial={t("Common:PasswordLimitSpecialSymbols")}
            tooltipPasswordPlace={RULES_TOOLTIP_PLACE}
            isDisabled={isLoading}
            hasError={passphraseHasError}
            isAutoFocussed
            autoComplete="new-password"
            onKeyDown={onKeyDown}
            tabIndex={0}
          />
        </FieldContainer>

        <PassphraseStrengthLine passphrase={passphrase} />
        {containsCommonPattern(passphrase) ? (
          <Text fontSize="12px" color="var(--status-error)">
            {t("Common:PassphraseCommonPattern")}
          </Text>
        ) : null}
      </div>

      <FieldContainer
        isVertical
        labelVisible
        labelText={t("Common:ConfirmPassphrase")}
        labelFor="confirmPassphrase"
        removeMargin
        hasError={confirmMismatch}
        errorMessage={confirmMismatch ? t("Common:PassphraseMismatch") : ""}
        errorMessageWidth="100%"
        className={styles.inputWrapper}
      >
        <PasswordInput
          key={confirmInputKey}
          id="confirmPassphrase"
          inputName="confirmPassphrase"
          inputValue={confirmPassphrase}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onConfirmPassphraseChange(e.target.value)
          }
          placeholder={t("Common:ConfirmPassphrase")}
          scale
          isFullWidth
          size={InputSize.base}
          simpleView
          isDisabled={isLoading}
          hasError={confirmMismatch}
          autoComplete="new-password"
          onKeyDown={onKeyDown}
          tabIndex={0}
        />
      </FieldContainer>
    </>
  );
};

export default PassphraseCreationFields;
