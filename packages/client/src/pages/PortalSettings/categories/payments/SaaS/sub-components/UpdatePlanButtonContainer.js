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

import { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { Button } from "@docspace/shared/components/button";
import styled from "styled-components";
import { toastr } from "@docspace/shared/components/toast";
import api from "@docspace/shared/api";

import { updatePayment } from "@docspace/shared/api/portal";
import DowngradePlanButtonContainer from "./DowngradePlanButtonContainer";

const StyledBody = styled.div`
  button {
    width: 100%;
  }
`;
const MANAGER = "manager";
let timerId = null;
let intervalId = null;
let isWaitRequest = false;
let previousManagersCount = null;
const UpdatePlanButtonContainer = ({
  setIsLoading,
  paymentLink,
  isAlreadyPaid,
  managersCount,
  isDisabled,
  isLoading,
  maxCountManagersByQuota,
  setPortalQuotaValue,
  isLessCountThanAcceptable,
  currentTariffPlanTitle,
  t,
  canPayTariff,
}) => {
  const onUpdateTariff = async () => {
    try {
      timerId = setTimeout(() => {
        setIsLoading(true);
      }, 500);

      const res = await updatePayment(managersCount);

      if (res === false) {
        toastr.error(t("ErrorNotification"));

        setIsLoading(false);
        clearTimeout(timerId);
        timerId = null;

        return;
      }

      previousManagersCount = maxCountManagersByQuota;
      waitingForQuota();
    } catch (e) {
      toastr.error(t("ErrorNotification"));
      setIsLoading(false);
      clearTimeout(timerId);
      timerId = null;
    }
  };

  const resetIntervalSuccess = () => {
    intervalId &&
      toastr.success(
        t("BusinessUpdated", { planName: currentTariffPlanTitle }),
      );
    clearInterval(intervalId);
    intervalId = null;
    setIsLoading(false);
  };
  useEffect(() => {
    if (intervalId && maxCountManagersByQuota !== previousManagersCount) {
      resetIntervalSuccess();
    }
  }, [maxCountManagersByQuota, intervalId, previousManagersCount]);
  const waitingForQuota = () => {
    isWaitRequest = false;
    let requestsCount = 0;
    intervalId = setInterval(async () => {
      try {
        if (requestsCount === 30) {
          setIsLoading(false);

          intervalId && toastr.error(t("ErrorNotification"));
          clearInterval(intervalId);
          intervalId = null;

          return;
        }

        requestsCount++;

        if (isWaitRequest) {
          return;
        }

        isWaitRequest = true;
        const res = await api.portal.getPortalQuota();

        const managersObject = res.features.find((obj) => obj.id === MANAGER);

        if (managersObject?.value !== previousManagersCount) {
          setPortalQuotaValue(res);

          resetIntervalSuccess();
        }
      } catch (e) {
        setIsLoading(false);

        intervalId && toastr.error(e);
        clearInterval(intervalId);
        intervalId = null;
      }

      isWaitRequest = false;
    }, 2000);
  };

  const goToStripePortal = () => {
    paymentLink
      ? window.open(paymentLink, "_blank")
      : toastr.error(t("ErrorNotification"));
  };

  useEffect(() => {
    return () => {
      timerId && clearTimeout(timerId);
      timerId = null;

      intervalId && clearInterval(intervalId);
      intervalId = null;
    };
  }, []);

  const payTariffButton = () => {
    return canPayTariff ? (
      <Button
        className="upgrade-now-button"
        label={t("UpgradeNow")}
        size="medium"
        primary
        isDisabled={isLessCountThanAcceptable || isLoading || isDisabled}
        onClick={goToStripePortal}
        isLoading={isLoading}
      />
    ) : (
      <DowngradePlanButtonContainer
        buttonLabel={t("UpgradeNow")}
        onUpdateTariff={goToStripePortal}
        isDisabled={isDisabled}
      />
    );
  };

  const updatingCurrentTariffButton = () => {
    const isDowngradePlan = managersCount < maxCountManagersByQuota;
    const isTheSameCount = managersCount === maxCountManagersByQuota;

    return isDowngradePlan ? (
      <DowngradePlanButtonContainer
        onUpdateTariff={onUpdateTariff}
        isDisabled={isDisabled}
        buttonLabel={t("DowngradeNow")}
      />
    ) : (
      <Button
        className="upgrade-now-button"
        label={t("UpgradeNow")}
        size="medium"
        primary
        isDisabled={
          isLessCountThanAcceptable || isTheSameCount || isLoading || isDisabled
        }
        onClick={onUpdateTariff}
        isLoading={isLoading}
      />
    );
  };

  return (
    <StyledBody>
      {isAlreadyPaid ? updatingCurrentTariffButton() : payTariffButton()}
    </StyledBody>
  );
};

export default inject(
  ({ currentQuotaStore, paymentStore, currentTariffStatusStore }) => {
    const {
      maxCountManagersByQuota,
      setPortalQuotaValue,
      currentTariffPlanTitle,
    } = currentQuotaStore;

    const { isNotPaidPeriod, isGracePeriod } = currentTariffStatusStore;

    const {
      setIsLoading,
      paymentLink,
      isNeedRequest,
      isLoading,
      managersCount,
      isLessCountThanAcceptable,
      accountLink,
      isAlreadyPaid,
      canPayTariff,
    } = paymentStore;

    return {
      canPayTariff,
      isAlreadyPaid,
      setIsLoading,
      paymentLink,
      isNeedRequest,
      isLoading,
      managersCount,
      maxCountManagersByQuota,
      isLessCountThanAcceptable,
      isNotPaidPeriod,
      isGracePeriod,
      accountLink,
      setPortalQuotaValue,
      currentTariffPlanTitle,
    };
  },
)(observer(UpdatePlanButtonContainer));
