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
import styles from "./KnowledgeBaseSaas.module.scss";
import { KnowledgeBaseSaasLoader } from "./KnowledgeBaseSaasLoader";

type KnowledgeBaseSaasProps = {
  aiToolsPrices?: ServicesStore["aiToolsPrices"];
  isAiToolsPricesLoading?: ServicesStore["isAiToolsPricesLoading"];
  formatAiModelsCurrency?: ServicesStore["formatAiModelsCurrency"];
  knowledgeSettingsUrl?: SettingsStore["knowledgeSettingsUrl"];
};

const KnowledgeBaseSaas = ({
  aiToolsPrices,
  isAiToolsPricesLoading,
  formatAiModelsCurrency,
  knowledgeSettingsUrl,
}: KnowledgeBaseSaasProps) => {
  const { t } = useTranslation(["Files", "Common"]);
  const { isBase } = useTheme();

  if (isAiToolsPricesLoading) return <KnowledgeBaseSaasLoader />;

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

  const items = aiToolsPrices.embedding ?? [];

  return (
    <div className={styles.wrapper}>
      <Text className={styles.description}>
        {t("Common:KnowledgeBaseDescription")}
      </Text>

      {knowledgeSettingsUrl ? (
        <Link
          className={classNames(generalStyles.learnMoreLink, styles.learnMore)}
          fontSize="13px"
          fontWeight={600}
          color="accent"
          href={knowledgeSettingsUrl}
          target={LinkTarget.blank}
          textDecoration="underline"
        >
          {t("Common:LearnMore")}
        </Link>
      ) : null}

      <div className={styles.list}>
        {items.map((item) => (
          <div className={styles.row} key={item.id}>
            <div className={styles.rowLeft}>
              <div
                className={styles.icon}
                // biome-ignore lint/security/noDangerouslySetInnerHtml: TODO fix
                dangerouslySetInnerHTML={{ __html: item.image }}
              />
              <Text fontSize="13px" fontWeight={600}>
                {t("Files:Vectorization")}
              </Text>
            </div>

            <div className={styles.rowRight}>
              <Text fontSize="13px" className={styles.price}>
                {t("Common:AIPricePer1MNote", {
                  price: formatAiModelsCurrency?.(item.price.prompt) ?? "",
                  provider: item.provider,
                })}
              </Text>
              {item.link ? (
                <Link
                  href={item.link}
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
  const { knowledgeSettingsUrl } = settingsStore;

  return {
    aiToolsPrices,
    isAiToolsPricesLoading,
    formatAiModelsCurrency,
    knowledgeSettingsUrl,
  };
})(observer(KnowledgeBaseSaas));

