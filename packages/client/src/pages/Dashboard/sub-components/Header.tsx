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
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { getBrandName } from "@docspace/shared/constants/brands";

import QuestionReactSvgUrl from "PUBLIC_DIR/images/help.center.react.svg?url";

import { PAYMENT_ROUTES } from "SRC_DIR/pages/PortalSettings/categories/payments/utils";

import styles from "../Dashboard.module.scss";

const STANDALONE_PAYMENTS_ROUTE = "/portal-settings/payments/portal-payments";

type HeaderProps = {
  /** Opens the welcome modal, whose only offer is the dashboard tour. */
  onOpenTour?: () => void;
  isFreeTariff?: boolean;
  paymentDate?: string;
  isAdminOrOwner?: boolean;
  standalone?: boolean;
};

const Header = ({
  onOpenTour,
  isFreeTariff = true,
  paymentDate = "",
  isAdminOrOwner = false,
  standalone = false,
}: HeaderProps) => {
  const { t } = useTranslation(["Common"]);
  const navigate = useNavigate();

  const businessPlan = t("Common:BusinessPlan");

  const openPayments = () =>
    navigate(
      standalone ? STANDALONE_PAYMENTS_ROUTE : PAYMENT_ROUTES.portalPayments,
    );

  return (
    <header className={styles.planHeader}>
      <div className={styles.planHeaderText}>
        <Text className={styles.planTitle}>
          {t("Common:WelcomeToOrganization", {
            organizationName: getBrandName("OrganizationName"),
          })}
        </Text>

        {/* Only the plan line is billing-scoped: everyone gets the greeting,
            but a link into the payments settings is of no use to a user who
            cannot open them. */}
        {isAdminOrOwner ? (
          <div className={styles.planSubline}>
            <Text as="span" className={styles.planSublineText}>
              {/* Two sentences on a paid plan, but each key keeps its own
                  punctuation so the join isn't hardcoded to a period. */}
              {isFreeTariff
                ? t("Common:FreePlanDescription", {
                    planName: t("Common:StartupPlan"),
                  })
                : paymentDate
                  ? t("Common:PaidPlanDescription", {
                      planName: businessPlan,
                      finalDate: paymentDate,
                    })
                  : t("Common:BusinessTitle", { planName: businessPlan })}
            </Text>
            <Link
              className={styles.planLink}
              color="accent"
              type={LinkType.action}
              onClick={openPayments}
              isHovered
            >
              {isFreeTariff
                ? t("Common:UpgradeAndAddAddons", { planName: businessPlan })
                : t("Common:CustomizeYourPlan", { plan: businessPlan })}
            </Link>
          </div>
        ) : null}
      </div>

      {/* Pinned to the far edge of the header row, opposite the greeting. */}
      <IconButton
        className={styles.helpButton}
        iconName={QuestionReactSvgUrl}
        size={16}
        isClickable
        title={t("Common:WelcomeStartTour")}
        onClick={onOpenTour}
        dataTestId="dashboard-open-welcome"
      />
    </header>
  );
};

const HeaderConnected = inject<TStore>(
  ({
    userStore,
    currentQuotaStore,
    currentTariffStatusStore,
    settingsStore,
  }) => ({
    isFreeTariff: currentQuotaStore.isFreeTariff,
    paymentDate: currentTariffStatusStore.paymentDate,
    isAdminOrOwner:
      (userStore.user?.isAdmin ?? false) || (userStore.user?.isOwner ?? false),
    standalone: settingsStore.standalone,
  }),
)(observer(Header));

export { HeaderConnected as Header };

export default HeaderConnected;

