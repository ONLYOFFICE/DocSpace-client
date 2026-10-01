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

import AIReactSvgUrl from "PUBLIC_DIR/images/icons/16/AI.svg?url";
import MobileEditingReactSvgUrl from "PUBLIC_DIR/images/icons/16/upgrade.mobile-editing.react.svg?url";
import ScalabilityReactSvgUrl from "PUBLIC_DIR/images/icons/16/upgrade.scalability.react.svg?url";
import TechSupportReactSvgUrl from "PUBLIC_DIR/images/icons/16/upgrade.tech-support.react.svg?url";
import WhiteLabelingReactSvgUrl from "PUBLIC_DIR/images/icons/16/upgrade.white-labeling.react.svg?url";
import AutomationApiReactSvgUrl from "PUBLIC_DIR/images/icons/16/upgrade.automation-api.react.svg?url";
import ApiIntegrationReactSvgUrl from "PUBLIC_DIR/images/icons/16/upgrade.api-integration.react.svg?url";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { Link, LinkTarget } from "@docspace/ui-kit/components/link";

import { getBrandName } from "../../constants/brands";
import {
  type TEnterpriseFeatureId,
  useEnterpriseFeatures,
} from "../../pages/Payments/common/useEnterpriseFeatures";
import { UpgradeNote } from "../../pages/Payments/common/UpgradeNote";

import type { UpgradePathDialogProps } from "./UpgradePathDialog.types";
import styles from "./UpgradePathDialog.module.scss";

const ENTERPRISE_FEATURE_ICONS: Record<TEnterpriseFeatureId, string> = {
  aiTools: AIReactSvgUrl,
  mobileEditing: MobileEditingReactSvgUrl,
  scalability: ScalabilityReactSvgUrl,
  techSupport: TechSupportReactSvgUrl,
};

type TFeature = {
  id: string;
  icon: string;
  title: string;
  description: string;
};

type TSolution = {
  id: "enterprise" | "developer";
  name: string;
  description: string;
  features: TFeature[];
  onStartTrial?: () => void;
};

export const UpgradePathDialog = ({
  visible,
  onClose,
  demoOrderUrl,
  feedbackAndSupportUrl,
  salesEmail,
  onStartEnterpriseTrial,
  onStartDeveloperTrial,
}: UpgradePathDialogProps) => {
  const { t } = useTranslation(["Common"]);
  const enterpriseFeatures = useEnterpriseFeatures();

  const productName = getBrandName("ProductEditorsName");
  const enterprise = t("Common:EnterpriseLicense");
  const developer = t("Common:DeveloperLicense");

  const solutions: TSolution[] = [
    {
      id: "enterprise",
      name: t("Common:UpgradeSolutionName", {
        productName,
        license: enterprise,
      }),
      description: t("Common:UpgradeEnterpriseDescription"),
      onStartTrial: onStartEnterpriseTrial,
      features: enterpriseFeatures.map((feature) => ({
        ...feature,
        icon: ENTERPRISE_FEATURE_ICONS[feature.id],
      })),
    },
    {
      id: "developer",
      name: t("Common:UpgradeSolutionName", {
        productName,
        license: developer,
      }),
      description: t("Common:UpgradeDeveloperDescription"),
      onStartTrial: onStartDeveloperTrial,
      features: [
        {
          id: "fullFeatureSet",
          icon: AIReactSvgUrl,
          title: t("Common:UpgradeFullFeatureSetTitle", {
            license: enterprise,
          }),
          description: t("Common:UpgradeFullFeatureSetDescription"),
        },
        {
          id: "whiteLabeling",
          icon: WhiteLabelingReactSvgUrl,
          title: t("Common:UpgradeWhiteLabelingTitle"),
          description: t("Common:UpgradeWhiteLabelingDescription"),
        },
        {
          id: "automationApi",
          icon: AutomationApiReactSvgUrl,
          title: t("Common:UpgradeAutomationApiTitle"),
          description: t("Common:UpgradeAutomationApiDescription"),
        },
        {
          id: "apiIntegration",
          icon: ApiIntegrationReactSvgUrl,
          title: t("Common:UpgradeApiIntegrationTitle"),
          description: t("Common:UpgradeApiIntegrationDescription"),
        },
      ],
    },
  ];

  const links = [
    {
      id: "demo",
      href: demoOrderUrl,
      label: t("Common:UpgradeRequestFreeDemoLink"),
    },
    {
      id: "support",
      href: feedbackAndSupportUrl,
      label: t("Common:UpgradeGetTechAssistanceLink"),
    },
    {
      id: "purchase",
      href: salesEmail ? `mailto:${salesEmail}` : "",
      label: t("Common:UpgradeAskPurchaseQuestionsLink"),
    },
  ].filter((link) => link.href);

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.modal}
      className={styles.upgradePathDialog}
      autoMaxHeight
      withFooterBorder
      dataTestId="upgrade-path-dialog"
    >
      <ModalDialog.Header>{t("Common:UpgradeChoosePathTitle")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.summary}>
          <Text fontSize="16px" fontWeight={700} lineHeight="22px">
            {t("Common:UpgradeBothSolutionsInclude")}
          </Text>
          <Text fontSize="13px" lineHeight="20px">
            {t("Common:UpgradePickSolution")}
          </Text>
        </div>

        <div className={styles.solutions}>
          {solutions.map((solution) => (
            <div
              key={solution.id}
              className={classNames(styles.solution, styles[solution.id])}
              data-testid={`upgrade-path-${solution.id}`}
            >
              <Text fontSize="16px" fontWeight={700} lineHeight="22px">
                {solution.name}
              </Text>
              <Text
                fontSize="13px"
                lineHeight="20px"
                className={styles.description}
              >
                {solution.description}
              </Text>

              <div className={styles.features}>
                {solution.features.map((feature) => (
                  <div key={feature.id} className={styles.feature}>
                    <ReactSVG src={feature.icon} className={styles.icon} />
                    <div className={styles.featureText}>
                      <Text fontSize="13px" fontWeight={600} lineHeight="20px">
                        {feature.title}
                      </Text>
                      <Text
                        fontSize="13px"
                        lineHeight="20px"
                        className={styles.description}
                      >
                        {feature.description}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                primary
                scale
                size={ButtonSize.small}
                className={styles.trialButton}
                label={t("Common:UpgradeStartTrial")}
                isDisabled={!solution.onStartTrial}
                onClick={solution.onStartTrial}
                testId={`upgrade-path-${solution.id}-trial`}
              />
            </div>
          ))}
        </div>

        <UpgradeNote
          title={t("Common:UpgradeEditorsUnavailableNote")}
          text={t("Common:UpgradeBackupRecommendation")}
          className={styles.note}
        />
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <div className={styles.links}>
          {links.map((link, index) => (
            <React.Fragment key={link.id}>
              {index > 0 ? (
                <Text as="span" fontSize="13px" fontWeight={600}>
                  /
                </Text>
              ) : null}
              <Link
                tag="a"
                href={link.href}
                target={LinkTarget.blank}
                color="accent"
                fontSize="13px"
                fontWeight={600}
                textDecoration="underline"
                dataTestId={`upgrade-path-${link.id}-link`}
              >
                {link.label}
              </Link>
            </React.Fragment>
          ))}
        </div>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default UpgradePathDialog;
