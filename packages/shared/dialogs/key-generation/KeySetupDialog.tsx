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

import React, { useCallback, useEffect, useId, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  ModalDialog,
  ModalDialogType,
} from "@onlyoffice/apps-ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@onlyoffice/apps-ui-kit/components/button";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";

import { isPassphraseAcceptable } from "@docspace/shared/services/encryption/passphrase-strength";

import { KEY_DIALOG_DISPLAY_TYPE } from "../key-dialog-display";
import { useKeyDialogCloseGuard } from "../key-dialog-close-guard";
import { submitOnEnter } from "../key-dialog-keys";
import { KeyDialogAnnouncement } from "../key-dialog-announcement";
import KeyIcon from "PUBLIC_DIR/images/icons/16/catalog.devtools-api-keys.react.svg";
import PadlockIcon from "PUBLIC_DIR/images/icons/16/padlock.react.svg";
import RestoreIcon from "PUBLIC_DIR/images/restore.auth.react.svg";

import UnsavedChangesDialog from "../unsaved-changes-dialog";
import { PassphraseCreationFields } from "../passphrase-modal/PassphraseCreationFields";

import { RecoveryPhraseContent } from "./RecoveryPhraseContent";
import styles from "./KeySetupDialog.module.scss";

export type KeySetupStep = "explanation" | "passphrase" | "recovery";

const STEPS: KeySetupStep[] = ["explanation", "passphrase", "recovery"];

type KeySetupDialogProps = {
  step: KeySetupStep;
  /** The recovery phrase, once the passphrase step has been confirmed. */
  mnemonic: string | null;
  accountLabel?: string;
  isLoading: boolean;
  onContinue: () => void;
  onPassphraseSubmit: (passphrase: string) => void;
  onRecoveryConfirm: () => void;
  onBack: () => void;
  onCancel: () => void;
};

// Spec: private-rooms/key-management, "Key setup is one dialog of three steps"
export const KeySetupDialog = ({
  step,
  mnemonic,
  accountLabel,
  isLoading,
  onContinue,
  onPassphraseSubmit,
  onRecoveryConfirm,
  onBack,
  onCancel,
}: KeySetupDialogProps) => {
  const { t, ready } = useTranslation(["Common"]);
  const titleId = useId();

  const [passphrase, setPassphrase] = useState("");
  const [confirmPassphrase, setConfirmPassphrase] = useState("");
  const [rulesPassed, setRulesPassed] = useState(false);
  const [error, setError] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);

  // Spec: private-rooms/key-management, "Key setup steps can be walked back"
  useEffect(() => {
    if (step === "recovery") setAcknowledged(false);
  }, [step]);

  const isPassphraseValid =
    rulesPassed &&
    isPassphraseAcceptable(passphrase) &&
    passphrase === confirmPassphrase;

  const submitPassphrase = useCallback(() => {
    if (!isPassphraseAcceptable(passphrase)) {
      setError(t("Common:PassphraseWeak"));
      return;
    }
    onPassphraseSubmit(passphrase);
  }, [passphrase, onPassphraseSubmit, t]);

  const dirty =
    step === "passphrase"
      ? passphrase !== "" || confirmPassphrase !== ""
      : step === "recovery"
        ? !acknowledged
        : false;

  const { requestClose, confirming, confirmation } = useKeyDialogCloseGuard({
    visible: true,
    dirty,
    onCancel,
  });

  const handleKeyDown = useMemo(
    () =>
      submitOnEnter(
        submitPassphrase,
        isPassphraseValid && !isLoading && !confirming,
      ),
    [submitPassphrase, isPassphraseValid, isLoading, confirming],
  );

  const title = {
    explanation: t("Common:GenerateNewKey"),
    passphrase: t("Common:CreatePassphrase"),
    recovery: t("Common:RecoveryPhraseTitle"),
  }[step];

  const confirmMismatch =
    !!confirmPassphrase && passphrase !== confirmPassphrase;
  const announcedError =
    step === "passphrase"
      ? error || (confirmMismatch ? t("Common:PassphraseMismatch") : "")
      : "";

  const primary = {
    explanation: {
      onClick: onContinue,
      isDisabled: isLoading,
    },
    passphrase: {
      onClick: submitPassphrase,
      isDisabled: !isPassphraseValid || isLoading,
    },
    recovery: {
      onClick: onRecoveryConfirm,
      isDisabled: !acknowledged || isLoading,
    },
  }[step];

  return (
    <>
      <ModalDialog
        zIndex={410}
        visible
        onClose={requestClose}
        displayType={ModalDialogType.modal}
        displayTypeDetailed={KEY_DIALOG_DISPLAY_TYPE}
        closeOnBackdropClick={false}
        aria-labelledby={titleId}
        isLoading={!ready}
        autoMaxHeight
        isLarge
      >
        <ModalDialog.Header>
          <span id={titleId}>{title}</span>
        </ModalDialog.Header>

        <ModalDialog.Body>
          <div className={styles.container} data-testid="key_setup_dialog">
            <Text
              fontSize="12px"
              className={styles.stepLabel}
              dataTestId="key_setup_step"
            >
              {t("Common:KeySetupStep", {
                step: STEPS.indexOf(step) + 1,
                total: STEPS.length,
              })}
            </Text>

            {step === "explanation" ? (
              // Spec: private-rooms/key-management, "Key setup opens with an explanation"
              <div
                className={styles.explanation}
                data-testid="key_setup_explanation"
              >
                <dl className={styles.terms}>
                  {(
                    [
                      [
                        KeyIcon,
                        t("Common:KeySetupKeyTitle"),
                        t("Common:KeySetupKeyDescription"),
                      ],
                      [
                        PadlockIcon,
                        t("Common:KeySetupPassphraseTitle"),
                        t("Common:KeySetupPassphraseDescription"),
                      ],
                      [
                        RestoreIcon,
                        t("Common:KeySetupRecoveryTitle"),
                        t("Common:KeySetupRecoveryDescription"),
                      ],
                    ] as const
                  ).map(([Icon, term, description]) => (
                    // Spec: private-rooms/key-management, "Key setup terms carry icons"
                    <div key={term} className={styles.term}>
                      <span className={styles.termIcon} aria-hidden="true">
                        <Icon data-testid="key_setup_term_icon" />
                      </span>
                      <div className={styles.termText}>
                        <dt>
                          <Text as="span" fontSize="13px" fontWeight={600}>
                            {term}
                          </Text>
                        </dt>
                        <dd>
                          <Text as="span" fontSize="13px">
                            {description}
                          </Text>
                        </dd>
                      </div>
                    </div>
                  ))}
                </dl>
                <Text fontSize="13px" className={styles.notStored}>
                  {t("Common:KeySetupNotStored")}
                </Text>
              </div>
            ) : null}

            {step === "passphrase" ? (
              <Text className={styles.description}>
                {t("Common:CreatePassphraseHint")}
              </Text>
            ) : null}

            {step === "passphrase" ? (
              <PassphraseCreationFields
                passphrase={passphrase}
                confirmPassphrase={confirmPassphrase}
                onPassphraseChange={(value, generated) => {
                  setPassphrase(value);
                  if (generated) setConfirmPassphrase(value);
                  setError("");
                }}
                onConfirmPassphraseChange={(value) => {
                  setConfirmPassphrase(value);
                  setError("");
                }}
                onRulesPassedChange={setRulesPassed}
                error={error}
                rulesPassed={rulesPassed}
                isLoading={isLoading}
                onKeyDown={handleKeyDown}
              />
            ) : null}

            {step === "recovery" && mnemonic ? (
              <RecoveryPhraseContent
                mnemonic={mnemonic}
                acknowledged={acknowledged}
                onAcknowledgedChange={setAcknowledged}
                isLoading={isLoading}
                accountLabel={accountLabel}
              />
            ) : null}
          </div>
          <KeyDialogAnnouncement text={announcedError} />
        </ModalDialog.Body>

        <ModalDialog.Footer>
          <Button
            scale
            primary
            key="ContinueButton"
            onClick={primary.onClick}
            size={ButtonSize.normal}
            label={t("Common:ContinueButton")}
            isDisabled={primary.isDisabled}
            isLoading={isLoading}
          />
          {step === "explanation" ? (
            <Button
              scale
              key="CancelButton"
              onClick={onCancel}
              size={ButtonSize.normal}
              label={t("Common:CancelButton")}
              isDisabled={isLoading}
            />
          ) : (
            <Button
              scale
              key="BackButton"
              onClick={onBack}
              size={ButtonSize.normal}
              label={t("Common:Back")}
              isDisabled={isLoading}
            />
          )}
        </ModalDialog.Footer>
      </ModalDialog>
      <UnsavedChangesDialog
        {...confirmation}
        // Spec: private-rooms/key-management, "Discarding key setup names what is lost"
        description={
          step === "recovery" ? t("Common:KeySetupDiscardRecovery") : undefined
        }
      />
    </>
  );
};

export default KeySetupDialog;
