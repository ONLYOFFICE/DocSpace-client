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
import { inject, observer } from "mobx-react";
import { Text } from "@docspace/shared/components/text";
import { NoUserSelect, tablet, getLogoUrl } from "@docspace/shared/utils";
import { WhiteLabelLogoType } from "@docspace/shared/enums";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { ReactSVG } from "react-svg";

import { ColorTheme, ThemeId } from "@docspace/shared/components/color-theme";
import logoPersonalAboutUrl from "PUBLIC_DIR/images/logo_personal_about.svg?url";

const StyledAboutBody = styled.div`
  width: 100%;
  user-select: text;

  .avatar {
    margin-top: 0px;
    margin-bottom: 16px;

    @media ${tablet} {
      margin-top: 32px;
    }
  }

  .row-el {
    display: inline-block;
  }

  .copyright {
    margin-top: 14px;
    margin-bottom: 4px;
    font-weight: 700;
  }
  .no-select {
    ${NoUserSelect}
  }

  .row {
    line-height: 20px;
  }

  .tel-title,
  .address-title {
    display: inline;
  }
  .select-el {
    @media ${tablet} {
      user-select: text;
    }
  }

  .logo-theme {
    svg {
      g:nth-child(2) {
        path:nth-child(5) {
          fill: ${(props) => props.theme.client.about.logoColor};
        }

        path:nth-child(6) {
          fill: ${(props) => props.theme.client.about.logoColor};
        }
      }
    }
  }

  .logo-docspace-theme {
    height: 24px;
    width: 211px;

    svg {
      path:nth-child(4) {
        fill: ${(props) => props.theme.client.about.logoColor};
      }
    }
  }
`;

const AboutContent = (props) => {
  const {
    personal,
    buildVersionInfo,
    theme,
    companyInfoSettingsData,
    previewData,
  } = props;
  const { t } = useTranslation("About");
  const license = "AGPL-3.0";
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

  const logo = getLogoUrl(WhiteLabelLogoType.AboutPage, !theme.isBase);

  return (
    companyInfoSettingsData && (
      <StyledAboutBody>
        <div className="avatar">
          {personal ? (
            <ReactSVG
              src={logoPersonalAboutUrl}
              className="logo-theme no-select"
            />
          ) : (
            <img
              src={logo}
              alt="Logo"
              className="logo-docspace-theme no-select"
            />
          )}
        </div>

        <div className="row">
          <Text className="row-el" fontSize="13px">
            {t("DocumentManagement")}:
          </Text>
          <ColorTheme
            {...props}
            tag="a"
            themeId={ThemeId.Link}
            className="row-el"
            fontSize="13px"
            fontWeight="600"
            href={linkRepo}
            target="_blank"
            enableUserSelect
          >
            &nbsp;ONLYOFFICE DocSpace&nbsp;
          </ColorTheme>

          <Text
            className="row-el select-el"
            fontSize="13px"
            fontWeight="600"
            title={`${BUILD_AT}`}
          >
            v.
            <span className="version-document-management">
              {buildVersionInfo.docspace}
            </span>
          </Text>
        </div>

        <div className="row">
          <Text className="row-el" fontSize="13px">
            {t("OnlineEditors")}:
          </Text>
          <ColorTheme
            {...props}
            tag="a"
            themeId={ThemeId.Link}
            className="row-el"
            fontSize="13px"
            fontWeight="600"
            href={linkDocs}
            target="_blank"
            enableUserSelect
          >
            &nbsp;ONLYOFFICE Docs&nbsp;
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
          <Text className="row-el" fontSize="13px" fontWeight="600">
            &nbsp;{license}
          </Text>
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
            {...props}
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
            {...props}
            tag="a"
            themeId={ThemeId.Link}
            className="row-el"
            fontSize="13px"
            fontWeight="600"
            target="_blank"
            href={site}
            enableUserSelect
          >
            &nbsp;{site?.replace(/^https?\:\/\//i, "")}
          </ColorTheme>
        </div>
      </StyledAboutBody>
    )
  );
};

export default inject(({ settingsStore }) => {
  const { theme, companyInfoSettingsData } = settingsStore;

  return {
    theme,
    companyInfoSettingsData,
  };
})(observer(AboutContent));
