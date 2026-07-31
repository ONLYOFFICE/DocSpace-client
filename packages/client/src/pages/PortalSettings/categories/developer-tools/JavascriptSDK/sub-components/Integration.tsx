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
import { ReactSVG } from "react-svg";

import { Text } from "@docspace/ui-kit/components/text";
import { Link } from "@docspace/ui-kit/components/link";
import { TooltipContainer } from "@docspace/ui-kit/components/tooltip";
import { inject, observer } from "mobx-react";
import { TColorScheme, TTheme } from "@docspace/ui-kit/providers/theme/themes";
import { useTranslation } from "react-i18next";
import ZoomIcon from "PUBLIC_DIR/images/zoom.integration.react.svg?url";
import WordpressIcon from "PUBLIC_DIR/images/wordpress.integration.react.svg?url";
import DrupalIcon from "PUBLIC_DIR/images/drupal.integration.react.svg?url";
import ArrowIcon from "PUBLIC_DIR/images/arrow.integration.react.svg?url";

import { isMobile } from "@docspace/ui-kit/utils/device";
import classNames from "classnames";
import styles from "./StyledPortalIntegration.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

const zoomTitle = "Zoom";
const wordPressTitle = "WordPress";
const drupalTitle = "Drupal";

const Integration: React.FC<{
  theme: TTheme;
  currentColorScheme: TColorScheme;
  className: string;
  allConnectorsUrl: string;
  zoomUrl: string;
  wordPressUrl: string;
  drupalUrl: string;
}> = ({
  theme,
  currentColorScheme,
  className,
  allConnectorsUrl,
  zoomUrl,
  wordPressUrl,
  drupalUrl,
}) => {
  const { t } = useTranslation(["JavascriptSdk"]);

  return (
    <div
      className={classNames(styles.integrationContainer, { [styles.dark]: !theme.isBase }, className)}
      style={{ "--icon-arrow-color": currentColorScheme?.main?.accent ?? "" } as React.CSSProperties}
    >
      <div className={classNames(styles.categoryHeader, { [styles.isMobile]: isMobile() }, "integration-header")}>
        {t("IntegrationExamples")}
      </div>
      <Text lineHeight="20px" color={theme.sdkPresets.secondaryColor}>
        {t("IntegrationDescription", { productName: getBrandName("ProductName") })}
      </Text>
      <div className="icons">
        <TooltipContainer
          as="div"
          data-testid="integration_zoom_container"
          className="icon"
          title={zoomTitle}
        >
          <ReactSVG
            className="icon-zoom"
            src={ZoomIcon}
            onClick={() => window.open(zoomUrl, "_blank")}
          />
        </TooltipContainer>

        <TooltipContainer
          as="div"
          data-testid="integration_wordpress_container"
          className="icon"
          title={wordPressTitle}
        >
          <ReactSVG
            className="icon-wordpress"
            src={WordpressIcon}
            onClick={() => window.open(wordPressUrl, "_blank")}
          />
        </TooltipContainer>

        <TooltipContainer
          as="div"
          data-testid="integration_drupal_container"
          className="icon"
          title={drupalTitle}
        >
          <ReactSVG
            className="icon-drupal"
            src={DrupalIcon}
            onClick={() => window.open(drupalUrl, "_blank")}
          />
        </TooltipContainer>
      </div>
      <div className="link-container">
        <Link
          data-testid="all_connectors_link"
          className="link"
          noHover
          color={currentColorScheme?.main?.accent ?? undefined}
          onClick={() => window.open(allConnectorsUrl, "_blank")}
        >
          {t("SeeAllConnectors")}
        </Link>

        <div data-testid="all_connectors_icon" className="icon">
          <ReactSVG
            className="icon-arrow"
            src={ArrowIcon}
            onClick={() => window.open(allConnectorsUrl, "_blank")}
          />
        </div>
      </div>
    </div>
  );
};

export default inject<TStore>(({ settingsStore }) => {
  const {
    allConnectorsUrl,
    zoomUrl,
    wordPressUrl,
    drupalUrl,
    theme,
    currentColorScheme,
  } = settingsStore;
  return {
    allConnectorsUrl,
    zoomUrl,
    wordPressUrl,
    drupalUrl,
    theme,
    currentColorScheme,
  };
})(observer(Integration));
