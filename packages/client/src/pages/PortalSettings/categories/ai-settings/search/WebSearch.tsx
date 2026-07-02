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
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import classNames from "classnames";

import { Text } from "@docspace/ui-kit/components/text";
import { Link, LinkTarget } from "@docspace/ui-kit/components/link";
import { EmptyView } from "@docspace/shared/components/empty-view";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";

import ExternalLinkIcon from "PUBLIC_DIR/images/external.link.14.react.svg";
import EmptyScreenServerErrorLightSvg from "PUBLIC_DIR/images/emptyview/empty.server.error.light.svg";
import EmptyScreenServerErrorDarkSvg from "PUBLIC_DIR/images/emptyview/empty.server.error.dark.svg";
import ReloadArrowsSvg from "PUBLIC_DIR/images/icons/10/reload.arrows.svg";

import type ServicesStore from "SRC_DIR/store/ServicesStore";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";

import generalStyles from "../AISettings.module.scss";
import styles from "./WebSearch.module.scss";
import { WebSearchLoader } from "./WebSearchLoader";

type WebSearchProps = {
  aiToolsPrices?: ServicesStore["aiToolsPrices"];
  isAiToolsPricesLoading?: ServicesStore["isAiToolsPricesLoading"];
  formatAiModelsCurrency?: ServicesStore["formatAiModelsCurrency"];
  webSearchSettingsUrl?: SettingsStore["webSearchSettingsUrl"];
};

const WebSearch = ({
  aiToolsPrices,
  isAiToolsPricesLoading,
  formatAiModelsCurrency,
  webSearchSettingsUrl,
}: WebSearchProps) => {
  const { t } = useTranslation(["Common"]);
  const { isBase } = useTheme();

  // Pricing is loaded upstream in the settings View; show a skeleton while it
  // loads.
  if (isAiToolsPricesLoading) return <WebSearchLoader />;

  // Pricing failed to load — show a server-error screen with a reload action.
  if (!aiToolsPrices) {
    const icon = isBase ? (
      <EmptyScreenServerErrorLightSvg />
    ) : (
      <EmptyScreenServerErrorDarkSvg />
    );

    return (
      <EmptyView
        icon={icon}
        title={t("Common:SomethingWentWrong")}
        description={t("Common:ServerErrorEmptyDescription")}
        options={[
          {
            to: "",
            key: "reload",
            title: t("Common:ReloadPage"),
            description: t("Common:ReloadPage"),
            icon: <ReloadArrowsSvg />,
            onClick: () => window.location.reload(),
          },
        ]}
      />
    );
  }

  const items = aiToolsPrices.webSearch ?? [];

  return (
    <div className={styles.wrapper}>
      <Text className={styles.description}>
        {t("Common:WebSearchEngineDescription")}
      </Text>

      {webSearchSettingsUrl ? (
        <Link
          className={classNames(generalStyles.learnMoreLink, styles.learnMore)}
          fontSize="13px"
          fontWeight={600}
          color="accent"
          href={webSearchSettingsUrl}
          target={LinkTarget.blank}
          textDecoration="underline"
        >
          {t("Common:LearnMore")}
        </Link>
      ) : null}

      <div className={styles.list}>
        {items.map((ws) => (
          <div className={styles.row} key={ws.id}>
            <div className={styles.rowLeft}>
              <div
                className={styles.icon}
                // biome-ignore lint/security/noDangerouslySetInnerHtml: TODO fix
                dangerouslySetInnerHTML={{ __html: ws.image }}
              />
              <Text fontSize="13px" fontWeight={600}>
                {ws.alias}
              </Text>
            </div>

            <div className={styles.rowRight}>
              <Text fontSize="13px" className={styles.price}>
                {t("Common:WebSearchPriceNote", {
                  price: formatAiModelsCurrency?.(ws.price) ?? "",
                  provider: ws.provider,
                })}
              </Text>
              {ws.link ? (
                <Link
                  href={ws.link}
                  target={LinkTarget.blank}
                  className={styles.detailsLink}
                >
                  <ExternalLinkIcon />
                </Link>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default inject<TStore>(({ servicesStore, settingsStore }) => {
  const { aiToolsPrices, isAiToolsPricesLoading, formatAiModelsCurrency } =
    servicesStore;
  const { webSearchSettingsUrl } = settingsStore;

  return {
    aiToolsPrices,
    isAiToolsPricesLoading,
    formatAiModelsCurrency,
    webSearchSettingsUrl,
  };
})(observer(WebSearch));

