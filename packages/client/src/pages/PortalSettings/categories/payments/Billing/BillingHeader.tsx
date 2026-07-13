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

import { useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import { Heading } from "@docspace/ui-kit/components/heading";
import { IconButton } from "@docspace/ui-kit/components/icon-button";

import ArrowPathReactSvgUrl from "PUBLIC_DIR/images/arrow.path.react.svg?url";

import styles from "./BillingHeader.module.scss";

const getTitle = (pathname: string, t: (key: string) => string): string => {
  if (pathname.includes("/billing/wallet")) return t("Common:Wallet");
  if (pathname.includes("/billing/tariff-plan")) return t("Common:TariffPlan");
  if (pathname.includes("/billing/payment-method"))
    return t("Common:PaymentMethod");
  if (pathname.includes("/billing/usage")) return t("Common:Usage");
  if (pathname.includes("/billing/addons/ai-services"))
    return t("Common:AIServices");
  if (pathname.includes("/billing/addons/ai-search"))
    return t("Common:AISearch");
  if (pathname.includes("/billing/addons/backup")) return t("Common:Backup");
  if (pathname.includes("/billing/addons/disk-storage"))
    return t("Common:Storage");
  if (pathname.includes("/billing/addons")) return t("Common:Addons");
  return t("Common:Billing");
};

const isSubPage = (pathname: string): boolean => {
  const path = pathname.replace(/\/$/, "");
  const segments = path.split("/").filter(Boolean);
  // /billing/addons = 2 segments (top-level)
  // /billing/addons/ai-services = 3 segments (sub-page)
  return segments.length > 2;
};

const BillingHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation(["Common"]);

  const title = getTitle(location.pathname, t);
  const showBackButton = isSubPage(location.pathname);

  const onBackToParent = () => {
    navigate(-1);
  };

  return (
    <div className={styles.styledHeader}>
      {showBackButton ? (
        <IconButton
          iconName={ArrowPathReactSvgUrl}
          size={17}
          isFill
          onClick={onBackToParent}
          className="arrow-button"
          dataTestId="back_parent_icon_button"
        />
      ) : null}
      <Heading type="content" truncate>
        {title}
      </Heading>
    </div>
  );
};

export default BillingHeader;
