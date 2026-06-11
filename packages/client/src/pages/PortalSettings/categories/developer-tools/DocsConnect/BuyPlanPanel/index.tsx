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
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { ModalDialogType } from "@docspace/ui-kit/components/modal-dialog/ModalDialog.enums";
import { Text } from "@docspace/ui-kit/components/text";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { ToggleButton } from "@docspace/ui-kit/components/toggle-button";
import { toastr } from "@docspace/ui-kit/components/toast";
import QuantityPicker from "@docspace/ui-kit/components/quantity-picker";

import type { TDocsConnectInfo } from "@docspace/shared/api/docs-connect/types";

import styles from "./BuyPlanPanel.module.scss";

const MIN_USERS = 1;
const MAX_USERS = 999;

interface BuyPlanPanelProps {
  visible?: boolean;
  info?: TDocsConnectInfo;
  buyPlan?: (opts: { users: number; devPack: boolean }) => void;
  closeBuyPlan?: () => void;
}

const BuyPlanPanel = ({
  visible,
  info,
  buyPlan,
  closeBuyPlan,
}: BuyPlanPanelProps) => {
  const { t } = useTranslation(["DocsConnect", "Common"]);

  const [users, setUsers] = useState<number>(info?.plan.users ?? 50);
  const [devPack, setDevPack] = useState<boolean>(
    info?.plan.devPackEnabled ?? false,
  );

  if (!info) return null;

  const { wallet, plan } = info;
  const { currency } = wallet;

  const devPackPerUser = devPack ? plan.devPackPrice : 0;
  const totalMonthly = users * (plan.pricePerUser + devPackPerUser);
  const remainingCredits = wallet.availableCredits - totalMonthly;

  const onBuy = () => {
    buyPlan?.({ users, devPack });
    toastr.success(t("DocsConnect:PlanPurchased"));
  };

  const summaryRow = (label: string, value: string) => (
    <div className={styles.summaryRow}>
      <Text fontSize="13px" className={styles.muted}>
        {label}
      </Text>
      <Text fontSize="13px" fontWeight={600}>
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
    >
      <ModalDialog.Header>{t("DocsConnect:DocsConnect")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.body}>
          <div className={styles.walletCard}>
            <div className={styles.iconPlaceholder} aria-hidden />
            <div>
              <Text fontSize="14px" fontWeight={600}>
                {t("Common:Wallet")}
              </Text>
              <Text fontSize="13px" className={styles.muted}>
                {t("Common:AvailableCredits")}{" "}
                <Text
                  as="span"
                  fontSize="13px"
                  fontWeight={600}
                  className={styles.accent}
                >
                  {`${currency}${wallet.availableCredits.toFixed(2)}`}
                </Text>
              </Text>
            </div>
          </div>

          <Text fontSize="16px" fontWeight={600}>
            {t("DocsConnect:CalculateYourPlan")}
          </Text>

          <QuantityPicker
            value={users}
            minValue={MIN_USERS}
            maxValue={MAX_USERS}
            step={1}
            showSlider
            showPlusSign
            title={t("DocsConnect:NumberOfUsers")}
            subtitle={t("DocsConnect:PerUserPerMonth", {
              price: `${currency}${plan.pricePerUser.toFixed(2)}`,
            })}
            onChange={setUsers}
          />

          <div className={styles.devPackCard}>
            <div className={styles.devPackHeader}>
              <div>
                <Text fontSize="14px" fontWeight={600}>
                  {t("DocsConnect:DevPack")}{" "}
                  <Text as="span" fontSize="12px" className={styles.muted}>
                    {t("DocsConnect:OptionalAddOn")}
                  </Text>
                </Text>
                <Text fontSize="13px" className={styles.muted}>
                  {t("DocsConnect:PerUserPerMonth", {
                    price: `${currency}${plan.devPackPrice}`,
                  })}
                </Text>
              </div>
              <ToggleButton
                isChecked={devPack}
                onChange={() => setDevPack((prev) => !prev)}
              />
            </div>
            <div className={styles.devPackFeatures}>
              <div className={styles.devPackFeature}>
                <div className={styles.iconPlaceholderSmall} aria-hidden />
                <div>
                  <Text fontSize="13px" fontWeight={600}>
                    {t("DocsConnect:AutomationApi")}
                  </Text>
                  <Text fontSize="12px" className={styles.muted}>
                    {t("DocsConnect:AutomationApiDescription")}
                  </Text>
                </div>
              </div>
              <div className={styles.devPackFeature}>
                <div className={styles.iconPlaceholderSmall} aria-hidden />
                <div>
                  <Text fontSize="13px" fontWeight={600}>
                    {t("DocsConnect:Rebranding")}
                  </Text>
                  <Text fontSize="12px" className={styles.muted}>
                    {t("DocsConnect:RebrandingDescription")}
                  </Text>
                </div>
              </div>
            </div>
          </div>

          <Text fontSize="16px" fontWeight={600}>
            {t("Common:OrderSummary")}
          </Text>
          <div className={styles.summaryCard}>
            {summaryRow(t("DocsConnect:PlanUsers"), `${users}`)}
            {summaryRow(
              t("DocsConnect:BasePricePerUser"),
              `${currency}${plan.pricePerUser.toFixed(2)}`,
            )}
            {summaryRow(
              t("DocsConnect:DevPackPerUser"),
              `${currency}${(devPack ? plan.devPackPrice : 0).toFixed(2)}`,
            )}
            <hr className={styles.summaryDivider} />
            <div className={styles.summaryRow}>
              <Text fontSize="14px" fontWeight={700}>
                {t("DocsConnect:TotalMonthly")}
              </Text>
              <Text fontSize="14px" fontWeight={700}>
                {`${currency}${totalMonthly.toFixed(2)}`}
              </Text>
            </div>
          </div>
          <Text fontSize="12px" className={styles.muted} textAlign="right">
            {t("DocsConnect:RemainingCreditsAfter", {
              amount: `${currency}${remainingCredits.toFixed(2)}`,
            })}
          </Text>
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          primary
          scale
          size={ButtonSize.normal}
          label={t("DocsConnect:BuyAPlan")}
          onClick={onBuy}
        />
        <Button
          scale
          size={ButtonSize.normal}
          label={t("Common:CancelButton")}
          onClick={() => closeBuyPlan?.()}
        />
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
