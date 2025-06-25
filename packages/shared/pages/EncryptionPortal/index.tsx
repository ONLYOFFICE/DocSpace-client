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

import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

import ErrorContainer from "../../components/error-container/ErrorContainer";
import { Text } from "../../components/text";
import { PreparationPortalProgress } from "../../components/preparation-portal-progress";
import PreparationPortalLoader from "../../skeletons/preparation-portal";

import SocketHelper, { SocketEvents } from "../../utils/socket";
import { getEncryptionProgress } from "../../api/settings";

import { returnToPortal } from "./EncryptionPortal.utils";
import { StyledEncryptionPortal } from "./EncryptionPortal.styled";

let requestsCount = 0;

export const EncryptionPortal = () => {
  const { t, ready } = useTranslation("Common");

  const errorInternalServer = t("Common:ErrorInternalServer");

  const [percent, setPercent] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

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

  const headerText = errorMessage ? t("Error") : t("EncryptionPortalTitle");

  const componentBody = errorMessage ? (
    <Text className="encryption-portal_error">{`${errorMessage}`}</Text>
  ) : (
    <PreparationPortalProgress
      text={t("EncryptionPortalSubtitle")}
      percent={percent}
    />
  );

  return (
    <StyledEncryptionPortal errorMessage={!!errorMessage}>
      <ErrorContainer
        headerText={headerText}
        className="encryption-portal"
        hideLogo
      >
        <div className="encryption-portal_body-wrapper">
          {!ready ? <PreparationPortalLoader /> : componentBody}
        </div>
      </ErrorContainer>
    </StyledEncryptionPortal>
  );
};
