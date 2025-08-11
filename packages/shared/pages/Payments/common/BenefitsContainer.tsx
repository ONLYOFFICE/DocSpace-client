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
import { ReactSVG } from "react-svg";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import LifetimeLicenseReactSvgUrl from "PUBLIC_DIR/images/lifetime_license.react.svg?url";
import TechSupportReactSvgUrl from "PUBLIC_DIR/images/tech_support.react.svg?url";
import MobileEditingReactSvgUrl from "PUBLIC_DIR/images/mobile_editing.react.svg?url";
import ScalabilityReactSvgUrl from "PUBLIC_DIR/images/scalability.react.svg?url";
import { Text } from "../../../components/text";

import styles from "./BenefitsContainer.module.scss";
import type { TBenefitsContainerProps } from "./BenefitsContainer.types";

export const BenefitsContainer = ({
  isTrial,
  isEnterprise,
  isDeveloper,
}: TBenefitsContainerProps) => {
  const { t } = useTranslation("Common");

  const title = isEnterprise
    ? t("ActivateToProBannerHeaderTrial", {
        license: isDeveloper
          ? t("Common:DeveloperLicense")
          : t("Common:EnterpriseLicense"),
      })
    : t("UpgradeToProBannerHeader");

  const features = () => {
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

    const featuresArray = [];

    if (isEnterprise) {
      if (isTrial) {
        featuresArray.push(
          scalabilityClustering,
          mobileEditing,
          lifetimeLicense,
          techSupport,
        );
      } else {
        featuresArray.push(lifetimeLicense, techSupport);
      }
    } else {
      featuresArray.push(scalabilityClustering, mobileEditing, techSupport);
    }

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
