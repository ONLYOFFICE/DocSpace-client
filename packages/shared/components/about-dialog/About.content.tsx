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

import { Text } from "../text";
import { LinkTarget } from "../link";
import { ColorTheme, ThemeId } from "../color-theme";

import { getLogoUrl } from "../../utils";
import { WhiteLabelLogoType } from "../../enums";

import { StyledAboutContent } from "./About.styled";
import { IContentProps } from "./About.types";

export const AboutContent = ({
  buildVersionInfo,
  companyInfoSettingsData,
  previewData,
  standalone,
  licenseUrl,
  isEnterprise,
  logoText,
}: IContentProps) => {
  const { t } = useTranslation("Common");
  const theme = useTheme();
  const isCommercial = !standalone || isEnterprise;
  const license = isCommercial ? t("Common:Commercial") : "AGPL-3.0";
  const linkRepo = "https://github.com/ONLYOFFICE/DocSpace";
  const linkDocs = "https://github.com/ONLYOFFICE/DocumentServer";

  const companyName = previewData
    ? previewData.companyName
    : companyInfoSettingsData?.companyName;

  const email = previewData
    ? previewData.email
    : companyInfoSettingsData?.email;

  const phone = previewData
    ? previewData.phone
    : companyInfoSettingsData?.phone;

  const site = previewData ? previewData.site : companyInfoSettingsData?.site;

  const address = previewData
    ? previewData.address
    : companyInfoSettingsData?.address;

  const logo = getLogoUrl(WhiteLabelLogoType.AboutPage, !theme.isBase, true);

  return (
    companyInfoSettingsData && (
      <StyledAboutContent>
        <div className="avatar">
          <img
            src={logo}
            alt="Logo"
            className="logo-docspace-theme no-select"
          />
        </div>
        <div className="row">
          <Text className="row-el" fontSize="13px">
            {t("DocumentManagement")}:
          </Text>
          <ColorTheme
            tag="a"
            themeId={ThemeId.Link}
            className="row-el"
            fontSize="13px"
            fontWeight="600"
            href={linkRepo}
            target={LinkTarget.blank}
            enableUserSelect
          >
            &nbsp;{logoText} {t("Common:ProductName")}&nbsp;
          </ColorTheme>

          <Text className="row-el select-el" fontSize="13px" fontWeight="600">
            v.
            <span className="version-document-management">
              {buildVersionInfo.docSpace}
            </span>
          </Text>
        </div>

        <div className="row">
          <Text className="row-el" fontSize="13px">
            {t("OnlineEditors")}:
          </Text>
          <ColorTheme
            tag="a"
            themeId={ThemeId.Link}
            className="row-el"
            fontSize="13px"
            fontWeight="600"
            href={linkDocs}
            target={LinkTarget.blank}
            enableUserSelect
          >
            &nbsp;{logoText} {t("Common:ProductEditorsName")}&nbsp;
          </ColorTheme>
          <Text className="row-el select-el" fontSize="13px" fontWeight="600">
            v.
            <span className="version-online-editors">
              {buildVersionInfo.documentServer}
            </span>
          </Text>
        </div>

        <div className="row">
          <Text className="row-el" fontSize="13px">
            {t("SoftwareLicense")}:{" "}
          </Text>
          {isCommercial ? (
            <ColorTheme
              tag="a"
              themeId={ThemeId.Link}
              className="row-el"
              fontSize="13px"
              fontWeight="600"
              href={licenseUrl}
              target={LinkTarget.blank}
              enableUserSelect
            >
              &nbsp;{license}
            </ColorTheme>
          ) : (
            <Text className="row-el" fontSize="13px" fontWeight="600">
              &nbsp;{license}
            </Text>
          )}
        </div>

        <Text className="copyright" fontSize="14px" fontWeight="600">
          © {companyName}
        </Text>

        <div className="row">
          <Text className="address-title" fontSize="13px">
            {t("Common:Address")}:{" "}
          </Text>
          <Text className="address-title select-el" fontSize="13px">
            {address}
          </Text>
        </div>

        <div className="row">
          <Text className="tel-title" fontSize="13px">
            {t("Common:Phone")}:{" "}
          </Text>
          <Text className="tel-title select-el" fontSize="13px">
            {phone}
          </Text>
        </div>

        <div className="row">
          <Text className="row-el" fontSize="13px">
            {t("AboutCompanyEmailTitle")}:
          </Text>

          <ColorTheme
            tag="a"
            themeId={ThemeId.Link}
            className="row-el"
            fontSize="13px"
            fontWeight="600"
            href={`mailto:${companyInfoSettingsData.email}`}
            enableUserSelect
          >
            &nbsp;{email}
          </ColorTheme>
        </div>

        <div className="row">
          <Text className="row-el" fontSize="13px">
            {t("Site")}:
          </Text>

          <ColorTheme
            tag="a"
            themeId={ThemeId.Link}
            className="row-el"
            fontSize="13px"
            fontWeight="600"
            target={LinkTarget.blank}
            href={site}
            enableUserSelect
          >
            &nbsp;{site?.replace(/^https?\:\/\//i, "")}
          </ColorTheme>
        </div>
      </StyledAboutContent>
    )
  );
};
