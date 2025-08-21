// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import classNames from "classnames";

import { Text } from "../../components/text";
import { PreparationPortalProgress } from "../../components/preparation-portal-progress";
import ErrorContainer from "../../components/error-container/ErrorContainer";
import PreparationPortalLoader from "../../skeletons/preparation-portal";

import { EncryptionStatus } from "../../enums";

import {
  getEncryptionProgress,
  getEncryptionSettings,
} from "../../api/settings";

import SocketHelper, { SocketEvents } from "../../utils/socket";
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
    SocketHelper?.on(SocketEvents.EncryptionProgress, (opt) => {
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
    });
  }, [getProgress]);

  useEffect(() => {
    if (!ready) return;
    getProgress();
  }, [ready, getProgress]);

  useEffect(() => {
    if (typeof statusEncryption === "number") return;
    const asyncFunction = async () => {
      const encryptionSettings = await getEncryptionSettings();
      setStatusEncryption(encryptionSettings.status);
    };
    asyncFunction();
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
