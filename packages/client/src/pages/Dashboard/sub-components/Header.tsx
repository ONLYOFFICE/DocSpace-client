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

import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { Text } from "@docspace/ui-kit/components/text";
import { Link, LinkType } from "@docspace/ui-kit/components/link";

import styles from "../Dashboard.module.scss";

type HeaderProps = {
  planTitle?: string;
  isFreeTariff?: boolean;
  paymentDate?: string;
  isAdminOrOwner?: boolean;
};

const Header = ({
  planTitle = "",
  isFreeTariff = true,
  paymentDate = "",
  isAdminOrOwner = false,
}: HeaderProps) => {
  const { t } = useTranslation(["Common"]);
  const navigate = useNavigate();

  return (
    <header className={styles.planHeader}>
      <Text as="h1" className={styles.planTitle} isBold>
        {t("Common:BusinessTitle", {
          planName: isFreeTariff
            ? t("Common:StartupPlan")
            : t("Common:BusinessPlan"),
        })}
      </Text>
      {isAdminOrOwner ? (
        <div className={styles.planSubline}>
          {!isFreeTariff && paymentDate ? (
            <Text as="span" className={styles.planSublineText}>
              {t("Common:SubscriptionAutoRenewedOn", {
                finalDate: paymentDate,
              })}
            </Text>
          ) : null}
          <Link
            className={styles.planLink}
            type={LinkType.action}
            onClick={() =>
              navigate("/portal-settings/payments/portal-payments")
            }
            isHovered
          >
            {isFreeTariff
              ? t("Common:ActivatePremiumFeatures")
              : t("Common:CustomizeYourPlan", {
                  plan: t("Common:BusinessPlan"),
                })}
          </Link>
        </div>
      ) : null}
    </header>
  );
};

const HeaderConnected = inject<TStore>(
  ({ userStore, currentQuotaStore, currentTariffStatusStore }) => ({
    planTitle: currentQuotaStore.currentTariffPlanTitle,
    isFreeTariff: currentQuotaStore.isFreeTariff,
    paymentDate: currentTariffStatusStore.paymentDate,
    isAdminOrOwner:
      (userStore.user?.isAdmin ?? false) || (userStore.user?.isOwner ?? false),
  }),
)(observer(Header));

export { HeaderConnected as Header };

export default HeaderConnected;

