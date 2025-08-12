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

import React, { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation, Trans } from "react-i18next";
import { useNavigate, useLocation } from "react-router";
import moment from "moment-timezone";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Button } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { getDaysRemaining } from "@docspace/shared/utils/common";

import RoomsContent from "./sub-components/RoomsContent";
import UsersContent from "./sub-components/UsersContent";

const InviteQuotaWarningDialog = (props) => {
  const {
    t,
    tReady,

    language,
    dueDate,
    delayDueDate,
    visible,
    setIsVisible,
    isGracePeriod,
    currentTariffPlanTitle,
    isPaymentPageAvailable,
  } = props;

  const navigate = useNavigate();
  const location = useLocation();
  const isAccounts = location.pathname.includes("accounts/people");

  const [datesData, setDatesData] = useState({});

  const { fromDate, byDate, delayDaysCount } = datesData;

  const gracePeriodDays = () => {
    const fromDateMoment = moment(dueDate);
    const byDateMoment = moment(delayDueDate);

    setDatesData({
      fromDate: fromDateMoment.format("LL"),
      byDate: byDateMoment.format("LL"),
      delayDaysCount: getDaysRemaining(byDateMoment),
    });
  };

  useEffect(() => {
    moment.locale(language);
    if (window.timezone) moment().tz(window.timezone);

    gracePeriodDays();
  }, [language, window.timezone]);

  const onClose = () => {
    if (!isGracePeriod) {
      const closeItems =
        JSON.parse(localStorage.getItem("warning-dialog")) || [];

      const warningItem = isAccounts ? "user-quota" : "room-quota";

      const closed =
        closeItems.length > 0 ? [...closeItems, warningItem] : [warningItem];
      console.log("closed", closed);
      localStorage.setItem("warning-dialog", JSON.stringify(closed));
    }

    setIsVisible(false);
  };

  const onUpgradePlan = () => {
    onClose();

    const paymentPageUrl = "/portal-settings/payments/portal-payments";

    navigate(paymentPageUrl);
  };

  const contentForGracePeriod = (
    <>
      <Text fontWeight={700}>
        {t("BusinessPlanPaymentOverdue", {
          planName: currentTariffPlanTitle,
        })}
      </Text>
      <br />
      <Text as="div">
        <Trans t={t} i18nKey="GracePeriodActivatedInfo" ns="Payments">
          Grace period activated
          <strong>
            from {{ fromDate }} to {{ byDate }}
          </strong>
          (days remaining: {{ delayDaysCount }})
        </Trans>
      </Text>
      <br />
      <Text>{t("GracePeriodActivatedDescription")}</Text>
    </>
  );

  return (
    <ModalDialog
      isLarge={isGracePeriod}
      isLoading={!tReady}
      visible={visible}
      onClose={onClose}
      displayType="modal"
      autoMaxHeight
    >
      <ModalDialog.Header>{t("Common:Warning")}</ModalDialog.Header>
      <ModalDialog.Body>
        {isGracePeriod ? (
          contentForGracePeriod
        ) : isAccounts ? (
          <UsersContent />
        ) : (
          <RoomsContent />
        )}
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          key="OKButton"
          label={
            isPaymentPageAvailable ? t("UpgradePlan") : t("Common:OKButton")
          }
          size="normal"
          primary
          onClick={isPaymentPageAvailable ? onUpgradePlan : onClose}
          scale
        />

        <Button
          key="CancelButton"
          label={t("Common:CancelButton")}
          size="normal"
          onClick={onClose}
          scale
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(
  ({
    authStore,
    dialogsStore,
    currentTariffStatusStore,
    currentQuotaStore,
  }) => {
    const { isPaymentPageAvailable } = authStore;
    const { dueDate, delayDueDate, isGracePeriod } = currentTariffStatusStore;
    const { currentTariffPlanTitle } = currentQuotaStore;

    const { inviteQuotaWarningDialogVisible, setQuotaWarningDialogVisible } =
      dialogsStore;

    return {
      isPaymentPageAvailable,
      currentTariffPlanTitle,
      language: authStore.language,
      visible: inviteQuotaWarningDialogVisible,
      setIsVisible: setQuotaWarningDialogVisible,
      dueDate,
      delayDueDate,
      isGracePeriod,
    };
  },
)(observer(withTranslation(["Payments", "Common"])(InviteQuotaWarningDialog)));
