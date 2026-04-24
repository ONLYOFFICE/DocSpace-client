// (c) Copyright Ascensio System SIA 2009-2026
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
import { useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import { Heading } from "@docspace/ui-kit/components/heading";
import { IconButton } from "@docspace/ui-kit/components/icon-button";

import { getBrandName } from "@docspace/shared/constants/brands";
import ArrowPathReactSvgUrl from "PUBLIC_DIR/images/arrow.path.react.svg?url";

const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  max-width: calc(100vw - 32px);

  .arrow-button {
    flex-shrink: 0;
    margin-inline-end: 12px;

    svg {
      ${({ theme }) =>
        theme.interfaceDirection === "rtl" && "transform: scaleX(-1);"}
    }
  }
`;

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
  ]);

  const title = getTitle(location.pathname, t);
  const showBackButton = isSubPage(location.pathname);

  const onBackToParent = () => {
    navigate(-1);
  };

  return (
    <StyledHeader>
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
    </StyledHeader>
  );
};

export default DeveloperToolsHeader;
