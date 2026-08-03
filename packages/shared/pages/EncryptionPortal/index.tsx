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

import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import classNames from "classnames";

import { Text } from "@docspace/ui-kit/components/text";
import { PreparationPortalProgress } from "@docspace/ui-kit/components/progress-bar";
import ErrorContainer from "@docspace/ui-kit/components/error-container/ErrorContainer";
import PreparationPortalLoader from "../../skeletons/preparation-portal";

import { EncryptionStatus } from "../../enums";

import {
  getEncryptionProgress,
  getEncryptionSettings,
} from "../../api/settings";

import SocketHelper, { SocketEvents } from "@docspace/ui-kit/utils/socket";
import { returnToPortal } from "./EncryptionPortal.utils";
import { EncryptionPortalProps } from "./EncryptionPortal.types";

import styles from "./EncryptionPortal.module.scss";

let requestsCount = 0;

export const EncryptionPortal: React.FC<EncryptionPortalProps> = () => {
  const { t, ready } = useTranslation("Common");

  const errorInternalServer = t("Common:ErrorInternalServer");

  const [percent, setPercent] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusEncryption, setStatusEncryption] =
    useState<EncryptionStatus | null>(null);

  const getProgress = useCallback(async () => {
    const setMessage = (error?: unknown) => {
      const errorText = (error as string) ?? errorInternalServer;

      setErrorMessage(errorText);
    };

    try {
      const percentage = (await getEncryptionProgress()) as number;
      const roundedPercentage = Math.round(percentage);

      if (!roundedPercentage) {
        setMessage();
        return;
      }

      setPercent(roundedPercentage);

      if (roundedPercentage === 100) {
        returnToPortal();
      }
    } catch (err: unknown) {
      const knownError = err as {
        response?: { status: number; data: { error: { message: string } } };
        statusText?: string;
        message?: string;
      };

      const status = knownError?.response?.status;
      const needCreationTableTime = status === 404;

      if (needCreationTableTime && requestsCount < 3) {
        requestsCount += 1;

        getProgress();

        return;
      }

      const message =
        typeof err !== "object"
          ? err
          : knownError?.response?.data?.error?.message ||
            knownError?.statusText ||
            knownError?.message;

      setMessage(message);
    }
  }, [errorInternalServer]);

  useEffect(() => {
    SocketHelper?.on(
      SocketEvents.EncryptionProgress,
      (opt: { percentage: number; error?: string }) => {
        const { percentage, error } = opt;
        const roundedPercentage = Math.round(percentage);

        setPercent(roundedPercentage);

        if (roundedPercentage >= 100) {
          if (error) {
            setErrorMessage(error);

            return;
          }

          returnToPortal();
        }
      },
    );
  }, [getProgress]);

  useEffect(() => {
    if (!ready) return;
    getProgress();
  }, [ready, getProgress]);

  useEffect(() => {
    if (typeof statusEncryption === "number") return;
    const getSettings = () => {
      const encryptionSettings = getEncryptionSettings();
      if (
        encryptionSettings.status === EncryptionStatus.Encrypted ||
        encryptionSettings.status === EncryptionStatus.EncryptionStarted
      ) {
        returnToPortal(true);
      }
      setStatusEncryption(encryptionSettings.status);
    };
    getSettings();
  }, [statusEncryption]);

  const headerText = errorMessage
    ? t("Error")
    : statusEncryption === EncryptionStatus.Decrypted ||
        statusEncryption === EncryptionStatus.DecryptionStarted
      ? t("DecryptionPortalTitle")
      : t("EncryptionPortalTitle");

  const componentBody = errorMessage ? (
    <Text
      className={styles.encryptionPortalError}
      data-testid="encryption-portal-error"
      data-error="true"
      aria-live="assertive"
    >
      {`${errorMessage}`}
    </Text>
  ) : (
    <PreparationPortalProgress
      text={t("EncryptionPortalSubtitle")}
      percent={percent}
      data-testid="encryption-progress-bar"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-label="Encryption Progress"
      data-percent={percent}
    />
  );

  const classes = classNames(styles.encryptionPortal, {
    [styles.error]: !!errorMessage,
  });

  return (
    <div className={classes} data-testid="encryption-portal" aria-busy={!ready}>
      <ErrorContainer
        headerText={headerText}
        className="encryption-portal"
        hideLogo
        data-testid="encryption-portal-container"
      >
        <div
          className={styles.encryptionPortalBodyWrapper}
          data-testid="encryption-portal-body"
          data-error={errorMessage ? "true" : undefined}
          data-progress={!errorMessage && ready ? "true" : undefined}
          data-socket-error={
            errorMessage && percent >= 100 ? "true" : undefined
          }
        >
          {!ready ? <PreparationPortalLoader /> : componentBody}
        </div>
      </ErrorContainer>
    </div>
  );
};
