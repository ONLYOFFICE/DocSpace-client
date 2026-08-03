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

import React from "react";
import { ReactSVG } from "react-svg";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import LifetimeLicenseReactSvgUrl from "PUBLIC_DIR/images/lifetime_license.react.svg?url";
import TechSupportReactSvgUrl from "PUBLIC_DIR/images/tech_support.react.svg?url";
import MobileEditingReactSvgUrl from "PUBLIC_DIR/images/mobile_editing.react.svg?url";
import ScalabilityReactSvgUrl from "PUBLIC_DIR/images/scalability.react.svg?url";
import RegularUpdatesReactSvgUrl from "PUBLIC_DIR/images/regular_updates.react.svg?url";
import CustomizationReactSvgUrl from "PUBLIC_DIR/images/customization_updates.react.svg?url";

import { Text } from "@docspace/ui-kit/components/text";

import styles from "./BenefitsContainer.module.scss";
import type { TBenefitsContainerProps } from "./BenefitsContainer.types";

export const BenefitsContainer = ({
  isTrial,
  isEnterprise,
  isDeveloper,
  isLifetimeLicense,
}: TBenefitsContainerProps) => {
  const { t } = useTranslation(["Common", "Settings"]);

  const title = isEnterprise
    ? t("ActivateToProBannerHeaderTrial", {
        license: isDeveloper
          ? t("Common:DeveloperLicense")
          : t("Common:EnterpriseLicense"),
      })
    : t("UpgradeToProBannerHeader");

  const features = () => {
    const getFeatures = () => {
      if (isLifetimeLicense && !isTrial) return [regularUpdates, techSupport];

      if (isTrial)
        return [
          scalabilityClustering,
          mobileEditing,
          lifetimeLicense,
          techSupport,
        ];

      if (isEnterprise) {
        if (isDeveloper)
          return [customization, mobileEditing, regularUpdates, techSupport];

        return [
          scalabilityClustering,
          mobileEditing,
          regularUpdates,
          techSupport,
        ];
      }

      return [scalabilityClustering, mobileEditing, techSupport];
    };

    const techSupport = {
      imag: TechSupportReactSvgUrl,
      title: t("UpgradeToProBannerItemSupportHeader"),
      description: t("UpgradeToProBannerItemSupportDescr"),
    };

    const mobileEditing = {
      imag: MobileEditingReactSvgUrl,
      title: t("UpgradeToProBannerItemMobileHeader"),
      description: t("UpgradeToProBannerItemMobileDescr"),
    };

    const lifetimeLicense = {
      imag: LifetimeLicenseReactSvgUrl,
      title: t("UpgradeToProBannerItemLicenseHeader"),
      description: t("UpgradeToProBannerItemLicenseDescr"),
    };

    const scalabilityClustering = {
      imag: ScalabilityReactSvgUrl,
      title: t("UpgradeToProBannerItemScalabilityHeader"),
      description: t("UpgradeToProBannerItemScalabilityDescr"),
    };

    const regularUpdates = {
      imag: RegularUpdatesReactSvgUrl,
      title: t("RegularUpdates"),
      description: t("RegularUpdatesDescription"),
    };

    const customization = {
      imag: CustomizationReactSvgUrl,
      title: t("Settings:Customization"),
      description: t("ProvideBrandedExperience"),
    };

    const featuresArray = getFeatures();

    return featuresArray.map((item) => {
      return (
        <div
          className={classNames(styles.paymentsBenefits, "payments-benefits")}
          key={item.title}
        >
          <ReactSVG
            src={item.imag}
            className={classNames(styles.benefitsSvg, "benefits-svg")}
          />
          <div
            className={classNames(
              styles.benefitsDescription,
              "benefits-description",
            )}
          >
            <Text fontWeight={600}>{item.title}</Text>
            <Text fontSize="12px">{item.description}</Text>
          </div>
        </div>
      );
    });
  };

  return (
    <div className={classNames(styles.benefitsContainer, "benefits-container")}>
      <Text
        fontSize="16px"
        fontWeight={600}
        className={classNames(styles.benefitsTitle, "benefits-title")}
      >
        {title}
      </Text>
      {features()}
    </div>
  );
};
