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
import {
  InputSize,
  InputType,
  TextInput,
} from "@docspace/ui-kit/components/text-input";
import { toastr } from "@docspace/ui-kit/components/toast";
import {
  pickQuizPositions,
  splitMnemonicForDisplay,
  verifyQuizAnswers,
} from "@docspace/shared/services/encryption/recovery";

import styles from "./RecoveryPhraseDisplayModal.module.scss";

type RecoveryPhraseDisplayModalProps = {
  visible: boolean;
  mnemonic: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
};

type Step = "display" | "quiz";

export const RecoveryPhraseDisplayModal: React.FC<
  RecoveryPhraseDisplayModalProps
> = ({ visible, mnemonic, onConfirm, onCancel, isLoading = false }) => {
  const { t, ready } = useTranslation(["Common"]);
  const [acknowledged, setAcknowledged] = useState(false);
  const [step, setStep] = useState<Step>("display");
  const [quizPositions, setQuizPositions] = useState<number[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [quizError, setQuizError] = useState<string>("");

  const groups = useMemo(() => splitMnemonicForDisplay(mnemonic, 4), [mnemonic]);
  const wordCount = useMemo(
    () => mnemonic.trim().split(/\s+/).length,
    [mnemonic],
  );

  useEffect(() => {
    if (visible) {
      setAcknowledged(false);
      setStep("display");
      setQuizPositions([]);
      setAnswers([]);
      setQuizError("");
    }
  }, [visible]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(mnemonic);
      toastr.success(t("Common:Copied"));
    } catch {
      toastr.error(t("Common:CopyFailed"));
    }
  }, [mnemonic, t]);

  const handleCancel = useCallback(() => {
    setAcknowledged(false);
    setStep("display");
    onCancel();
  }, [onCancel]);

  const startQuiz = useCallback(() => {
    const positions = pickQuizPositions(wordCount);
    setQuizPositions(positions);
    setAnswers(new Array(positions.length).fill(""));
    setQuizError("");
    setStep("quiz");
  }, [wordCount]);

  const submitQuiz = useCallback(() => {
    if (verifyQuizAnswers(mnemonic, quizPositions, answers)) {
      setQuizError("");
      onConfirm();
    } else {
      setQuizError(t("Common:RecoveryQuizMismatch"));
    }
  }, [mnemonic, quizPositions, answers, onConfirm, t]);

  const goBackToDisplay = useCallback(() => {
    setStep("display");
    setQuizError("");
  }, []);

  const updateAnswer = useCallback((idx: number, value: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
    setQuizError("");
  }, []);

  const allAnswersFilled = answers.every((a) => a.trim().length > 0);

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
        {step === "display"
          ? t("Common:RecoveryPhraseTitle")
          : t("Common:RecoveryQuizTitle")}
      </ModalDialog.Header>

      <ModalDialog.Body>
        {step === "display" ? (
          <div className={styles.container}>
            <Text className={styles.description}>
              {t("Common:RecoveryPhraseHint")}
            </Text>

            <div className={styles.warningBox}>
              <Text fontSize="13px" fontWeight={600}>
                {t("Common:RecoveryPhraseWarning")}
              </Text>
            </div>

            <div className={styles.wordsGrid}>
              {groups.map((group, rowIdx) => (
                <div key={`row-${rowIdx}`} className={styles.wordsRow}>
                  {group.map((word, colIdx) => {
                    const number = rowIdx * 4 + colIdx + 1;
                    return (
                      <div key={`word-${number}`} className={styles.wordCell}>
                        <span className={styles.wordIndex}>{number}.</span>
                        <span className={styles.wordText}>{word}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <Button
              scale
              size={ButtonSize.small}
              onClick={handleCopy}
              label={t("Common:CopyToClipboard")}
              isDisabled={isLoading}
            />

            <div className={styles.checkboxRow}>
              <Checkbox
                id="recoveryPhraseAcknowledged"
                isChecked={acknowledged}
                isDisabled={isLoading}
                onChange={(e) => setAcknowledged(e.target.checked)}
                label={t("Common:RecoveryPhraseAcknowledge")}
                tabIndex={1}
              />
            </div>
          </div>
        ) : (
          <div className={styles.container}>
            <Text className={styles.description}>
              {t("Common:RecoveryQuizHint")}
            </Text>

            <div className={styles.quizContainer}>
              {quizPositions.map((pos, idx) => (
                <div key={`q-${pos}`} className={styles.quizQuestion}>
                  <label
                    htmlFor={`quiz-input-${idx}`}
                    className={styles.quizLabel}
                  >
                    {t("Common:RecoveryQuizWordLabel", { number: pos + 1 })}
                  </label>
                  <TextInput
                    id={`quiz-input-${idx}`}
                    name={`quiz-input-${idx}`}
                    type={InputType.text}
                    size={InputSize.base}
                    scale
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    value={answers[idx] ?? ""}
                    isDisabled={isLoading}
                    hasError={!!quizError}
                    onChange={(e) => updateAnswer(idx, e.target.value)}
                    tabIndex={idx + 1}
                  />
                </div>
              ))}

              {quizError ? (
                <Text className={styles.quizError}>{quizError}</Text>
              ) : null}

              <button
                type="button"
                className={styles.quizBackLink}
                onClick={goBackToDisplay}
                disabled={isLoading}
              >
                {t("Common:RecoveryQuizShowPhraseAgain")}
              </button>
            </div>
          </div>
        )}
      </ModalDialog.Body>

      <ModalDialog.Footer>
        {step === "display" ? (
          <>
            <Button
              scale
              primary
              key="StartQuizButton"
              onClick={startQuiz}
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
          </>
        ) : (
          <>
            <Button
              scale
              primary
              key="VerifyButton"
              onClick={submitQuiz}
              size={ButtonSize.normal}
              label={t("Common:RecoveryQuizVerify")}
              isDisabled={!allAnswersFilled || isLoading}
              isLoading={isLoading}
              tabIndex={quizPositions.length + 1}
            />
            <Button
              scale
              key="CancelButton"
              onClick={handleCancel}
              size={ButtonSize.normal}
              label={t("Common:CancelButton")}
              isDisabled={isLoading}
              tabIndex={quizPositions.length + 2}
            />
          </>
        )}
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default RecoveryPhraseDisplayModal;
