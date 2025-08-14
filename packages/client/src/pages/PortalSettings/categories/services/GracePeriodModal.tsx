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

import React from "react";
import { useTranslation, Trans } from "react-i18next";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { Text } from "@docspace/shared/components/text";
import { Button, ButtonSize } from "@docspace/shared/components/button";

type GracePeriodModalProps = {
  visible: boolean;
  onClose: () => void;
  tariffPlanTitle?: string;
  paymentDate?: string;
  gracePeriodEndDate?: string;
  delayDaysCount?: number;
};

const GracePeriodModal: React.FC<GracePeriodModalProps> = ({
  visible,
  onClose,
  tariffPlanTitle,
  paymentDate,
  gracePeriodEndDate,
  delayDaysCount,
}) => {
  const { t } = useTranslation(["Payments", "Common"]);
  const navigate = useNavigate();
  const onClick = () => {
    const paymentPageUrl = "/portal-settings/payments/portal-payments";

    navigate(paymentPageUrl);
  };

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.modal}
      autoMaxHeight
      isLarge
    >
      <ModalDialog.Header>{t("Common:Warning")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text fontWeight={600}>
          {t("ServiceManagementUnavailable", { planName: tariffPlanTitle })}
        </Text>
        <br />
        <Text fontWeight={600}>{t("Reminder")}</Text>
        <Text as="span" dataTestId="grace_period_info">
          <Trans
            i18nKey="GracePeriodActivatedInfo"
            ns="Payments"
            t={t}
            values={{
              fromDate: paymentDate,
              byDate: gracePeriodEndDate,
              delayDaysCount,
            }}
            components={{
              1: <Text as="span" />,
            }}
          />
        </Text>{" "}
        <Text as="span">
          {t("GracePeriodActivatedDescription", {
            productName: t("Common:ProductName"),
          })}
        </Text>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          key="OkButton"
          label={t("GoToPayments")}
          size={ButtonSize.normal}
          primary
          onClick={onClick}
          testId="grace_period_ok_button"
        />
        <Button
          key="CancelButton"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          onClick={onClose}
          testId="grace_period_cancel_button"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(
  ({ paymentQuotasStore, currentTariffStatusStore }: TStore) => {
    const { tariffPlanTitle } = paymentQuotasStore;

    const { paymentDate, gracePeriodEndDate, delayDaysCount } =
      currentTariffStatusStore;

    return {
      tariffPlanTitle,
      paymentDate,
      gracePeriodEndDate,
      delayDaysCount,
    };
  },
)(observer(GracePeriodModal));
