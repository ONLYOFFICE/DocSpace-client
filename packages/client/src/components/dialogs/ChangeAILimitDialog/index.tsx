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

import React, { useState } from "react";
import { inject, observer } from "mobx-react";
import { Trans, useTranslation } from "react-i18next";
import classNames from "classnames";

import api from "@docspace/shared/api";
import { formatAiAmount } from "@docspace/shared/utils/common";
import {
  ModalDialog,
  ModalDialogType,
} from "@onlyoffice/apps-ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@onlyoffice/apps-ui-kit/components/button";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import LimitAmountField from "@onlyoffice/apps-ui-kit/billing/shared/service-limits/sub-components/LimitAmountField";
import LimitPeriodComboBox from "@onlyoffice/apps-ui-kit/billing/shared/service-limits/sub-components/LimitPeriodComboBox";
import type { TServiceLimitPeriod } from "@onlyoffice/apps-ui-kit/billing/shared/service-limits/common/types";
import {
  DEFAULT_LIMIT_PERIOD,
  MAX_LIMIT_AMOUNT,
  MIN_LIMIT_AMOUNT,
  formatAmountInput,
  formatPeriodEnd,
  getCurrencySymbol,
  getLimitUsagePercent,
  getPeriodEnd,
  isAmountOutOfRange,
  isCurrencySymbolAfter,
  parseAmount,
} from "@onlyoffice/apps-ui-kit/billing/shared/service-limits/common/utils";

import type { TAILimitUser } from "SRC_DIR/helpers/contacts";
import UsersStore from "SRC_DIR/store/contacts/UsersStore";

import styles from "./ChangeAILimit.module.scss";

type ChangeAILimitDialogOwnProps = {
  visible: boolean;
  items: TAILimitUser[];
  onClose: () => void;
};

type ChangeAILimitDialogInjectedProps = {
  refreshUser?: UsersStore["refreshUser"];
};

type ChangeAILimitDialogProps = ChangeAILimitDialogOwnProps &
  ChangeAILimitDialogInjectedProps;

const ChangeAILimitDialog = ({
  visible,
  items,
  onClose,
  refreshUser,
}: ChangeAILimitDialogProps) => {
  const { t, i18n } = useTranslation(["Common"]);

  const item = items.length === 1 ? items[0] : null;
  const limit = item?.aiServicesLimit;
  const usage = limit?.usage ?? null;
  const currency = limit?.currency ?? "";

  const [amountText, setAmountText] = useState(
    formatAmountInput(limit?.amountValue),
  );
  const [period, setPeriod] = useState<TServiceLimitPeriod>(
    limit?.period ?? DEFAULT_LIMIT_PERIOD,
  );
  const [isLoading, setIsLoading] = useState(false);

  const format = (amount: number, fractionDigits = 2) =>
    formatAiAmount(i18n.language, amount, currency, fractionDigits);

  const amount = parseAmount(amountText);
  const isOutOfRange = isAmountOutOfRange(amount);

  const getErrorMessage = () => {
    if (amount === null) return undefined;

    if (amount > MAX_LIMIT_AMOUNT) {
      return t("Common:MaxCurrency", {
        currency: format(MAX_LIMIT_AMOUNT, 0),
      });
    }

    if (amount < MIN_LIMIT_AMOUNT) {
      return t("Common:MinCurrency", {
        currency: format(MIN_LIMIT_AMOUNT, 0),
      });
    }

    return undefined;
  };

  const isDirty =
    limit?.scope !== "Custom" ||
    amount !== limit.amountValue ||
    period !== limit.period;

  const canSave = amount !== null && !isOutOfRange && isDirty && !isLoading;

  const isSamePeriod = Boolean(limit && period === limit.period);
  const periodEnd =
    isSamePeriod && usage ? usage.periodEnd : getPeriodEnd(period);
  const date = formatPeriodEnd(periodEnd, i18n.language);
  const spentValue = usage?.amountConsumed ?? 0;
  const isSpentKnown = isSamePeriod && Boolean(usage);
  const isBelowSpent = isSpentKnown && amount !== null && amount < spentValue;

  const getCountedFromHint = () => {
    switch (period) {
      case "Week":
        return t("Common:AILimitCountedFromWeek");
      case "Month":
        return t("Common:AILimitCountedFromMonth");
      case "Lifetime":
        return t("Common:AILimitCountedFromLifetime");
      default:
        return t("Common:AILimitCountedFromDay");
    }
  };

  const renderSpending = () => {
    if (isBelowSpent && amount !== null) {
      const values = {
        spent: format(spentValue),
        amount: format(amount),
        date,
      };
      const components = { 1: <Text as="span" fontWeight={600} /> };

      return (
        <Text className={classNames(styles.status, styles.statusWarning)}>
          {periodEnd ? (
            <Trans
              t={t}
              i18nKey="Common:LimitBelowSpent"
              values={values}
              components={components}
            />
          ) : (
            <Trans
              t={t}
              i18nKey="Common:LimitBelowSpentLifetime"
              values={values}
              components={components}
            />
          )}
        </Text>
      );
    }

    const parts: string[] = [];

    if (isSpentKnown && limit && limit.amountValue !== null) {
      parts.push(
        t("Common:AISpentOfLimit", {
          spent: format(spentValue),
          limit: format(limit.amountValue),
          percent: getLimitUsagePercent(spentValue, limit.amountValue),
        }),
      );
    }

    if (periodEnd) parts.push(t("Common:LimitResets", { date }));

    if (!parts.length) return null;

    return <Text className={styles.status}>{parts.join(" ")}</Text>;
  };

  const onSave = async () => {
    if (!canSave || amount === null) return;

    setIsLoading(true);

    try {
      await api.portal.setUserAILimits(
        items.map((user) => user.id),
        amount,
        period,
      );
      await Promise.all(items.map((user) => refreshUser?.(user.id)));
      toastr.success(t("Common:AILimitSet"));
      onClose();
    } catch (e) {
      toastr.error(e as Error);
      setIsLoading(false);
    }
  };

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.modal}
    >
      <ModalDialog.Header>{t("Common:ChangeAILimit")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.content}>
          <Text>{t("Common:SetAILimitDescription")}</Text>
          <div className={styles.controls}>
            <div className={styles.amount}>
              <LimitAmountField
                value={amountText}
                onChange={setAmountText}
                currencySymbol={getCurrencySymbol(i18n.language, currency)}
                isSymbolAfter={isCurrencySymbolAfter(i18n.language, currency)}
                isDisabled={isLoading}
                errorMessage={getErrorMessage()}
                isAutoFocussed
                onEnter={onSave}
                testId="change_ai_limit_amount_input"
              />
            </div>
            <LimitPeriodComboBox
              value={period}
              onChange={setPeriod}
              isDisabled={isLoading}
              testId="change_ai_limit_period_combobox"
            />
          </div>
          <div className={styles.statusBlock}>
            <Text className={styles.status}>{getCountedFromHint()}</Text>
            {renderSpending()}
          </div>
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          label={t("Common:OKButton")}
          size={ButtonSize.normal}
          primary
          onClick={onSave}
          isLoading={isLoading}
          isDisabled={!canSave}
          scale
          testId="change_ai_limit_dialog_submit"
        />
        <Button
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          onClick={onClose}
          isDisabled={isLoading}
          scale
          testId="change_ai_limit_dialog_cancel"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(({ peopleStore }: TStore) => ({
  refreshUser: peopleStore.usersStore!.refreshUser,
}))(observer(ChangeAILimitDialog));
