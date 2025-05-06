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

import { useEffect, useState } from "react";
import { inject, observer } from "mobx-react";
import { Trans } from "react-i18next";
import styled from "styled-components";

import { Button, ButtonSize } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";
import api from "@docspace/shared/api";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { updatePayment } from "@docspace/shared/api/portal";
import { Text } from "@docspace/shared/components/text";

import DowngradePlanButtonContainer from "./DowngradePlanButtonContainer";

const StyledBody = styled.div`
  button {
    width: 100%;
  }
`;
const StyledModalBody = styled.div`
  .text-warning {
    margin: 16px 0 8px 0;
    color: ${(props) => props.theme.client.settings.backup.warningColor};
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
  isYearTariff,
  cardLinkedOnFreeTariff,
  tariffPlanTitle,
  totalPrice,
  currencySymbol,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const resetIntervalSuccess = () => {
    intervalId &&
      toastr.success(
        t("BusinessUpdated", { planName: currentTariffPlanTitle }),
      );
    clearInterval(intervalId);
    intervalId = null;
    setIsLoading(false);
  };

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
        const res = await api.portal.getPortalQuota(true);

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
  const onClose = () => {
    setIsVisible(false);
  };

  const onUpdateTariff = async () => {
    try {
      timerId = setTimeout(() => {
        setIsLoading(true);
      }, 500);

      if (isVisible) onClose();

      const res = await updatePayment(managersCount, isYearTariff);

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

  useEffect(() => {
    if (intervalId && maxCountManagersByQuota !== previousManagersCount) {
      resetIntervalSuccess();
    }
  }, [maxCountManagersByQuota, intervalId, previousManagersCount]);

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

    if (cardLinkedOnFreeTariff) {
      return (
        <Button
          className="upgrade-now-button"
          label={t("UpgradeNow")}
          size="medium"
          primary
          isDisabled={isLoading || isDisabled}
          onClick={() => setIsVisible(true)}
          isLoading={isLoading}
        />
      );
    }

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
      {isAlreadyPaid || cardLinkedOnFreeTariff
        ? updatingCurrentTariffButton()
        : payTariffButton()}

      {isVisible ? (
        <ModalDialog
          visible={isVisible}
          onClose={onClose}
          displayType={ModalDialogType.modal}
        >
          <ModalDialog.Header>{t("PlanUpgrade")}</ModalDialog.Header>
          <ModalDialog.Body>
            <StyledModalBody>
              <Text>
                <Trans
                  i18nKey="SwitchPlan"
                  ns="Payments"
                  t={t}
                  values={{ planName: tariffPlanTitle }}
                  components={{
                    1: <span style={{ fontWeight: 600 }} />,
                  }}
                />
              </Text>
              <Text>
                <Trans
                  i18nKey="ChargeAmount"
                  ns="Payments"
                  t={t}
                  values={{ currencySymbol, price: totalPrice }}
                  components={{
                    1: <span style={{ fontWeight: 600 }} />,
                  }}
                />
              </Text>
              <Text className="text-warning" isBold fontSize="16px">
                {t("Common:Warning")}
              </Text>
              <Text>
                <Trans
                  i18nKey="PaymentNonRefundable"
                  ns="Payments"
                  t={t}
                  components={{
                    1: <span style={{ fontWeight: 600 }} />,
                  }}
                />
              </Text>
            </StyledModalBody>
          </ModalDialog.Body>
          <ModalDialog.Footer>
            <Button
              key="OkButton"
              label={t("ConfirmPayment")}
              size={ButtonSize.normal}
              primary
              scale
              onClick={onUpdateTariff}
            />
            <Button
              key="CancelButton"
              label={t("Common:CancelButton")}
              size={ButtonSize.normal}
              scale
              onClick={onClose}
            />
          </ModalDialog.Footer>
        </ModalDialog>
      ) : null}
    </StyledBody>
  );
};

export default inject(
  ({
    currentQuotaStore,
    paymentStore,
    currentTariffStatusStore,
    paymentQuotasStore,
  }) => {
    const {
      maxCountManagersByQuota,
      setPortalQuotaValue,
      currentTariffPlanTitle,
      isYearTariff,
    } = currentQuotaStore;
    const { tariffPlanTitle, planCost } = paymentQuotasStore;
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
      cardLinkedOnFreeTariff,
      totalPrice,
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
      isYearTariff,
      cardLinkedOnFreeTariff,
      tariffPlanTitle,
      currencySymbol: planCost.currencySymbol,
      totalPrice,
    };
  },
)(observer(UpdatePlanButtonContainer));
