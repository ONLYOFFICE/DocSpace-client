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

import { getRestoreProgress } from "../../api/portal";

const baseSecondMultiplicationFactor = 400;
const baseThirdMultiplicationFactor = 180;
const baseFirstMultiplicationFactor = 700;
const unSizeMultiplicationFactor = 3;
const thirdBound = 98;

let prevProgress: number = 0;
let requestsCount: number = 0;

export const clearLocalStorage = () => {
  [
    "LocalCopyStorageType",
    "LocalCopyFolder",
    "LocalCopyStorage",
    "LocalCopyThirdPartyStorageType",
    "LocalCopyThirdPartyStorageValues",
  ].forEach((k) => localStorage.removeItem(k));
};
export const reachingSecondBoundary = (
  percentage: number,
  secondBound: number,
  progressTimerId: ReturnType<typeof setInterval> | null,
  setPercent: (progress: number) => void,
) => {
  let progress = percentage;

  const delay = baseSecondMultiplicationFactor * unSizeMultiplicationFactor;

  if (progressTimerId) return;

  progressTimerId = setInterval(() => {
    progress += 1;

    if (progress !== secondBound) setPercent(progress);
    else {
      if (progressTimerId) clearInterval(progressTimerId);
      progressTimerId = null;
    }
  }, delay);
};
export const reachingThirdBoundary = (
  percentage: number,
  progressTimerId: ReturnType<typeof setInterval> | null,
  setPercent: (progress: number) => void,
) => {
  let progress = percentage;
  const delay = baseThirdMultiplicationFactor * unSizeMultiplicationFactor;
  if (progressTimerId) return;

  progressTimerId = setInterval(() => {
    progress += 1;

    if (progress < thirdBound) setPercent(progress);
    else {
      if (progressTimerId) clearInterval(progressTimerId);
      progressTimerId = null;
    }
  }, delay);
};

export const reachingFirstBoundary = (
  percentage: number,
  firstBound: number,
  progressTimerId: ReturnType<typeof setInterval> | null,
  setPercent: (progress: number) => void,
) => {
  let progress = percentage;
  const delay = baseFirstMultiplicationFactor * unSizeMultiplicationFactor;

  if (progressTimerId) return;

  progressTimerId = setInterval(() => {
    progress += 1;

    if (progress !== firstBound) setPercent(progress);
    else {
      if (progressTimerId) clearInterval(progressTimerId);
      progressTimerId = null;
    }
  }, delay);
};

export const returnToPortal = () => {
  setTimeout(() => {
    window.location.replace("/");
  }, 5000);
};

export const getIntervalProgress = async (
  setErrorMessage: (err: any) => void,
  clearAllIntervals: VoidFunction,
  timerId: ReturnType<typeof setInterval> | null,
  progressTimerId: ReturnType<typeof setInterval> | null,
  setPercent: (progress: number) => void,
  errorInternalServer: string,
) => {
  try {
    const response = await getRestoreProgress();

    if (!response) {
      setErrorMessage(errorInternalServer);
      clearAllIntervals();
      return;
    }

    if (response.error) {
      if (timerId) clearInterval(timerId);
      if (progressTimerId) clearInterval(progressTimerId);

      progressTimerId = null;
      timerId = null;
      setErrorMessage(response.error);

      return;
    }

    const currProgress = response.progress;
    console.log("prevProgress", prevProgress);
    if (currProgress > 0 && prevProgress !== currProgress) {
      setPercent(currProgress);

      if (progressTimerId) clearInterval(progressTimerId);
      progressTimerId = null;
    }

    prevProgress = currProgress;

    if (currProgress === 100) {
      clearAllIntervals();
      clearLocalStorage();
      returnToPortal();
    }
  } catch (error: any) {
    clearAllIntervals();
    setErrorMessage(error);
  }
};

export const getRecoveryProgress = async (
  setErrorMessage: (err: any) => void,
  errorInternalServer: string,
  timerId: ReturnType<typeof setInterval> | null,
  progressTimerId: ReturnType<typeof setInterval> | null,
  firstBound: number,
  setPercent: (progress: number) => void,
  clearAllIntervals: VoidFunction,
) => {
  const getMessage = (error: any) => {
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
      setErrorMessage(errorInternalServer);
      return;
    }

    const { progress, error } = response;

    if (error) {
      setErrorMessage(error);

      return;
    }

    if (progress === 100) {
      returnToPortal();
      clearLocalStorage();
    } else {
      timerId = setInterval(
        () =>
          getIntervalProgress(
            setErrorMessage,
            clearAllIntervals,
            timerId,
            progressTimerId,
            setPercent,
            errorInternalServer,
          ),
        1000,
      );
      if (progress < firstBound)
        reachingFirstBoundary(
          progress,
          firstBound,
          progressTimerId,
          setPercent,
        );
    }

    setPercent(progress);
  } catch (err: unknown) {
    const knownError = err as { response: { status: number } };

    const status = knownError?.response?.status;
    const needCreationTableTime = status === 404;

    if (needCreationTableTime && requestsCount < 3) {
      requestsCount += 1;
      getRecoveryProgress(
        setErrorMessage,
        errorInternalServer,
        timerId,
        progressTimerId,
        firstBound,
        setPercent,
        clearAllIntervals,
      );
      return;
    }

    setErrorMessage(getMessage(err));
  }
};
