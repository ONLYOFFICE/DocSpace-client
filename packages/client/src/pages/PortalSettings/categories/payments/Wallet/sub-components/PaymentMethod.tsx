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

import { useTranslation } from "react-i18next";

import { Link } from "@docspace/shared/components/link";
import { Text } from "@docspace/shared/components/text";
import { toastr } from "@docspace/shared/components/toast";

import CheckReactSvg from "PUBLIC_DIR/images/check.edit.react.svg";

import "../styles/PaymentMethod.scss";
import { SelectorAddButton } from "@docspace/shared/components/selector-add-button";

type PaymentMethodProps = {
  walletCustomerEmail: boolean;
  cardLinked: string;
  accountLink: string;
};

const PaymentMethod = ({
  walletCustomerEmail,
  cardLinked,
  accountLink,
}: PaymentMethodProps) => {
  const { t } = useTranslation("Payments");

  const goLinkCard = () => {
    cardLinked
      ? window.open(cardLinked, "_blank")
      : toastr.error(t("ErrorNotification"));
  };

  const goStripeAccount = () => {
    accountLink
      ? window.open(accountLink, "_blank")
      : toastr.error(t("ErrorNotification"));
  };

  return (
    <div className="add-payment-method">
      <div className="payment-method-description">
        <Text isBold fontSize="16px">
          {t("PaymentMethod")}
        </Text>
        {!walletCustomerEmail ? (
          <Text fontSize="12px" className="no-payment">
            {t("YouHaveNotAddedAnyPayment")}
          </Text>
        ) : null}
      </div>
      {walletCustomerEmail ? (
        <div className="card-linked">
          <div className="ticked-wrapper">
            <CheckReactSvg />
            <Text fontWeight={600} fontSize="14px">
              {t("CardLinked")}
            </Text>
          </div>
          <Link fontWeight={600} onClick={goStripeAccount}>
            {t("GoToStripe")}
          </Link>
        </div>
      ) : (
        <div className="add-payment-method-container" onClick={goLinkCard}>
          <SelectorAddButton
            className="selector-add-button"
            onClick={goLinkCard}
          />
          <Text className="add-payment-text" fontWeight={600}>
            {t("AddPaymentMethod")}
          </Text>
        </div>
      )}
    </div>
  );
};

export default PaymentMethod;
