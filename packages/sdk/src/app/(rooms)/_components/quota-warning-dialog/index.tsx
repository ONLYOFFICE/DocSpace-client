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

"use client";

import React, { useState, useEffect } from "react";
import { observer } from "mobx-react";
import { Trans, useTranslation } from "react-i18next";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import {
  parseToDateTime,
  formatDateLocalized,
} from "@docspace/ui-kit/utils/date";
import { getDaysRemaining } from "@docspace/shared/utils/common";

import { useDialogsStore } from "@/app/(docspace)/_store/DialogsStore";
import { SDKDialogs } from "@/app/(docspace)/_enums/dialogs";
import { useRoomsQuotaStore } from "../../_store/RoomsQuotaStore";

type QuotaWarningDialogProps = {
  isPaymentPageAvailable: boolean;
  standalone: boolean;
  language: string;
};

const QuotaWarningDialog = observer(
  ({
    isPaymentPageAvailable,
    standalone,
    language,
  }: QuotaWarningDialogProps) => {
    const { t, ready } = useTranslation(["Payments", "Common"]);
    const dialogsStore = useDialogsStore();
    const quotaStore = useRoomsQuotaStore();

    const visible = dialogsStore.isDialogOpen(SDKDialogs.QuotaWarningRooms);

    const {
      isGracePeriod,
      dueDate,
      delayDueDate,
      isRoomsTariffLimit,
      maxCountRoomsByQuota,
      usedRoomsCount,
    } = quotaStore;

    const [datesData, setDatesData] = useState<{
      fromDate?: string;
      byDate?: string;
      delayDaysCount?: string;
    }>({});

    useEffect(() => {
      if (!isGracePeriod || !dueDate || !delayDueDate) return;
      const fromDateDt = parseToDateTime(dueDate);
      const byDateDt = parseToDateTime(delayDueDate);
      setDatesData({
        fromDate: fromDateDt
          ? formatDateLocalized(fromDateDt, "DATE_MED", { locale: language })
          : "",
        byDate: byDateDt
          ? formatDateLocalized(byDateDt, "DATE_MED", { locale: language })
          : "",
        delayDaysCount: byDateDt
          ? getDaysRemaining(byDateDt.toJSDate())
          : undefined,
      });
    }, [language, dueDate, delayDueDate, isGracePeriod]);

    const { fromDate, byDate, delayDaysCount } = datesData;

    const onClose = () => {
      if (!isGracePeriod) {
        const closeItems =
          JSON.parse(localStorage.getItem("warning-dialog") ?? "[]") || [];
        const closed = [...closeItems, "room-quota"];
        localStorage.setItem("warning-dialog", JSON.stringify(closed));
      }
      dialogsStore.closeDialog(SDKDialogs.QuotaWarningRooms);
    };

    const onUpgradePlan = () => {
      onClose();
      window.open("/portal-settings/payments/portal-payments", "_blank");
    };

    const gracePeriodContent = (
      <>
        <Text fontWeight={700}>
          {standalone
            ? t("LicenseExpiredRestriction")
            : t("PlanPaymentOverdue", { planName: "" })}
        </Text>
        <br />
        <Text as="div">
          {standalone ? (
            <Trans
              i18nKey="GracePeriodActive"
              ns="Payments"
              t={t}
              values={{ fromDate, byDate, delayDaysCount }}
              components={{ 1: <Text key="grace-period-text" as="span" /> }}
            />
          ) : (
            <Trans
              t={t}
              i18nKey="GracePeriodActivatedInfo"
              ns="Common"
              values={{ fromDate, byDate, delayDaysCount }}
              components={{ 1: <strong key="grace-period-dates" /> }}
            />
          )}
        </Text>
        <br />
        <Text>
          {standalone
            ? t("LicenseGracePeriodInfo")
            : t("Common:GracePeriodActivatedDescription")}
        </Text>
      </>
    );

    const chooseNewPlan = (
      <Text>
        {isPaymentPageAvailable
          ? t("ChooseNewPlan")
          : t("MainBar:ContactToUpgradeTariff")}
      </Text>
    );

    const roomsLimitContent = isRoomsTariffLimit ? (
      <>
        <Text fontWeight={600}>{t("CannotCreateNewRoom")}</Text>
        <br />
        <Text>{t("NewRoomWillExceedLimit")}</Text>
        <br />
        {chooseNewPlan}
      </>
    ) : (
      <>
        <Text fontWeight={600}>{t("RoomsQuotaAlmostExhausted")}</Text>
        <br />
        <Text>
          {t("NumberOfRoomsAccordingToTariff", {
            currentValue: usedRoomsCount,
            maxValue: maxCountRoomsByQuota,
          })}
        </Text>
        <br />
        {chooseNewPlan}
      </>
    );

    return (
      <ModalDialog
        isLarge={isGracePeriod}
        isLoading={!ready}
        visible={visible}
        onClose={onClose}
        displayType={ModalDialogType.modal}
        autoMaxHeight
      >
        <ModalDialog.Header>{t("Common:Warning")}</ModalDialog.Header>
        <ModalDialog.Body>
          {isGracePeriod ? gracePeriodContent : roomsLimitContent}
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <Button
            key="OKButton"
            label={
              isPaymentPageAvailable
                ? t("Common:UpgradePlan")
                : t("Common:OKButton")
            }
            size={ButtonSize.normal}
            primary
            onClick={isPaymentPageAvailable ? onUpgradePlan : onClose}
            scale
          />
          <Button
            key="CancelButton"
            label={t("Common:CancelButton")}
            size={ButtonSize.normal}
            onClick={onClose}
            scale
          />
        </ModalDialog.Footer>
      </ModalDialog>
    );
  },
);

export default QuotaWarningDialog;

