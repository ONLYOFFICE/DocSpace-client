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

import React, { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation, Trans } from "react-i18next";
import { useNavigate, useLocation } from "react-router";
import {
  parseToDateTime,
  formatDateLocalized,
} from "@docspace/ui-kit/utils/date";
import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Button } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { getDaysRemaining } from "@docspace/shared/utils/common";

import RoomsContent from "./sub-components/RoomsContent";
import UsersContent from "./sub-components/UsersContent";
import { getBrandName } from "@docspace/shared/constants/brands";

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
    standalone,
  } = props;

  const navigate = useNavigate();
  const location = useLocation();

  const isAccounts = location.pathname.includes("accounts/people");

  const [datesData, setDatesData] = useState({});

  const { fromDate, byDate, delayDaysCount } = datesData;

  const gracePeriodDays = () => {
    const fromDateDt = parseToDateTime(dueDate);
    const byDateDt = parseToDateTime(delayDueDate);

    setDatesData({
      fromDate: fromDateDt
        ? formatDateLocalized(fromDateDt, "DATE_MED", { locale: language })
        : "",
      byDate: byDateDt
        ? formatDateLocalized(byDateDt, "DATE_MED", { locale: language })
        : "",
      delayDaysCount: getDaysRemaining(byDateDt),
    });
  };

  useEffect(() => {
    gracePeriodDays();
  }, [language, dueDate, delayDueDate]);

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
        {standalone
          ? t("LicenseExpiredRestriction")
          : t("PlanPaymentOverdue", {
              planName: currentTariffPlanTitle,
            })}
      </Text>
      <br />
      <Text as="div">
        {standalone ? (
          <Trans
            i18nKey="GracePeriodActive"
            ns="Payments"
            t={t}
            values={{
              fromDate,
              byDate,
              delayDaysCount,
            }}
            components={{
              1: <Text as="span" />,
            }}
          />
        ) : (
          <Trans t={t} i18nKey="GracePeriodActivatedInfo" ns="Payments">
            Grace period activated
            <strong>
              from {{ fromDate }} to {{ byDate }}
            </strong>
            (days remaining: {{ delayDaysCount }})
          </Trans>
        )}
      </Text>
      <br />
      <Text>
        {standalone
          ? t("LicenseGracePeriodInfo", {
              productName: getBrandName("ProductName"),
            })
          : t("GracePeriodActivatedDescription", {
              productName: getBrandName("ProductName"),
            })}
      </Text>
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
            isPaymentPageAvailable
              ? t("Common:UpgradePlan")
              : t("Common:OKButton")
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
    settingsStore,
  }) => {
    const { isPaymentPageAvailable } = authStore;
    const { dueDate, delayDueDate, isGracePeriod } = currentTariffStatusStore;
    const { currentTariffPlanTitle } = currentQuotaStore;

    const { inviteQuotaWarningDialogVisible, setQuotaWarningDialogVisible } =
      dialogsStore;
    const { standalone } = settingsStore;

    return {
      isPaymentPageAvailable,
      currentTariffPlanTitle,
      language: authStore.language,
      visible: inviteQuotaWarningDialogVisible,
      setIsVisible: setQuotaWarningDialogVisible,
      dueDate,
      delayDueDate,
      isGracePeriod,
      standalone,
    };
  },
)(observer(withTranslation(["Payments", "Common"])(InviteQuotaWarningDialog)));

