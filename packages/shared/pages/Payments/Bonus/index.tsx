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

import InfoOutlineReactSvgUrl from "PUBLIC_DIR/images/info.outline.react.svg?url";

import { Text } from "@docspace/ui-kit/components/text";
import { PaymentsStandaloneLoader } from "../../../skeletons/payments";

import { EnterpriseFeatures } from "./sub-components/EnterpriseFeatures";
import { OfficialDocumentation } from "./sub-components/OfficialDocumentation";
import { HelpLinks } from "./sub-components/HelpLinks";

import { IBonusProps } from "./Bonus.types";
import styles from "./Bonus.module.scss";

export const Bonus = ({
  salesEmail,
  logoText,
  enterpriseInstallScriptUrl,
  enterpriseInstallWindowsUrl,
  forEnterprisesUrl,
  demoOrderUrl,
  feedbackAndSupportUrl,
}: IBonusProps) => {
  const { t, ready } = useTranslation("Common");

  if (!ready) return <PaymentsStandaloneLoader />;

  const license = t("Common:EnterpriseLicense");

  return (
    <div data-testid="bonus" className={styles.bonus}>
      <div className={styles.cards}>
        <EnterpriseFeatures license={license} />
        <OfficialDocumentation
          organizationName={logoText}
          license={license}
          enterpriseInstallScriptUrl={enterpriseInstallScriptUrl}
          enterpriseInstallWindowsUrl={enterpriseInstallWindowsUrl}
        />
      </div>

      <div className={styles.note} data-testid="bonus-upgrade-note">
        <div className={styles.noteHeader}>
          <ReactSVG src={InfoOutlineReactSvgUrl} className={styles.noteIcon} />
          <Text fontSize="13px" fontWeight={600} lineHeight="20px">
            {t("Common:UpgradeBeforeYouUpgrade")}
          </Text>
        </div>
        <Text fontSize="12px" lineHeight="16px">
          {t("Common:UpgradeNoteWithBackupRecommendation", {
            note: t("Common:UpgradeEditorsUnavailableNote"),
            backup: t("Common:UpgradeBackupRecommendation"),
          })}
        </Text>
      </div>

      <HelpLinks
        organizationName={logoText}
        license={license}
        salesEmail={salesEmail}
        forEnterprisesUrl={forEnterprisesUrl}
        demoOrderUrl={demoOrderUrl}
        feedbackAndSupportUrl={feedbackAndSupportUrl}
      />
    </div>
  );
};
