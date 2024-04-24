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
import React, { useEffect, useState } from "react";
import { withTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";

import ErrorContainer from "@docspace/shared/components/error-container/ErrorContainer";

import { StyledPreparationPortal } from "./StyledPreparationPortal";
import { Text } from "../../components/text";
import { getRestoreProgress } from "../../api/portal";
import { ColorTheme, ThemeId } from "../../components/color-theme";

const baseSize = 1073741824; //number of bytes in one GB
const unSizeMultiplicationFactor = 3;
const baseFirstMultiplicationFactor = 700;
const baseSecondMultiplicationFactor = 400;
const baseThirdMultiplicationFactor = 180;
const firstBound = 10,
  secondBound = 63,
  thirdBound = 98;

let timerId = null,
  progressTimerId = null,
  prevProgress;
let requestsCount = 0;

const PreparationPortal = (props) => {
  const {
    multiplicationFactor,
    t,
    withoutHeader,
    style,
    clearLocalStorage,
    isDialog,
  } = props;

  const [percent, setPercent] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const clearAllIntervals = () => {
    clearInterval(timerId);
    clearInterval(progressTimerId);

    progressTimerId = null;
    timerId = null;
  };

  const returnToPortal = () => {
    setTimeout(() => {
      window.location.replace("/");
    }, 5000);
  };

  const reachingFirstBoundary = (percent) => {
    let progress = percent;
    const delay = baseFirstMultiplicationFactor * multiplicationFactor;

    if (progressTimerId) return;

    progressTimerId = setInterval(() => {
      progress += 1;

      if (progress !== firstBound) setPercent(progress);
      else {
        clearInterval(progressTimerId);
        progressTimerId = null;
      }
    }, delay);
  };
  const reachingSecondBoundary = (percent) => {
    let progress = percent;

    const delay = baseSecondMultiplicationFactor * multiplicationFactor;

    if (progressTimerId) return;

    progressTimerId = setInterval(() => {
      progress += 1;

      if (progress !== secondBound) setPercent(progress);
      else {
        clearInterval(progressTimerId);
        progressTimerId = null;
      }
    }, delay);
  };

  const reachingThirdBoundary = (percent) => {
    let progress = percent;
    const delay = baseThirdMultiplicationFactor * multiplicationFactor;
    if (progressTimerId) return;

    progressTimerId = setInterval(() => {
      progress += 1;

      if (progress < thirdBound) setPercent(progress);
      else {
        clearInterval(progressTimerId);
        progressTimerId = null;
      }
    }, delay);
  };
  useEffect(() => {
    if (percent >= firstBound) {
      if (percent < secondBound) {
        reachingSecondBoundary(percent);
        return;
      } else reachingThirdBoundary(percent);
    }
  }, [percent]);

  const getIntervalProgress = async () => {
    try {
      const response = await getRestoreProgress();

      if (!response) {
        setErrorMessage(t("Common:ErrorInternalServer"));
        clearAllIntervals();
        return;
      }

      if (response.error) {
        clearInterval(timerId);
        clearInterval(progressTimerId);

        progressTimerId = null;
        timerId = null;
        setErrorMessage(response.error);

        return;
      }

      const currProgress = response.progress;

      if (currProgress > 0 && prevProgress !== currProgress) {
        setPercent(currProgress);

        clearInterval(progressTimerId);
        progressTimerId = null;
      }

      prevProgress = currProgress;

      if (currProgress === 100) {
        clearAllIntervals();
        clearLocalStorage();
        returnToPortal();
      }
    } catch (error) {
      clearAllIntervals();
      setErrorMessage(error);
    }
  };

  const getRecoveryProgress = async () => {
    const errorMessage = (error) => {
      if (typeof error !== "object") return error;

      return (
        error?.response?.data?.error?.message ||
        error?.statusText ||
        error?.message ||
        t("Common:ErrorInternalServer")
      );
    };

    try {
      const response = await getRestoreProgress();

      if (!response) {
        setErrorMessage(t("Common:ErrorInternalServer"));
        return;
      }
      const { error, progress } = response;

      if (error) {
        setErrorMessage(response.error);

        return;
      }

      if (progress === 100) {
        returnToPortal();
        clearLocalStorage();
      } else {
        timerId = setInterval(() => getIntervalProgress(), 1000);
        if (progress < firstBound) reachingFirstBoundary(progress);
      }

      setPercent(progress);
    } catch (err) {
      const status = err?.response?.status;
      const needCreationTableTime = status === 404;

      if (needCreationTableTime && requestsCount < 3) {
        requestsCount++;
        getRecoveryProgress();
        return;
      }

      setErrorMessage(errorMessage(err));
    }
  };
  useEffect(() => {
    setTimeout(() => {
      getRecoveryProgress();
    }, 6000);

    return () => {
      clearAllIntervals();
    };
  }, []);

  const headerText = errorMessage
    ? t("Common:Error")
    : t("Common:PreparationPortalTitle");

  return (
    <StyledPreparationPortal errorMessage={errorMessage} isDialog={isDialog}>
      <ErrorContainer
        headerText={withoutHeader ? "" : headerText}
        style={style}
        className="restoring-portal"
      >
        <div className="preparation-portal_body-wrapper">
          {errorMessage ? (
            <Text className="preparation-portal_error">{`${errorMessage}`}</Text>
          ) : (
            <ColorTheme
              themeId={ThemeId.Progress}
              percent={percent}
              errorMessage={errorMessage}
              className="preparation-portal_body-wrapper"
            >
              <div className="preparation-portal_progress">
                <div className="preparation-portal_progress-bar">
                  <div className="preparation-portal_progress-line"></div>
                </div>
                <Text className="preparation-portal_percent">{`${percent} %`}</Text>
              </div>
              <Text className="preparation-portal_text">
                {t("PreparationPortalDescription")}
              </Text>
            </ColorTheme>
          )}
        </div>
      </ErrorContainer>
    </StyledPreparationPortal>
  );
};

const PreparationPortalWrapper = inject(({ backup }) => {
  const { backupSize, clearLocalStorage } = backup;

  const multiplicationFactor = backupSize
    ? backupSize / baseSize
    : unSizeMultiplicationFactor;

  return {
    clearLocalStorage,
    multiplicationFactor,
  };
})(
  withTranslation(["PreparationPortal", "Common"])(observer(PreparationPortal)),
);

PreparationPortal.propTypes = {
  withoutHeader: PropTypes.bool,
  isDialog: PropTypes.bool,
};

PreparationPortal.defaultProps = {
  withoutHeader: false,
  isDialog: false,
};

export default (props) => <PreparationPortalWrapper {...props} />;
