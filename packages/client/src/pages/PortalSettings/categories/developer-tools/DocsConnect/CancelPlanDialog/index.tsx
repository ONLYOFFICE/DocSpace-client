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
import { toastr } from "@docspace/ui-kit/components/toast";
import StorageWarning from "@docspace/ui-kit/billing/services/panels/additional-storage/StorageWarning";
import { formatDateLocalized } from "@docspace/ui-kit/utils/date";

import { formatCurrencyValue } from "@docspace/shared/utils/common";
import type { TDocsConnectInfo } from "@docspace/shared/api/docs-connect/types";

import styles from "./CancelPlanDialog.module.scss";

interface CancelPlanDialogProps {
  visible?: boolean;
  info?: TDocsConnectInfo;
  cancelPlan?: () => Promise<void>;
  closeCancelPlanDialog?: () => void;
}

const CancelPlanDialog = ({
  visible,
  info,
  cancelPlan,
  closeCancelPlanDialog,
}: CancelPlanDialogProps) => {
  const { t, i18n } = useTranslation(["DocsConnect", "Common"]);
  const [submitting, setSubmitting] = useState(false);

  if (!info) return null;

  const currency = info.wallet?.currency ?? "USD";
  const planUsers = info.tenant.payment?.quantity ?? 0;
  const pricePerUser =
    (info.prices?.pricePerUser ?? 0) +
    (info.devPackEnabled ? (info.prices?.devPackPrice ?? 0) : 0);
  const monthlyCharge = planUsers * pricePerUser;
  const periodEndDateLocalized = formatDateLocalized(
    info.tenant.endDate ?? "",
    "DATE_MED",
    { locale: i18n.language },
  );

  const onConfirm = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await cancelPlan?.();
      closeCancelPlanDialog?.();
    } catch (e) {
      toastr.error(e as Error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalDialog
      visible={visible}
      displayType={ModalDialogType.modal}
      onClose={() => closeCancelPlanDialog?.()}
      autoMaxHeight
    >
      <ModalDialog.Header>
        {t("DocsConnect:TariffPlanCancellation")}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.body}>
          <Text fontSize="13px">
            {t("DocsConnect:CancelPlanConfirm", {
              service: t("DocsConnect:DocsConnect"),
            })}
          </Text>
          <Text fontSize="13px" fontWeight={600}>
            {t("DocsConnect:YourCurrentPlanLabel")}{" "}
            {formatCurrencyValue(i18n.language, monthlyCharge, currency, 2)}{" "}
            <Text
              as="span"
              fontSize="13px"
              fontWeight={400}
              className={styles.muted}
            >
              ({t("DocsConnect:PlanUsers")}: {planUsers})
            </Text>
          </Text>
          <StorageWarning
            body={t("Common:ScheduledChangeBillingPeriodNote", {
              date: periodEndDateLocalized,
            })}
          />
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          primary
          scale
          size={ButtonSize.normal}
          label={t("Common:Yes")}
          onClick={onConfirm}
          isLoading={submitting}
          isDisabled={submitting}
        />
        <Button
          scale
          size={ButtonSize.normal}
          label={t("Common:No")}
          onClick={() => closeCancelPlanDialog?.()}
          isDisabled={submitting}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(({ docsConnectStore }: TStore) => ({
  visible: docsConnectStore.cancelPlanDialogVisible,
  info: docsConnectStore.info,
  cancelPlan: docsConnectStore.cancelPlan,
  closeCancelPlanDialog: docsConnectStore.closeCancelPlanDialog,
}))(observer(CancelPlanDialog));
