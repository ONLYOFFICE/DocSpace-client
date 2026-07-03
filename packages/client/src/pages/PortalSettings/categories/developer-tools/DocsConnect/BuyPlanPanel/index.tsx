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
import QuantityPicker from "@docspace/ui-kit/components/quantity-picker";

import WalletSvg from "PUBLIC_DIR/images/icons/16/wallet.react.svg";
import AutomationApiSvg from "PUBLIC_DIR/images/icons/16/docs-connect.automation-api.react.svg";
import RebrandingSvg from "PUBLIC_DIR/images/icons/16/docs-connect.rebranding.react.svg";

import { formatCurrencyValue } from "@docspace/shared/utils/common";
import type { TDocsConnectInfo } from "@docspace/shared/api/docs-connect/types";

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
  const totalMonthly = users * (pricePerUser + devPackPerUser);

  const currentUsers = info.deactivated
    ? 0
    : (info.tenant.payment?.quantity ?? 0);
  const sameProduct = devPack === (info.devPackEnabled ?? false);
  const addedUsers = sameProduct ? Math.max(0, users - currentUsers) : users;
  const chargeNow = addedUsers * (pricePerUser + devPackPerUser);

  const remainingCredits = availableCredits - chargeNow;
  const insufficientFunds = remainingCredits < 0;
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
      toastr.success(t("DocsConnect:PlanPurchased"));
    } catch (error) {
      toastr.error(error as Error);
    } finally {
      setSubmitting(false);
    }
  };

  const summaryRow = (label: string, value: string) => (
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
      <ModalDialog.Header>{t("DocsConnect:DocsConnect")}</ModalDialog.Header>
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
                  })}
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

          <Text
            fontSize="16px"
            fontWeight={700}
            className={styles.orderSummaryTitle}
          >
            {t("Common:OrderSummary")}
          </Text>
          <div className={styles.summaryCard}>
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
          </div>
          {insufficientFunds ? (
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
              {t("DocsConnect:RemainingCreditsAfter", {
                amount: formatCurrency(remainingCredits),
              })}
            </Text>
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
              insufficientFunds
                ? info.deactivated
                  ? t("Common:TopUpAndPay")
                  : t("DocsConnect:TopUpAndBuy")
                : t("DocsConnect:BuyAPlan")
            }
            onClick={onBuy}
            isLoading={submitting}
            isDisabled={submitting}
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
