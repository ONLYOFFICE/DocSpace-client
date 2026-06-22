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

import { useId } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { DeviceType } from "@docspace/shared/enums";
import { Text } from "@docspace/ui-kit/components/text";
import { Link, LinkTarget, LinkType } from "@docspace/ui-kit/components/link";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Tooltip } from "@docspace/ui-kit/components/tooltip";
import { CommonTrans } from "@docspace/ui-kit/utils/i18n/CommonTrans";

// 16px icons reused from the ui-kit icon set (matches AI services pages).
import AIIcon from "@docspace/ui-kit/assets/icons/16/AI.svg";
import PriceIcon from "@docspace/ui-kit/assets/icons/16/price.react.svg";
import WalletIcon from "@docspace/ui-kit/assets/icons/16/wallet.react.svg";

import { AI_ENUM, AI_TOOLS } from "@docspace/ui-kit/billing/constants";

import InfoIcon from "PUBLIC_DIR/images/info.react.svg";
import EnabledIcon from "PUBLIC_DIR/images/tick.rounded.svg";

import config from "PACKAGE_FILE";

import styles from "./AIFeaturesBanner.module.scss";

const ALL_SERVICES_ROUTE = "/portal-settings/payments/services";
const AI_SERVICES_ROUTE = "/portal-settings/payments/services/ai-services";
const OPENROUTER_PRICING_URL = "https://openrouter.ai/models";

const AIFeaturesBanner = ({
  currentDeviceType,
  isAiToolsServiceOn,
  isCardLinkedToPortal,
}) => {
  const { t } = useTranslation(["Common"]);
  const navigate = useNavigate();
  const tooltipId = useId();

  const isMobile = currentDeviceType === DeviceType.mobile;
  const isEnabled = !!isAiToolsServiceOn;

  const onActivate = () => {
    let route = AI_SERVICES_ROUTE;

    if (!isEnabled) {
      route = isCardLinkedToPortal
        ? `${AI_SERVICES_ROUTE}?activate=${AI_TOOLS}`
        : `${ALL_SERVICES_ROUTE}?actionType=${AI_ENUM}`;
    }

    navigate(
      combineUrl(window.ClientConfig?.proxy?.url, config.homepage, route),
    );
  };

  const openRouterPricingNote = (
    <Text as="div" fontSize="12px" fontWeight={600}>
      <CommonTrans
        i18nKey="AIOpenRouterPricingNote"
        namespaces={["Common"]}
        components={{
          1: (
            <Link
              type={LinkType.page}
              href={OPENROUTER_PRICING_URL}
              target={LinkTarget.blank}
              color="accent"
              fontSize="12px"
              isHovered
              fontWeight={600}
            />
          ),
        }}
      />
    </Text>
  );

  const features = (
    <div className={styles.features}>
      {isEnabled ? (
        <div className={styles.featureRow}>{openRouterPricingNote}</div>
      ) : (
        <>
          <div className={styles.featureRow}>
            <AIIcon className={styles.payIcon} />
            <Text fontSize="12px" fontWeight={600}>
              {t("Common:AIModelsWebSearchKnowledgeBase")}
            </Text>
          </div>
          <div className={styles.featureRow}>
            <PriceIcon />
            {openRouterPricingNote}
          </div>
          <div className={styles.featureRow}>
            <WalletIcon className={styles.payIcon} />
            <Text fontSize="12px" fontWeight={600}>
              {t("Common:PayAsYouGoFromWallet")}
            </Text>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className={styles.banner}>
      <div className={styles.textBlock}>
        <div className={styles.title}>
          {isEnabled ? <EnabledIcon className={styles.enabledIcon} /> : null}
          <Text fontSize="13px" fontWeight={600}>
            {isEnabled
              ? t("Common:AIFeaturesEnabled")
              : t("Common:ActivateAIFeaturesToGetStarted")}
          </Text>
          {isMobile && isEnabled ? (
            <InfoIcon className={styles.infoIcon} data-tooltip-id={tooltipId} />
          ) : null}
        </div>
        <Text as="div" fontSize="12px" className={styles.descriptionText}>
          {isEnabled
            ? t("Common:AIFeaturesEnabledDescription")
            : t("Common:GetAccessToAIModels")}
          {isMobile && !isEnabled ? (
            <InfoIcon className={styles.infoIcon} data-tooltip-id={tooltipId} />
          ) : null}
        </Text>

        {isMobile ? null : features}
      </div>

      <Button
        className={styles.button}
        primary={!isEnabled}
        size={ButtonSize.small}
        label={isEnabled ? t("Common:Details") : t("Common:ActivateAIFeatures")}
        onClick={onActivate}
        scale={isMobile}
      />

      {isMobile ? (
        <Tooltip
          id={tooltipId}
          place="bottom"
          openOnClick
          clickable
          getContent={() => features}
        />
      ) : null}
    </div>
  );
};

export default AIFeaturesBanner;

