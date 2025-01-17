// (c) Copyright Ascensio System SIA 2009-2024
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
import { useTheme } from "styled-components";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import WindowsReactSvgUrl from "PUBLIC_DIR/images/windows.react.svg?url";
import MacOSReactSvgUrl from "PUBLIC_DIR/images/macOS.react.svg?url";
import LinuxReactSvgUrl from "PUBLIC_DIR/images/linux.react.svg?url";
import AndroidReactSvgUrl from "PUBLIC_DIR/images/android.react.svg?url";
import IOSReactSvgUrl from "PUBLIC_DIR/images/iOS.react.svg?url";

import { LANGUAGE } from "../../../constants";
import { getLanguage, getCookie } from "../../../utils";

import { Text } from "../../text";
import { IconButton } from "../../icon-button";

import styles from "../Article.module.scss";
import { ArticleAppsProps } from "../Article.types";
import { SUPPORTED_LANGUAGES } from "../Article.constants";

const lng: string[] | string = getCookie(LANGUAGE) || "en";
const language = getLanguage(typeof lng === "object" ? lng[0] : lng);

const getLink = () => {
  const currentLng = language.split("-")[0];
  if (SUPPORTED_LANGUAGES.includes(currentLng)) {
    return `https://www.onlyoffice.com/${currentLng}`;
  }
  return "https://www.onlyoffice.com";
};

const ArticleApps = React.memo(
  ({ showText, withDevTools }: ArticleAppsProps) => {
    const { t } = useTranslation(["Translations", "Common"]);
    const theme = useTheme();

    const baseUrl = getLink();
    const desktopLink = `${baseUrl}/download-desktop.aspx`;
    const androidLink = `${baseUrl}/office-for-android.aspx`;
    const iosLink = `${baseUrl}/office-for-ios.aspx`;

    if (!showText) return null;

    return (
      <div
        data-showText={showText ? "true" : "false"}
        data-with-dev-tools={withDevTools ? "true" : "false"}
        className={classNames(styles.apps, {
          [styles.withDevTools]: withDevTools,
        })}
      >
        <Text className="download-app-text" fontSize="14px" noSelect>
          {t("Common:DownloadApps")}
        </Text>
        <div className="download-app-list">
          <IconButton
            onClick={() => window.open(desktopLink)}
            iconName={WindowsReactSvgUrl}
            size={32}
            isFill
            hoverColor={theme.filesArticleBody.downloadAppList.winHoverColor}
            title={t("Common:MobileWin", {
              organizationName: t("Common:OrganizationName"),
            })}
          />
          <IconButton
            onClick={() => window.open(desktopLink)}
            iconName={MacOSReactSvgUrl}
            size={32}
            isFill
            hoverColor={theme.filesArticleBody.downloadAppList.macHoverColor}
            title={t("Common:MobileMac", {
              organizationName: t("Common:OrganizationName"),
            })}
          />
          <IconButton
            onClick={() => window.open(desktopLink)}
            iconName={LinuxReactSvgUrl}
            size={32}
            isFill
            hoverColor={theme.filesArticleBody.downloadAppList.linuxHoverColor}
            title={t("Common:MobileLinux", {
              organizationName: t("Common:OrganizationName"),
            })}
          />
          <IconButton
            onClick={() => window.open(androidLink)}
            iconName={AndroidReactSvgUrl}
            size={32}
            isFill
            hoverColor={
              theme.filesArticleBody.downloadAppList.androidHoverColor
            }
            title={t("Common:MobileAndroid", {
              organizationName: t("Common:OrganizationName"),
            })}
          />
          <IconButton
            onClick={() => window.open(iosLink)}
            iconName={IOSReactSvgUrl}
            size={32}
            isFill
            hoverColor={theme.filesArticleBody.downloadAppList.iosHoverColor}
            title={t("Common:MobileIos", {
              organizationName: t("Common:OrganizationName"),
            })}
          />
        </div>
      </div>
    );
  },
);

ArticleApps.displayName = "ArticleApps";

export default ArticleApps;
