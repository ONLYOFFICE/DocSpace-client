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
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { Button } from "@docspace/ui-kit/components/button";
import { RectangleSkeleton } from "@docspace/shared/skeletons";

import GithubLight from "PUBLIC_DIR/images/thirdparties/github.light.react.svg";
import GithubDark from "PUBLIC_DIR/images/thirdparties/github.dark.react.svg";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";

import styles from "./PluginSDK.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

const PluginSDK = ({
  systemPluginList,
  currentDeviceType,
  isLoading,
  isEmptyList,
  theme,
  apiPluginSDKLink,
}) => {
  const { t, ready } = useTranslation([
    "WebPlugins",
    "VersionHistory",
    "Common",
  ]);

  React.useEffect(() => {
    if (ready) setDocumentTitle(t("WebPlugins:PluginSDK"));
  }, [ready]);

  const isMobile = currentDeviceType === "mobile";

  const icon = theme.isBase ? <GithubLight /> : <GithubDark />;

  const getPluginList = () => {
    if (isLoading) {
      return [
        <RectangleSkeleton
          key="plugin-1"
          width="100%"
          height="164px"
          borderRadius="6px"
        />,
        <RectangleSkeleton
          key="plugin-2"
          width="100%"
          height="164px"
          borderRadius="6px"
        />,
        <RectangleSkeleton
          key="plugin-3"
          width="100%"
          height="164px"
          borderRadius="6px"
        />,
      ];
    }

    const list = systemPluginList.map((p) => (
      <div key={p.name} className={styles.pluginListItem}>
        <div className={styles.pluginListItemInfo}>
          <img
            className={styles.pluginLogo}
            src={`${p.iconUrl}/assets/${p.image}?hash=${p.version}`}
            alt="Plugin logo"
          />
          <div className={styles.pluginInfoContainer}>
            <Text>{p.name}</Text>
            <Text className={styles.description}>
              {t("VersionHistory:VersionShort")} {p.version}
            </Text>
          </div>
        </div>
        <Text className={styles.descriptionText} title={p.description}>
          {p.description}
        </Text>
        <Button
          icon={icon}
          onClick={() => window.open(p.homePage, "_blank")}
          scale
          label={t("GoToRepo")}
          size="small"
          testId={`${p.name}_go_to_repo_button`}
        />
      </div>
    ));

    return list;
  };

  const list = getPluginList();

  return (
    <div className={styles.container}>
      <Text fontSize="16px" fontWeight={700} lineHeight="22px">
        {t("ExpandFunctionality")}
      </Text>
      <Text
        className={styles.description}
        fontSize="13px"
        fontWeight={400}
        lineHeight="20px"
      >
        {t("PluginSDKDescription", {
          productName: getBrandName("ProductName"),
        })}
      </Text>
      <Text
        className={styles.description}
        fontSize="13px"
        fontWeight={400}
        lineHeight="20px"
      >
        {t("PluginSDKInstruction")}
      </Text>
      <Button
        className={styles.readInstructionsButton}
        label={t("Common:ReadInstructions")}
        primary
        scale={isMobile}
        size={isMobile ? "normal" : "small"}
        onClick={() => window.open(apiPluginSDKLink, "_blank")}
        testId="read_instructions_button"
      />
      {!isEmptyList && list.length > 0 ? (
        <>
          <Text fontSize="16px" fontWeight={700} lineHeight="22px">
            {t("PluginSamples")}
          </Text>
          <div className={styles.pluginList}>{list}</div>
        </>
      ) : null}
    </div>
  );
};

export default inject(({ pluginStore, settingsStore }) => {
  const { currentDeviceType, theme, apiPluginSDKLink } = settingsStore;
  const { systemPluginList, isLoading, isEmptyList } = pluginStore;

  return {
    currentDeviceType,
    systemPluginList,
    theme,
    isLoading,
    isEmptyList,
    apiPluginSDKLink,
  };
})(observer(PluginSDK));

