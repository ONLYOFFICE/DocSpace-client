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

import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { ModalDialogType } from "@docspace/ui-kit/components/modal-dialog/ModalDialog.enums";
import { Text } from "@docspace/ui-kit/components/text";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { ToggleButton } from "@docspace/ui-kit/components/toggle-button";
import { toastr } from "@docspace/ui-kit/components/toast";
import { HelpButton } from "@docspace/ui-kit/components/help-button";
import QuantityPicker from "@docspace/ui-kit/components/quantity-picker";
import StorageWarning from "@docspace/ui-kit/billing/services/panels/additional-storage/StorageWarning";
import { formatDateLocalized } from "@docspace/ui-kit/utils/date";

import WalletSvg from "PUBLIC_DIR/images/icons/16/wallet.react.svg";
import AutomationApiSvg from "PUBLIC_DIR/images/icons/16/docs-connect.automation-api.react.svg";
import RebrandingSvg from "PUBLIC_DIR/images/icons/16/docs-connect.rebranding.react.svg";

import { formatCurrencyValue } from "@docspace/shared/utils/common";
import type { TDocsConnectInfo } from "@docspace/shared/api/docs-connect/types";

import { getDocsConnectDaysLeft, isDocsConnectPaid } from "../utils";

import styles from "./BuyPlanPanel.module.scss";

const MIN_USERS = 1;
const DEVPACK_MIN_USERS = 10;
const MAX_USERS = 999;

interface BuyPlanPanelProps {
  visible?: boolean;
  info?: TDocsConnectInfo;
  buyPlan?: (opts: {
    users: number;
    devPack: boolean;
    topUp?: number;
  }) => Promise<void>;
  closeBuyPlan?: () => void;
}

const BuyPlanPanel = ({
  visible,
  info,
  buyPlan,
  closeBuyPlan,
}: BuyPlanPanelProps) => {
  const { t, i18n } = useTranslation(["DocsConnect", "Common"]);

  const [users, setUsers] = useState<number>(() => {
    const initial = info?.tenant.payment?.quantity ?? 50;
    const min = info?.devPackEnabled ? DEVPACK_MIN_USERS : MIN_USERS;
    return Math.max(initial, min);
  });
  const [devPack, setDevPack] = useState<boolean>(
    info?.devPackEnabled ?? false,
  );
  const [submitting, setSubmitting] = useState(false);

  if (!info) return null;

  const currency = info.wallet?.currency ?? "USD";
  const availableCredits = info.wallet?.availableCredits ?? 0;
  const pricePerUser = info.prices?.pricePerUser ?? 0;
  const devPackPrice = info.prices?.devPackPrice ?? 0;

  const minUsers = devPack ? DEVPACK_MIN_USERS : MIN_USERS;

  const onToggleDevPack = () => {
    setDevPack((prev) => {
      const next = !prev;
      if (next && users < DEVPACK_MIN_USERS) setUsers(DEVPACK_MIN_USERS);
      return next;
    });
  };

  const devPackPerUser = devPack ? devPackPrice : 0;
  const perUser = pricePerUser + devPackPerUser;
  const totalMonthly = users * perUser;

  const currentUsers = info.deactivated
    ? 0
    : (info.tenant.payment?.quantity ?? 0);
  const currentDevPack = info.devPackEnabled ?? false;
  const isEditActive = isDocsConnectPaid(info) && currentUsers > 0;

  const usersChanged = users !== currentUsers;
  const devPackChanged = devPack !== currentDevPack;
  const hasChanges = usersChanged || devPackChanged;
  const devPackTurnedOff = currentDevPack && !devPack;
  const isScheduled =
    isEditActive &&
    (devPackTurnedOff || (!devPackChanged && users < currentUsers));
  const isUpgrade = isEditActive && hasChanges && !isScheduled;

  const periodEndDate = info.tenant.endDate ?? "";
  const periodEndDateLocalized = formatDateLocalized(
    periodEndDate,
    "DATE_MED",
    { locale: i18n.language },
  );
  const remainingDays = getDocsConnectDaysLeft(periodEndDate);
  const prorationFactor = Math.min(1, remainingDays / 30);

  const addedUsers = devPackChanged ? users : Math.max(0, users - currentUsers);
  const chargeNow = isEditActive
    ? isUpgrade
      ? Math.round(addedUsers * perUser * prorationFactor * 100) / 100
      : 0
    : users * perUser;

  const remainingCredits = availableCredits - chargeNow;
  const insufficientFunds = chargeNow > 0 && remainingCredits < 0;
  const topUpRequired = Math.ceil(chargeNow - availableCredits);

  const formatCurrency = (amount: number) =>
    formatCurrencyValue(i18n.language, amount, currency, 2);

  const onBuy = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await buyPlan?.({
        users,
        devPack,
        topUp: insufficientFunds ? topUpRequired : 0,
      });
      toastr.success(
        isScheduled
          ? t("DocsConnect:ChangeScheduled")
          : t("DocsConnect:PlanPurchased"),
      );
    } catch (error) {
      toastr.error(error as Error);
    } finally {
      setSubmitting(false);
    }
  };

  const summaryRow = (label: string, value: React.ReactNode) => (
    <div className={styles.summaryRow}>
      <Text fontSize="14px" fontWeight={400} className={styles.summaryLabel}>
        {label}
      </Text>
      <Text fontSize="14px" fontWeight={600} className={styles.summaryValue}>
        {value}
      </Text>
    </div>
  );

  return (
    <ModalDialog
      visible={visible}
      displayType={ModalDialogType.aside}
      onClose={() => closeBuyPlan?.()}
      withBodyScroll
      withFooterBorder
      isDoubleFooterLine={insufficientFunds}
    >
      <ModalDialog.Header>
        {isEditActive
          ? t("Common:EditSubscription")
          : t("DocsConnect:DocsConnect")}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.body}>
          <div className={styles.walletCard}>
            <div className={styles.walletIcon} aria-hidden>
              <WalletSvg />
            </div>
            <div>
              <Text fontSize="14px" fontWeight={600}>
                {t("Common:Wallet")}
              </Text>
              {insufficientFunds ? (
                <Text
                  fontSize="13px"
                  fontWeight={400}
                  className={styles.errorText}
                >
                  {t("DocsConnect:WalletInsufficient", {
                    amount: formatCurrency(availableCredits),
                  })}
                </Text>
              ) : (
                <Text fontSize="13px" className={styles.secondaryText}>
                  {t("Common:AvailableCredits")}{" "}
                  <Text
                    as="span"
                    fontSize="13px"
                    fontWeight={600}
                    className={styles.accent}
                  >
                    {formatCurrency(availableCredits)}
                  </Text>
                </Text>
              )}
            </div>
          </div>

          <Text
            fontSize="16px"
            fontWeight={700}
            className={styles.calculateTitle}
          >
            {t("DocsConnect:CalculateYourPlan")}
          </Text>

          <div className={styles.usersBlock}>
            <Text fontSize="13px" className={styles.usersTitle}>
              {t("DocsConnect:NumberOfUsers")}
            </Text>
            <QuantityPicker
              className={styles.quantityPicker}
              value={users}
              minValue={minUsers}
              maxValue={MAX_USERS}
              step={1}
              showSlider
              showPlusSign
              underContorlsTitle={t("DocsConnect:PerUserPerMonth", {
                price: formatCurrency(pricePerUser),
              })}
              onChange={setUsers}
            />
          </div>

          <div className={styles.devPackCard}>
            <div className={styles.devPackHeader}>
              <div>
                <Text fontSize="13px" fontWeight={600}>
                  {t("DocsConnect:DevPack")}{" "}
                  <Text
                    as="span"
                    fontSize="13px"
                    fontWeight={400}
                    className={styles.secondaryText}
                  >
                    {t("DocsConnect:OptionalAddOn")}
                  </Text>
                </Text>
                <Text fontSize="13px">
                  {t("DocsConnect:PerUserPerMonth", {
                    price: formatCurrency(devPackPrice),
                  })}{" "}
                  <Text
                    as="span"
                    fontSize="13px"
                    className={styles.secondaryText}
                  >
                    {t("DocsConnect:MinUsersNote", {
                      count: DEVPACK_MIN_USERS,
                    })}
                  </Text>
                </Text>
              </div>
              <ToggleButton
                className={styles.toggleButton}
                isChecked={devPack}
                onChange={onToggleDevPack}
              />
            </div>
            <hr className={styles.devPackDivider} />
            <div className={styles.devPackFeatures}>
              <div className={styles.devPackFeature}>
                <div className={styles.devPackFeatureIcon} aria-hidden>
                  <AutomationApiSvg />
                </div>
                <div>
                  <Text fontSize="12px" fontWeight={600}>
                    {t("DocsConnect:AutomationApi")}
                  </Text>
                  <Text fontSize="12px" className={styles.secondaryText}>
                    {t("DocsConnect:AutomationApiDescription")}
                  </Text>
                </div>
              </div>
              <div className={styles.devPackFeature}>
                <div className={styles.devPackFeatureIcon} aria-hidden>
                  <RebrandingSvg />
                </div>
                <div>
                  <Text fontSize="12px" fontWeight={600}>
                    {t("DocsConnect:Rebranding")}
                  </Text>
                  <Text fontSize="12px" className={styles.secondaryText}>
                    {t("DocsConnect:RebrandingDescription")}
                  </Text>
                </div>
              </div>
            </div>
          </div>

          {isEditActive && !hasChanges ? null : (
            <>
              <Text
                fontSize="16px"
                fontWeight={700}
                className={styles.orderSummaryTitle}
              >
                {t("Common:OrderSummary")}
              </Text>
              <div className={styles.summaryCard}>
                {isEditActive ? (
                  <>
                    {devPackTurnedOff
                      ? summaryRow(
                          t("DocsConnect:DevPackDisabledLabel"),
                          t("DocsConnect:MinusPricePerUser", {
                            price: formatCurrency(devPackPrice),
                          }),
                        )
                      : null}
                    {usersChanged
                      ? summaryRow(
                          t("DocsConnect:UserAdjustmentLabel"),
                          `${currentUsers} → ${users}`,
                        )
                      : summaryRow(t("DocsConnect:PlanUsers"), `${users}`)}
                    {usersChanged && users > currentUsers
                      ? summaryRow(
                          t("DocsConnect:AdditionalUsers"),
                          `+${users - currentUsers}`,
                        )
                      : null}
                    {usersChanged && users < currentUsers
                      ? summaryRow(
                          t("DocsConnect:ReducedUsers"),
                          t("DocsConnect:MinusCount", {
                            count: currentUsers - users,
                          }),
                        )
                      : null}
                    {summaryRow(
                      t("DocsConnect:BasePricePerUser"),
                      formatCurrency(pricePerUser),
                    )}
                    {devPack
                      ? summaryRow(
                          t("DocsConnect:DevPackPerUser"),
                          formatCurrency(devPackPrice),
                        )
                      : null}
                    {isUpgrade ? (
                      summaryRow(
                        t("Common:RemainingPeriod"),
                        <>
                          {t("DocsConnect:DaysCount", {
                            count: remainingDays,
                          })}{" "}
                          <Text
                            as="span"
                            fontSize="14px"
                            fontWeight={400}
                            className={styles.secondaryText}
                          >
                            (
                            {t("Common:UntilDate", {
                              date: periodEndDateLocalized,
                            })}
                            )
                          </Text>
                        </>,
                      )
                    ) : (
                      <>
                        {summaryRow(
                          t("Common:NewMonthlyPrice"),
                          formatCurrency(totalMonthly),
                        )}
                        {summaryRow(
                          t("Common:EffectiveDate"),
                          periodEndDateLocalized,
                        )}
                      </>
                    )}
                    <hr className={styles.summaryDivider} />
                    <div className={styles.summaryRow}>
                      <div className={styles.totalLabel}>
                        <Text
                          fontSize="14px"
                          fontWeight={600}
                          className={styles.summaryValue}
                        >
                          {t("Common:TotalDueToday")}
                        </Text>
                        {isUpgrade ? (
                          <HelpButton
                            size={12}
                            tooltipContent={t(
                              "DocsConnect:TotalDueTodayTooltip",
                            )}
                            tooltipMaxWidth="320px"
                          />
                        ) : null}
                      </div>
                      <Text
                        fontSize="14px"
                        fontWeight={600}
                        className={styles.summaryValue}
                      >
                        {formatCurrency(chargeNow)}
                      </Text>
                    </div>
                  </>
                ) : (
                  <>
                    {summaryRow(t("DocsConnect:PlanUsers"), `${users}`)}
                    {summaryRow(
                      t("DocsConnect:BasePricePerUser"),
                      formatCurrency(pricePerUser),
                    )}
                    {summaryRow(
                      t("DocsConnect:DevPackPerUser"),
                      formatCurrency(devPack ? devPackPrice : 0),
                    )}
                    <hr className={styles.summaryDivider} />
                    <div className={styles.summaryRow}>
                      <Text
                        fontSize="14px"
                        fontWeight={600}
                        className={styles.summaryValue}
                      >
                        {t("DocsConnect:TotalMonthly")}
                      </Text>
                      <Text
                        fontSize="14px"
                        fontWeight={600}
                        className={styles.summaryValue}
                      >
                        {formatCurrency(totalMonthly)}
                      </Text>
                    </div>
                  </>
                )}
              </div>
              {isScheduled ? (
                <StorageWarning
                  body={t("Common:ScheduledChangeBillingPeriodNote", {
                    date: periodEndDateLocalized,
                  })}
                />
              ) : insufficientFunds ? (
                <Text
                  fontSize="12px"
                  className={styles.errorText}
                  textAlign="right"
                >
                  {t("Common:WalletTopUpRequired", {
                    currency: formatCurrency(topUpRequired),
                  })}
                </Text>
              ) : (
                <Text
                  fontSize="12px"
                  className={styles.secondaryText}
                  textAlign="right"
                >
                  {isEditActive
                    ? t("DocsConnect:RemainingBalanceAfter", {
                        amount: formatCurrency(remainingCredits),
                      })
                    : t("DocsConnect:RemainingCreditsAfter", {
                        amount: formatCurrency(remainingCredits),
                      })}
                </Text>
              )}
            </>
          )}
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        {insufficientFunds ? (
          <Text fontSize="13px" fontWeight={400} className={styles.footerHint}>
            <Trans
              ns="DocsConnect"
              i18nKey="TopUpHint"
              values={{ amount: formatCurrency(topUpRequired) }}
              components={{ 1: <Text as="span" fontWeight={600} /> }}
            />
          </Text>
        ) : null}
        <div className={styles.footerButtons}>
          <Button
            primary
            scale
            size={ButtonSize.normal}
            label={
              isEditActive
                ? isScheduled
                  ? t("Common:ScheduleChange")
                  : insufficientFunds
                    ? t("DocsConnect:TopUpAndBuy")
                    : t("DocsConnect:Upgrade")
                : insufficientFunds
                  ? info.deactivated
                    ? t("Common:TopUpAndPay")
                    : t("DocsConnect:TopUpAndBuy")
                  : t("DocsConnect:BuyAPlan")
            }
            onClick={onBuy}
            isLoading={submitting}
            isDisabled={submitting || (isEditActive && !hasChanges)}
          />
          <Button
            scale
            size={ButtonSize.normal}
            label={t("Common:CancelButton")}
            onClick={() => closeBuyPlan?.()}
            isDisabled={submitting}
          />
        </div>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(({ docsConnectStore }: TStore) => ({
  visible: docsConnectStore.buyPlanPanelVisible,
  info: docsConnectStore.info,
  buyPlan: docsConnectStore.buyPlan,
  closeBuyPlan: docsConnectStore.closeBuyPlan,
}))(observer(BuyPlanPanel));
