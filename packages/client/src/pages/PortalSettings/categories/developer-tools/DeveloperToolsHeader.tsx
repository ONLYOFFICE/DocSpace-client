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
import { useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import { Heading } from "@docspace/ui-kit/components/heading";
import { IconButton } from "@docspace/ui-kit/components/icon-button";

import { getBrandName } from "@docspace/shared/constants/brands";
import ArrowPathReactSvgUrl from "PUBLIC_DIR/images/arrow.path.react.svg?url";

import styles from "./DeveloperToolsHeader.module.scss";

const getSdkPresetTitle = (
  slug: string,
  t: (key: string) => string,
): string | null => {
  switch (slug) {
    case "public-room":
      return t("Common:PublicRoom");
    case "editor":
      return t("Common:Editor");
    case "viewer":
      return t("Common:Viewer");
    case "room-selector":
      return t("Common:RoomSelector");
    case "file-selector":
      return t("Common:FileSelector");
    case "custom":
      return t("Common:Custom");
    case "uploader":
      return t("Common:Uploader");
    default:
      return null;
  }
};

const getTitle = (pathname: string, t: (key: string) => string): string => {
  if (pathname.includes("/developer-tools/docs-connect"))
    return t("DocsConnect:DocsConnect");
  if (pathname.includes("/developer-tools/api-keys")) return t("Settings:ApiKeys");
  if (pathname.includes("/developer-tools/javascript-sdk/")) {
    const slug = pathname.split("/developer-tools/javascript-sdk/")[1]?.replace(/\/$/, "");
    if (slug === "docspace") return getBrandName("ProductName");
    const title = getSdkPresetTitle(slug, t);
    if (title) return title;
  }
  if (pathname.includes("/developer-tools/javascript-sdk"))
    return t("Settings:EmbedSDK");
  if (pathname.includes("/developer-tools/plugin-sdk"))
    return t("WebPlugins:PluginSDK");
  if (pathname.includes("/developer-tools/webhooks")) return t("Webhooks:Webhooks");
  if (pathname.includes("/developer-tools/oauth")) return t("OAuth:OAuth");
  return t("Common:DeveloperTools");
};

const isSubPage = (pathname: string): boolean => {
  const path = pathname.replace(/\/$/, "");
  const segments = path.split("/").filter(Boolean);
  // /developer-tools/javascript-sdk = 2 segments (top-level)
  // /developer-tools/javascript-sdk/docspace = 3 segments (sub-page)
  return segments.length > 2;
};

const DeveloperToolsHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation([
    "Settings",
    "JavascriptSdk",
    "WebPlugins",
    "Webhooks",
    "OAuth",
    "Common",
    "DocsConnect",
  ]);

  const title = getTitle(location.pathname, t);
  const showBackButton = isSubPage(location.pathname);

  const onBackToParent = () => {
    navigate(-1);
  };

  return (
    <div className={styles.styledHeader}>
      {showBackButton ? (
        <IconButton
          iconName={ArrowPathReactSvgUrl}
          size={17}
          isFill
          onClick={onBackToParent}
          className="arrow-button"
          dataTestId="back_parent_icon_button"
        />
      ) : null}
      <Heading type="content" truncate>
        {title}
      </Heading>
    </div>
  );
};

export default DeveloperToolsHeader;
