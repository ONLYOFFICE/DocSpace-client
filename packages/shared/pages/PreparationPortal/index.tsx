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
import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import ErrorContainer from "@docspace/ui-kit/components/error-container/ErrorContainer";
import { Text } from "@docspace/ui-kit/components/text";
import SocketHelper, { SocketEvents } from "@docspace/ui-kit/utils/socket";
import { getRestoreProgress } from "../../api/portal";
import PreparationPortalLoader from "../../skeletons/preparation-portal";
import { PreparationPortalProgress } from "@docspace/ui-kit/components/progress-bar";

import { clearLocalStorage, returnToPortal } from "./PreparationPortal.utils";
import { IPreparationPortal } from "./PreparationPortal.types";
import styles from "./PreparationPortal.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

let requestsCount = 0;

export const PreparationPortal = (props: IPreparationPortal) => {
  const { withoutHeader, isDialog, style } = props;

  const { t, ready } = useTranslation(["Common"]);

  const errorInternalServer = t("Common:ErrorInternalServer");

  const [percent, setPercent] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const getRecoveryProgress = useCallback(async () => {
    const setMessage = (error?: unknown) => {
      let errorText = errorInternalServer;

      if (typeof error === "string") {
        errorText = error;
      } else if (error && typeof error === "object" && "message" in error) {
        errorText =
          (error as { message?: string }).message ?? errorInternalServer;
      }

      setErrorMessage(errorText);
    };

    try {
      const response = await getRestoreProgress();

      if (!response) {
        setMessage();
        return;
      }

      const { progress, error } = response;

      if (error) {
        setMessage(error);
        return;
      }

      setPercent(progress);

      if (progress === 100) {
        returnToPortal();
        clearLocalStorage();
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

        getRecoveryProgress();

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
      SocketEvents.RestoreProgress,
      (opt: { progress: number; isCompleted: boolean; error?: string }) => {
        const { progress, isCompleted, error } = opt;

        setPercent(progress);

        if (isCompleted) {
          if (error) {
            setErrorMessage(error);

            return;
          }

          returnToPortal();
          clearLocalStorage();
        }
      },
    );
  }, [getRecoveryProgress]);

  useEffect(() => {
    if (!ready) return;

    if (!isDialog) getRecoveryProgress();
  }, [ready, getRecoveryProgress, isDialog]);

  const headerText = errorMessage
    ? t("Common:Error")
    : t("Common:PreparationPortalTitle");

  const componentBody = errorMessage ? (
    <Text className={styles.preparationPortalError}>{`${errorMessage}`}</Text>
  ) : (
    <PreparationPortalProgress
      text={t("Common:PreparationPortalDescription", {
        productName: getBrandName("ProductName"),
      })}
      percent={percent}
    />
  );
  return (
    <div
      className={classNames(styles.preparationPortal, {
        [styles.isDialog]: isDialog,
        [styles.errorMessage]: !!errorMessage,
      })}
    >
      <ErrorContainer
        {...(ready && { headerText: withoutHeader ? "" : headerText })}
        style={style}
        className={styles.restoringPortal}
        hideLogo
      >
        <div className={styles.preparationPortalBodyWrapper}>
          {!ready ? <PreparationPortalLoader /> : componentBody}
        </div>
      </ErrorContainer>
    </div>
  );
};
