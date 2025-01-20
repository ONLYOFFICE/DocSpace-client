// (c) Copyright Ascensio System SIA 2009-2024
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
import { useTheme } from "styled-components";

import ErrorContainer from "../../components/error-container/ErrorContainer";

import { StyledPreparationPortal } from "./PreparationPortal.styled";
import { Text } from "../../components/text";
import SocketHelper, { SocketEvents } from "../../utils/socket";
import { ColorTheme, ThemeId } from "../../components/color-theme";
import { IPreparationPortal } from "./PreparationPortal.types";
import { getRestoreProgress } from "../../api/portal";
import { clearLocalStorage, returnToPortal } from "./PreparationPortal.utils";
import PreparationPortalLoader from "../../skeletons/preparation-portal";

let requestsCount = 0;

export const PreparationPortal = (props: IPreparationPortal) => {
  const { withoutHeader, isDialog, style } = props;

  const theme = useTheme();

  const { t, ready } = useTranslation(["PreparationPortal", "Common"]);

  const errorInternalServer = t("Common:ErrorInternalServer");

  const [percent, setPercent] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const getRecoveryProgress = useCallback(async () => {
    const setMessage = (error?: unknown) => {
      const errorText = error ?? errorInternalServer;

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
    SocketHelper.on(SocketEvents.RestoreProgress, (opt) => {
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
    });
  }, [getRecoveryProgress]);

  useEffect(() => {
    if (!ready) return;

    getRecoveryProgress();
  }, [ready, getRecoveryProgress]);

  const headerText = errorMessage
    ? t("Common:Error")
    : t("Common:PreparationPortalTitle");

  const componentBody = errorMessage ? (
    <Text className="preparation-portal_error">{`${errorMessage}`}</Text>
  ) : (
    <ColorTheme theme={theme} themeId={ThemeId.Progress} percent={percent}>
      <div className="preparation-portal_progress">
        <div className="preparation-portal_progress-bar">
          <div className="preparation-portal_progress-line" />
        </div>
        <Text className="preparation-portal_percent">{`${percent} %`}</Text>
      </div>
      <Text className="preparation-portal_text">
        {t("PreparationPortalDescription", {
          productName: t("Common:ProductName"),
        })}
      </Text>
    </ColorTheme>
  );
  return (
    <StyledPreparationPortal errorMessage={!!errorMessage} isDialog={isDialog}>
      <ErrorContainer
        {...(ready && { headerText: withoutHeader ? "" : headerText })}
        style={style}
        className="restoring-portal"
      >
        <div className="preparation-portal_body-wrapper">
          {!ready ? <PreparationPortalLoader /> : componentBody}
        </div>
      </ErrorContainer>
    </StyledPreparationPortal>
  );
};
