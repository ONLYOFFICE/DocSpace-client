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

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import classNames from "classnames";
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
import WebSearchIcon from "@docspace/ui-kit/assets/icons/16/ai-feature-web-search.react.svg";

import { AI_SEARCH, AI_TOOLS } from "@docspace/ui-kit/billing/constants";

import InfoIcon from "PUBLIC_DIR/images/info.react.svg";
import EnabledIcon from "PUBLIC_DIR/images/tick.rounded.svg";

import config from "PACKAGE_FILE";

import { PAYMENT_ROUTES } from "SRC_DIR/pages/PortalSettings/categories/payments/utils";

import styles from "./AIFeaturesBanner.module.scss";

// Must match the .swapFade transition duration in the SCSS module.
const SWAP_FADE_MS = 200;

const OPENROUTER_PRICING_URL = "https://openrouter.ai/models";
const EXA_PRICING_URL = "https://exa.ai/pricing";

// FLIP the element's height when a content swap (key change) resizes it:
// content updates instantly, the box glides from the old height to the new.
const useAnimatedHeight = (ref, key) => {
  const heightRef = useRef(null);
  const keyRef = useRef(key);

  // The resting height changes without re-renders too (window resize after a
  // device switch re-wraps lines), so it is tracked with a ResizeObserver.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const observer = new ResizeObserver(() => {
      if (!el.style.height) heightRef.current = el.offsetHeight;
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, [ref]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || keyRef.current === key) return;
    keyRef.current = key;

    // Swap mid-animation starts from the current visual height.
    const prev = el.style.height
      ? el.getBoundingClientRect().height
      : heightRef.current;

    el.style.height = "";
    const next = el.offsetHeight;
    heightRef.current = next;

    if (prev === null || prev === next) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
      return;

    el.style.height = `${prev}px`;
    void el.offsetHeight;
    el.style.height = `${next}px`;

    el.addEventListener(
      "transitionend",
      () => {
        el.style.height = "";
      },
      { once: true },
    );
  });
};

const getBannerTexts = (t, isWebSearchTab) =>
  isWebSearchTab
    ? {
        activateTitle: t("Common:ActivateAISearchToGetStarted"),
        activateDescription: t("Common:ActivateAISearchDescription"),
        activateLabel: t("Common:ActivateAISearch"),
        enabledTitle: t("Common:AISearchEnabledTitle"),
        enabledDescription: t("Common:AISearchEnabledDescription"),
      }
    : {
        activateTitle: t("Common:ActivateAIFeaturesToGetStarted"),
        activateDescription: t("Common:GetAccessToAIModels"),
        activateLabel: t("Common:ActivateAIFeatures"),
        enabledTitle: t("Common:AIFeaturesEnabled"),
        enabledDescription: t("Common:AIFeaturesEnabledDescription"),
      };

const AIFeaturesBanner = ({
  currentDeviceType,
  isAiToolsServiceOn,
  isAiSearchServiceOn,
  isCardLinkedToPortal,
  isWebSearchTab,
}) => {
  const { t } = useTranslation(["Common"]);
  const navigate = useNavigate();
  const tooltipId = useId();

  const isMobile = currentDeviceType === DeviceType.mobile;
  const isEnabledTarget = isWebSearchTab
    ? !!isAiSearchServiceOn
    : !!isAiToolsServiceOn;

  // Displayed copy of the state: in-place flips (stale store refreshed on
  // back navigation) are swapped with a fade-through instead of a hard snap.
  const [isEnabled, setIsEnabled] = useState(isEnabledTarget);
  const [isSwapping, setIsSwapping] = useState(false);
  const [prevIsWebSearchTab, setPrevIsWebSearchTab] = useState(isWebSearchTab);

  // Tab switches sync during render (no fade, no intermediate frame).
  if (prevIsWebSearchTab !== isWebSearchTab) {
    setPrevIsWebSearchTab(isWebSearchTab);
    setIsEnabled(isEnabledTarget);
    setIsSwapping(false);
  }

  useEffect(() => {
    if (isEnabledTarget === isEnabled) {
      setIsSwapping(false);
      return undefined;
    }

    setIsSwapping(true);
    const timerId = setTimeout(() => {
      setIsEnabled(isEnabledTarget);
      setIsSwapping(false);
    }, SWAP_FADE_MS);

    return () => clearTimeout(timerId);
  }, [isEnabledTarget, isEnabled]);

  const bannerRef = useRef(null);
  useAnimatedHeight(bannerRef, `${isWebSearchTab}-${isEnabled}`);

  const {
    activateTitle,
    activateDescription,
    activateLabel,
    enabledTitle,
    enabledDescription,
  } = getBannerTexts(t, isWebSearchTab);

  const onActivate = () => {
    const serviceRoute = isWebSearchTab
      ? PAYMENT_ROUTES.aiSearch
      : PAYMENT_ROUTES.aiServices;
    const activateParam = isWebSearchTab ? AI_SEARCH : AI_TOOLS;

    let route = serviceRoute;

    if (!isEnabled) {
      route = isCardLinkedToPortal
        ? `${serviceRoute}?activate=${activateParam}`
        : PAYMENT_ROUTES.services;
    }

    navigate(
      combineUrl(window.ClientConfig?.proxy?.url, config.homepage, route),
    );
  };

  const pricingNote = (
    <Text as="div" fontSize="12px" fontWeight={600}>
      <CommonTrans
        i18nKey={
          isWebSearchTab ? "AIExaPricingNote" : "AIOpenRouterPricingNote"
        }
        namespaces={["Common"]}
        components={{
          1: (
            <Link
              type={LinkType.page}
              href={isWebSearchTab ? EXA_PRICING_URL : OPENROUTER_PRICING_URL}
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
        <div className={styles.featureRow}>{pricingNote}</div>
      ) : (
        <>
          {isWebSearchTab ? (
            <div className={styles.featureRow}>
              <WebSearchIcon className={styles.payIcon} />
              <Text fontSize="12px" fontWeight={600}>
                {t("Common:WebSearchAndCrawlingPoweredByExa")}
              </Text>
            </div>
          ) : (
            <div className={styles.featureRow}>
              <AIIcon className={styles.payIcon} />
              <Text fontSize="12px" fontWeight={600}>
                {t("Common:AIModelsWebSearchKnowledgeBase")}
              </Text>
            </div>
          )}
          <div className={styles.featureRow}>
            <PriceIcon />
            {pricingNote}
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
    <div className={styles.banner} ref={bannerRef}>
      <div className={styles.textBlock}>
        <div
          className={classNames(styles.title, styles.swapFade, {
            [styles.swapFadeHidden]: isSwapping,
          })}
        >
          {isEnabled ? <EnabledIcon className={styles.enabledIcon} /> : null}
          <Text fontSize="13px" fontWeight={600}>
            {isEnabled ? enabledTitle : activateTitle}
          </Text>
          {isMobile && isEnabled ? (
            <InfoIcon className={styles.infoIcon} data-tooltip-id={tooltipId} />
          ) : null}
        </div>
        <Text
          as="div"
          fontSize="12px"
          className={classNames(styles.descriptionText, styles.swapFade, {
            [styles.swapFadeHidden]: isSwapping,
          })}
        >
          {isEnabled ? enabledDescription : activateDescription}
          {isMobile && !isEnabled ? (
            <InfoIcon className={styles.infoIcon} data-tooltip-id={tooltipId} />
          ) : null}
        </Text>

        {isMobile ? null : (
          <div
            className={classNames(styles.featuresWrap, {
              [styles.swapFadeHidden]: isSwapping,
            })}
            inert={isSwapping}
          >
            {features}
          </div>
        )}
      </div>

      <Button
        className={classNames(styles.button, styles.swapFade, {
          [styles.swapFadeHidden]: isSwapping,
        })}
        primary={!isEnabled}
        size={ButtonSize.small}
        label={isEnabled ? t("Common:Details") : activateLabel}
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

