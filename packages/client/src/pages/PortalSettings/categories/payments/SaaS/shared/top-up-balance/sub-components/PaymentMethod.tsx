// (c) Copyright Ascensio System SIA 2009-2026
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

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { toAbsoluteUrl } from "../../../../utils/index";
import classNames from "classnames";
import { inject, observer } from "mobx-react";

import { Link } from "@docspace/ui-kit/components/link";
import { Text } from "@docspace/ui-kit/components/text";
import { toastr } from "@docspace/ui-kit/components/toast";

import { AddButton } from "@docspace/ui-kit/components/add-button";

import styles from "../styles/PaymentMethod.module.scss";
import { CardInformation } from "../../card-information";

type PaymentMethodProps = {
  confirmActionType?: string | null;
  fetchCardLinked?: (url: string) => void;
  walletCustomerEmail: string;
  cardLinked: string;
  accountLink: string;
  isDisabled: boolean;
  walletCustomerStatusNotActive: boolean;
  reccomendedAmount?: string;
  amount?: string;
};

const PaymentMethod = (props: PaymentMethodProps) => {
  const {
    walletCustomerEmail,
    cardLinked,
    accountLink,
    isDisabled,
    walletCustomerStatusNotActive,
    confirmActionType,
    fetchCardLinked,
    reccomendedAmount,
    amount,
  } = props;

  const { t } = useTranslation(["Payments", "Common"]);

  const [isLoading, setIsLoading] = useState(!walletCustomerEmail);

  const updateCardLink = async () => {
    if (walletCustomerEmail) return;

    const basicUrl = `${window.location.href}?complete=true&actionType=${confirmActionType ?? ""}`;
    let url = basicUrl;

    if (reccomendedAmount && amount) {
      url = `${basicUrl}&amount=${amount}&recommendedAmount=${reccomendedAmount}`;
    }

    try {
      await fetchCardLinked!(url);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    updateCardLink();
  }, []);

  const goLinkCard = () => {
    cardLinked
      ? window.open(toAbsoluteUrl(cardLinked), "_self")
      : toastr.error(t("Common:UnexpectedError"));
  };

  const goStripeAccount = () => {
    accountLink
      ? window.open(toAbsoluteUrl(accountLink), "_blank")
      : toastr.error(t("Common:UnexpectedError"));
  };

  return (
    <div className={styles.addPaymentMethod}>
      <div className={styles.paymentMethodDescription}>
        <div className={styles.paymentMethodTitle}>
          <Text isBold fontSize="16px">
            {t("PaymentMethod")}
          </Text>
          {walletCustomerEmail ? (
            <Link
              fontWeight={600}
              onClick={
                isDisabled || isLoading
                  ? undefined
                  : walletCustomerStatusNotActive
                    ? goLinkCard
                    : goStripeAccount
              }
              textDecoration="underline"
              dataTestId="payment_method_link"
              className={classNames({
                [styles.disabledLink]: isDisabled || isLoading,
              })}
            >
              {walletCustomerStatusNotActive
                ? t("AddPaymentMethod")
                : t("GoToStripe")}
            </Link>
          ) : null}
        </div>

        {!walletCustomerEmail ? (
          <Text fontSize="12px" className={styles.noPayment}>
            {t("YouHaveNotAddedAnyPayment")}
          </Text>
        ) : null}
      </div>
      {walletCustomerEmail ? (
        <CardInformation scale withoutMargin />
      ) : (
        <div className={styles.addPaymentMethodContainer}>
          <AddButton
            testId="payment_method_add_button"
            isLoading={isLoading}
            isDisabled={isLoading}
            label={t("AddPaymentMethod")}
            onClick={goLinkCard}
          />
        </div>
      )}
    </div>
  );
};

export default inject(({ paymentStore, servicesStore }: TStore) => {
  const { fetchCardLinked } = paymentStore;
  const { confirmActionType } = servicesStore;
  return { confirmActionType, fetchCardLinked };
})(observer(PaymentMethod));

