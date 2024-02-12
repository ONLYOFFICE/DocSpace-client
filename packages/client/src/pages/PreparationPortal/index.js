import React, { useEffect, useState } from "react";
import ErrorContainer from "@docspace/common/components/ErrorContainer";
import { withTranslation } from "react-i18next";

import { StyledPreparationPortal } from "./StyledPreparationPortal";
import { Text } from "@docspace/shared/components/text";
import { getRestoreProgress } from "@docspace/shared/api/portal";
import { observer, inject } from "mobx-react";
import PropTypes from "prop-types";
import { ColorTheme, ThemeId } from "@docspace/shared/components/color-theme";

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
      const status = err?.response?.status;
      const needCreationTableTime = status === 404;

      if (needCreationTableTime) {
        return;
      }

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
      setErrorMessage(errorMessage(err));
    }
  };
  useEffect(() => {
    setTimeout(() => {
      getRecoveryProgress();
    }, 4000);

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
