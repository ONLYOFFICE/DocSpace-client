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

import { useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { useApi } from "@docspace/ui-kit/providers/api";

import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { ModalDialogType } from "@docspace/ui-kit/components/modal-dialog/ModalDialog.enums";
import { Text } from "@docspace/ui-kit/components/text";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { ToggleButton } from "@docspace/ui-kit/components/toggle-button";
import { toastr } from "@docspace/ui-kit/components/toast";
import { HelpButton } from "@docspace/ui-kit/components/help-button";
import { Tooltip } from "@docspace/ui-kit/components/tooltip";
import { Loader, LoaderTypes } from "@docspace/ui-kit/components/loader";
import QuantityPicker from "@docspace/ui-kit/components/quantity-picker";
import StorageWarning from "@docspace/ui-kit/billing/services/panels/additional-storage/StorageWarning";
import { formatDateLocalized } from "@docspace/ui-kit/utils/date";

import WalletSvg from "PUBLIC_DIR/images/icons/16/wallet.react.svg";
import AutomationApiSvg from "PUBLIC_DIR/images/icons/16/docs-connect.automation-api.react.svg";
import RebrandingSvg from "PUBLIC_DIR/images/icons/16/docs-connect.rebranding.react.svg";
import ExternalLinkSvg from "PUBLIC_DIR/images/external.link.14.react.svg";

import { formatCurrencyValue } from "@docspace/shared/utils/common";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import type {
  TDocsConnectInfo,
  TDocsConnectDevPackCalculation,
} from "@docspace/shared/api/docs-connect/types";

import config from "PACKAGE_FILE";

import ClientSimpleTopUpDialog from "SRC_DIR/components/EmptyContainer/sub-components/EmptyViewContainer/ClientSimpleTopUpDialog";

import {
  getDocsConnectDaysLeft,
  getDocsConnectNextBillingDate,
  getDocsConnectPeriodDays,
  isDocsConnectPaid,
} from "../utils";
import { PAYMENT_ROUTES } from "../../../payments/utils";

import styles from "./BuyPlanPanel.module.scss";

const MIN_USERS = 1;
const DEVPACK_MIN_USERS = 10;
const MAX_USERS = 999;
const USERS_MINUS_TOOLTIP_ID = "docs_connect_users_minus_tooltip";
const DEVPACK_CALC_DEBOUNCE_MS = 500;

interface BuyPlanPanelProps {
  visible?: boolean;
  info?: TDocsConnectInfo;
  buyPlan?: (opts: {
    users: number;
    devPack: boolean;
    topUp?: number;
  }) => Promise<void>;
  calculateDevPack?: (
    quantity: number,
  ) => Promise<TDocsConnectDevPackCalculation | null>;
  switchToDevPack?: (opts: {
    quantity: number;
    topUp?: number;
  }) => Promise<void>;
  buyPlanViaStripe?: (opts: {
    users: number;
    devPack: boolean;
    topUp: number;
    totalMonthly: number;
    language: string;
    fetchCardLinked: (
      backUrl?: string,
      successUrl?: string,
    ) => Promise<string | null | undefined>;
    signal: AbortSignal;
  }) => Promise<boolean>;
  isCardMissingOrInactive?: boolean;
  fetchPayerInfo?: (isRefresh?: boolean) => Promise<unknown>;
  fetchWalletBalance?: (isRefresh?: boolean) => Promise<number>;
  closeBuyPlan?: () => void;
}

const BuyPlanPanel = ({
  visible,
  info,
  buyPlan,
  calculateDevPack,
  switchToDevPack,
  buyPlanViaStripe,
  isCardMissingOrInactive,
  fetchPayerInfo,
  fetchWalletBalance,
  closeBuyPlan,
}: BuyPlanPanelProps) => {
  const { t, i18n } = useTranslation(["DocsConnect", "Common"]);
  const { paymentApi } = useApi();

  const [users, setUsers] = useState<number>(() => {
    const initial = info?.tenant.payment?.quantity ?? 50;
    const min = info?.devPackEnabled ? DEVPACK_MIN_USERS : MIN_USERS;
    return Math.max(initial, min);
  });
  const [devPack, setDevPack] = useState<boolean>(
    info?.devPackEnabled ?? false,
  );
  const [submitting, setSubmitting] = useState(false);
  const [waitingPayment, setWaitingPayment] = useState(false);
  const [topUpDialogVisible, setTopUpDialogVisible] = useState(false);
  const [devPackCalc, setDevPackCalc] =
    useState<TDocsConnectDevPackCalculation | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    fetchPayerInfo?.()?.catch(() => {});
    fetchWalletBalance?.()?.catch(() => {});
  }, [visible, fetchPayerInfo, fetchWalletBalance]);

  useEffect(() => {
    if (!info) return undefined;

    const curUsers = info.deactivated
      ? 0
      : (info.tenant.payment?.quantity ?? 0);
    const curDevPack = info.devPackEnabled ?? false;
    const isUp =
      isDocsConnectPaid(info) && curUsers > 0 && devPack && !curDevPack;

    if (!isUp) {
      setDevPackCalc(null);
      return undefined;
    }

    let cancelled = false;
    setCalcLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await calculateDevPack?.(users);
        if (!cancelled) setDevPackCalc(res ?? null);
      } catch {
        if (!cancelled) setDevPackCalc(null);
      } finally {
        if (!cancelled) setCalcLoading(false);
      }
    }, DEVPACK_CALC_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [users, devPack, info, calculateDevPack]);

  if (!info) return null;

  const currency = info.wallet?.currency ?? "USD";
  const availableCredits = info.wallet?.availableCredits ?? 0;
  const pricePerUser = info.prices?.pricePerUser ?? 0;
  const devPackPrice = info.prices?.devPackPrice ?? 0;

  const currentUsers = info.deactivated
    ? 0
    : (info.tenant.payment?.quantity ?? 0);
  const currentDevPack = info.devPackEnabled ?? false;

  const isEditActive = isDocsConnectPaid(info) && currentUsers > 0;

  const onToggleDevPack = () => {
    setDevPack((prev) => {
      const next = !prev;
      if (next && users < DEVPACK_MIN_USERS) setUsers(DEVPACK_MIN_USERS);
      if (!next && isEditActive) setUsers(currentUsers);
      return next;
    });
  };

  const devPackPerUser = devPack ? devPackPrice : 0;
  const perUser = pricePerUser + devPackPerUser;
  const totalMonthly = users * perUser;

  const usersChanged = users !== currentUsers;
  const devPackChanged = devPack !== currentDevPack;
  const hasChanges = usersChanged || devPackChanged;
  const devPackTurnedOff = isEditActive && currentDevPack && !devPack;
  const isScheduled =
    isEditActive &&
    (devPackTurnedOff || (!devPackChanged && users < currentUsers));
  const isUpgrade = isEditActive && hasChanges && !isScheduled;
  const isDevPackUpgrade = isEditActive && devPack && !currentDevPack;

  const minUsers = isDevPackUpgrade
    ? Math.max(currentUsers, DEVPACK_MIN_USERS)
    : devPack
      ? DEVPACK_MIN_USERS
      : MIN_USERS;

  const periodEndDate = info.tenant.endDate ?? "";
  const periodEndDateLocalized = formatDateLocalized(
    periodEndDate,
    "DATE_MED",
    { locale: i18n.language },
  );
  const nextBillingDateLocalized = formatDateLocalized(
    getDocsConnectNextBillingDate(),
    "DATE_MED",
    { locale: i18n.language },
  );
  const remainingDays = getDocsConnectDaysLeft(periodEndDate);
  const periodDays = getDocsConnectPeriodDays(periodEndDate);
  const prorationFactor =
    periodDays > 0 ? Math.min(1, remainingDays / periodDays) : 0;

  const calcPending = isDevPackUpgrade && (calcLoading || devPackCalc === null);
  const devPackCharge = devPackCalc?.amount ?? 0;
  const unusedCredit = isDevPackUpgrade
    ? Math.max(0, Math.round((totalMonthly - devPackCharge) * 100) / 100)
    : 0;

  const addedUsers = Math.max(0, users - currentUsers);
  const chargeNow = isEditActive
    ? isDevPackUpgrade
      ? devPackCharge
      : isUpgrade
        ? Math.round(addedUsers * perUser * prorationFactor * 100) / 100
        : 0
    : users * perUser;

  const remainingCredits = availableCredits - chargeNow;
  const insufficientFunds = chargeNow > 0 && remainingCredits < 0;
  const topUpRequired = Math.ceil(chargeNow - availableCredits);

  const formatCurrency = (amount: number) =>
    formatCurrencyValue(i18n.language, amount, currency, 2);

  const priceLoader = (
    <Loader
      color=""
      size="16px"
      type={LoaderTypes.track}
      style={{ height: "16px" }}
    />
  );

  const fetchCardLinked = async (backUrl?: string, successUrl?: string) => {
    const res = await paymentApi.getCheckoutSetupUrl(
      { backUrl: backUrl ?? window.location.href },
      { params: { successUrl } } as never,
    );
    return res?.data?.response as string | undefined;
  };

  const onClose = () => {
    abortControllerRef.current?.abort();
    closeBuyPlan?.();
  };

  const onOpenWallet = () =>
    window.open(
      combineUrl(
        window.ClientConfig?.proxy?.url,
        config.homepage,
        PAYMENT_ROUTES.wallet,
      ),
      "_blank",
    );

  const onTopUpConfirm = async () => {
    await switchToDevPack?.({ quantity: users, topUp: 0 });
    toastr.success(t("DocsConnect:PlanPurchased"));
  };

  const onBuy = async () => {
    if (submitting) return;

    if (isDevPackUpgrade && insufficientFunds && isCardMissingOrInactive) {
      setTopUpDialogVisible(true);
      return;
    }

    const isStripePurchase =
      !isDevPackUpgrade && insufficientFunds && !!isCardMissingOrInactive;
    const controller = isStripePurchase ? new AbortController() : null;
    if (controller) abortControllerRef.current = controller;

    setSubmitting(true);
    if (isStripePurchase) setWaitingPayment(true);
    try {
      if (isDevPackUpgrade) {
        await switchToDevPack?.({
          quantity: users,
          topUp: insufficientFunds ? topUpRequired : 0,
        });
      } else if (controller) {
        const done = await buyPlanViaStripe?.({
          users,
          devPack,
          topUp: topUpRequired,
          totalMonthly,
          language: i18n.language,
          fetchCardLinked,
          signal: controller.signal,
        });
        if (!done) return;
      } else {
        await buyPlan?.({
          users,
          devPack,
          topUp: insufficientFunds ? topUpRequired : 0,
        });
      }
      toastr.success(
        isScheduled
          ? t("DocsConnect:ChangeScheduled")
          : t("DocsConnect:PlanPurchased"),
      );
    } catch (error) {
      if (!controller?.signal.aborted) toastr.error(error as Error);
    } finally {
      setWaitingPayment(false);
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
    <>
      <ModalDialog
        visible={visible}
        displayType={ModalDialogType.aside}
        onClose={onClose}
        withBodyScroll
        withFooterBorder
        isDoubleFooterLine={insufficientFunds || isDevPackUpgrade || isUpgrade}
      >
        <ModalDialog.Header>
          {isEditActive
            ? t("Common:EditSubscription")
            : t("DocsConnect:DocsConnect")}
        </ModalDialog.Header>
        <ModalDialog.Body>
          <div
            className={
              devPackTurnedOff
                ? `${styles.body} ${styles.bodyScheduled}`
                : styles.body
            }
          >
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
              <IconButton
                className={styles.walletOpenBilling}
                iconNode={<ExternalLinkSvg />}
                size={16}
                isFill
                isClickable
                onClick={onOpenWallet}
                title={t("Common:OpenPortalBilling")}
                dataTestId="open_wallet_button"
              />
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
                isDisabled={devPackTurnedOff}
                minusDisabled={isDevPackUpgrade}
                minusTooltipId={
                  isDevPackUpgrade ? USERS_MINUS_TOOLTIP_ID : undefined
                }
              />
              {isDevPackUpgrade ? (
                <Tooltip
                  id={USERS_MINUS_TOOLTIP_ID}
                  place="bottom"
                  maxWidth="320px"
                  getContent={() =>
                    t("DocsConnect:DevPackUserReductionTooltip")
                  }
                />
              ) : null}
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
                    {t("DocsConnect:PlusPerUserPerMonth", {
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

            {isEditActive && !hasChanges ? null : devPackTurnedOff ? (
              <div className={styles.scheduledNote}>
                <StorageWarning
                  body={t("DocsConnect:DevPackDisableScheduledNote", {
                    date: periodEndDateLocalized,
                    service: t("DocsConnect:DocsConnect"),
                  })}
                />
              </div>
            ) : (
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
                    isDevPackUpgrade ? (
                      <>
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
                        {summaryRow(
                          t("DocsConnect:BasePricePerUser"),
                          formatCurrency(pricePerUser),
                        )}
                        {summaryRow(
                          t("DocsConnect:DevPackPerUser"),
                          formatCurrency(devPackPrice),
                        )}
                        {summaryRow(
                          t("Common:NewMonthlyPrice"),
                          formatCurrency(totalMonthly),
                        )}
                        <div className={styles.summaryRow}>
                          <div className={styles.totalLabel}>
                            <Text
                              fontSize="14px"
                              fontWeight={400}
                              className={styles.summaryLabel}
                            >
                              {t("DocsConnect:UnusedSubscriptionCredit")}
                            </Text>
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
                            <HelpButton
                              size={12}
                              tooltipContent={t(
                                "DocsConnect:UnusedSubscriptionCreditTooltip",
                              )}
                              tooltipMaxWidth="320px"
                            />
                          </div>
                          {calcPending ? (
                            priceLoader
                          ) : (
                            <Text
                              fontSize="14px"
                              fontWeight={600}
                              className={styles.creditValue}
                            >
                              {t("DocsConnect:MinusAmount", {
                                amount: formatCurrency(unusedCredit),
                              })}
                            </Text>
                          )}
                        </div>
                        <hr className={styles.summaryDivider} />
                        <div className={styles.summaryRow}>
                          <Text
                            fontSize="14px"
                            fontWeight={600}
                            className={styles.summaryValue}
                          >
                            {t("Common:TotalDueToday")}
                          </Text>
                          {calcPending ? (
                            priceLoader
                          ) : (
                            <Text
                              fontSize="14px"
                              fontWeight={600}
                              className={styles.summaryValue}
                            >
                              {formatCurrency(chargeNow)}
                            </Text>
                          )}
                        </div>
                      </>
                    ) : (
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
                    )
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
                    className={`${styles.errorText} ${styles.summaryHint}`}
                    textAlign="right"
                  >
                    {t("Common:WalletTopUpRequired", {
                      currency: formatCurrency(topUpRequired),
                    })}
                  </Text>
                ) : (
                  <Text
                    fontSize="12px"
                    className={`${styles.secondaryText} ${styles.summaryHint}`}
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
            <Text
              fontSize="13px"
              fontWeight={400}
              className={styles.footerHint}
            >
              <Trans
                ns="DocsConnect"
                i18nKey="TopUpHint"
                values={{ amount: formatCurrency(topUpRequired) }}
                components={{ 1: <Text as="span" fontWeight={600} /> }}
              />
            </Text>
          ) : isDevPackUpgrade ? (
            <Text
              fontSize="13px"
              fontWeight={400}
              className={styles.footerHint}
            >
              <Trans
                ns="DocsConnect"
                i18nKey="BillingCycleRestartNote"
                values={{
                  amount: formatCurrency(totalMonthly),
                  date: nextBillingDateLocalized,
                }}
                components={{
                  1: <Text as="span" fontWeight={600} />,
                  2: <Text as="span" fontWeight={600} />,
                }}
              />
            </Text>
          ) : isUpgrade ? (
            <Text
              fontSize="13px"
              fontWeight={400}
              className={styles.footerHint}
            >
              <Trans
                ns="DocsConnect"
                i18nKey="NextMonthlyBillNote"
                values={{
                  amount: formatCurrency(totalMonthly),
                  date: nextBillingDateLocalized,
                }}
                components={{
                  1: <Text as="span" fontWeight={600} />,
                  2: <Text as="span" fontWeight={600} />,
                }}
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
                      : t("Common:Upgrade")
                  : insufficientFunds
                    ? info.deactivated
                      ? t("Common:TopUpAndPay")
                      : t("DocsConnect:TopUpAndBuy")
                    : t("Common:Upgrade")
              }
              onClick={onBuy}
              isLoading={submitting}
              isDisabled={
                submitting || calcPending || (isEditActive && !hasChanges)
              }
            />
            <Button
              scale
              size={ButtonSize.normal}
              label={t("Common:CancelButton")}
              onClick={onClose}
              isDisabled={submitting && !waitingPayment}
            />
          </div>
        </ModalDialog.Footer>
      </ModalDialog>
      {topUpDialogVisible ? (
        <ClientSimpleTopUpDialog
          visible={topUpDialogVisible}
          onClose={() => setTopUpDialogVisible(false)}
          onConfirm={onTopUpConfirm}
          language={i18n.language}
          service=""
          minValue={String(topUpRequired)}
        />
      ) : null}
    </>
  );
};

export default inject(
  ({ docsConnectStore, paymentStore, currentTariffStatusStore }: TStore) => ({
    visible: docsConnectStore.buyPlanPanelVisible,
    info: docsConnectStore.info,
    buyPlan: docsConnectStore.buyPlan,
    calculateDevPack: docsConnectStore.calculateDevPack,
    switchToDevPack: docsConnectStore.switchToDevPack,
    buyPlanViaStripe: docsConnectStore.buyPlanViaStripe,
    isCardMissingOrInactive: paymentStore.isCardMissingOrInactive,
    fetchPayerInfo: currentTariffStatusStore.fetchPayerInfo,
    fetchWalletBalance: paymentStore.fetchWalletBalance,
    closeBuyPlan: docsConnectStore.closeBuyPlan,
  }),
)(observer(BuyPlanPanel));
