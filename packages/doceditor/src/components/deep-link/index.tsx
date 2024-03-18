// (c) Copyright Ascensio System SIA 2010-2024
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

/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { Link, LinkType } from "@docspace/shared/components/link";
import { FormWrapper } from "@docspace/shared/components/form-wrapper";
import { getBgPattern } from "@docspace/shared/utils/common";
import { getLogoFromPath } from "@docspace/shared/utils";
import { DeviceType } from "@docspace/shared/enums";

import { getDeepLink } from "./DeepLink.helper";

import {
  StyledSimpleNav,
  StyledDeepLink,
  StyledBodyWrapper,
  StyledFileTile,
  StyledActionsWrapper,
  BgBlock,
  StyledWrapper,
  LogoWrapper,
} from "./DeepLink.styled";
import { DeepLinkProps } from "./DeepLink.types";

const DeepLink = ({
  fileInfo,
  userEmail,
  setIsShowDeepLink,
  theme,
  logoUrls,
  currentDeviceType,
  deepLinkConfig,
}: DeepLinkProps) => {
  const { t } = useTranslation(["DeepLink", "Common"]);

  const [isRemember, setIsRemember] = useState(false);
  const onChangeCheckbox = () => {
    setIsRemember(!isRemember);
  };

  const onOpenAppClick = () => {
    if (isRemember) localStorage.setItem("defaultOpenDocument", "app");
    getDeepLink(
      window.location.origin,
      userEmail ?? "",
      fileInfo,
      deepLinkConfig,
      window.location.href,
    );
  };

  const onStayBrowserClick = () => {
    if (isRemember) localStorage.setItem("defaultOpenDocument", "web");
    window.location.replace(window.location.search + "&without_redirect=true");
    setIsShowDeepLink(false);
  };

  const getFileIcon = () => {
    const fileExst = fileInfo?.fileExst.slice(1);
    const iconPath = "/static/images/icons/32/";
    return `${iconPath}${fileExst}.svg`;
  };

  const getFileTitle = () => {
    return fileInfo?.fileExst
      ? fileInfo.title.split(".").slice(0, -1).join(".")
      : fileInfo?.title || "";
  };

  const renderLogo = () => {
    const logoPath = theme.isBase
      ? logoUrls[0]?.path?.light
      : logoUrls[0]?.path?.dark;
    const logo = getLogoFromPath(logoPath);

    if (currentDeviceType === DeviceType.mobile) {
      return (
        <StyledSimpleNav theme={theme}>
          <img src={logo} alt="" />
        </StyledSimpleNav>
      );
    } else {
      return (
        <LogoWrapper theme={theme}>
          <img src={logo} alt="docspace-logo" />
        </LogoWrapper>
      );
    }
  };

  const bgPattern = getBgPattern(theme.currentColorScheme?.id);

  const logoElement = renderLogo();

  return (
    <StyledWrapper>
      {logoElement}
      <FormWrapper>
        <StyledDeepLink>
          <StyledBodyWrapper>
            <Text className="title">{t("DeepLink:OpeningDocument")}</Text>
            <StyledFileTile theme={theme}>
              <img src={getFileIcon()} alt="docspace-logo" />
              <Text fontSize="14px" fontWeight="600" truncate>
                {getFileTitle()}
              </Text>
            </StyledFileTile>
            <Text>{t("DeepLink:DeepLinkText")}</Text>
          </StyledBodyWrapper>
          <StyledActionsWrapper>
            <Checkbox
              label={t("Common:Remember")}
              isChecked={isRemember}
              onChange={onChangeCheckbox}
            />
            <Button
              size={ButtonSize.medium}
              primary
              label={t("DeepLink:OpenInApp")}
              onClick={onOpenAppClick}
            />
            <Link
              className="stay-link"
              type={LinkType.action}
              fontSize="13px"
              fontWeight="600"
              isHovered
              color={theme.currentColorScheme?.main?.accent}
              onClick={onStayBrowserClick}
            >
              {t("DeepLink:StayInBrowser")}
            </Link>
          </StyledActionsWrapper>
        </StyledDeepLink>
      </FormWrapper>
      <BgBlock bgPattern={bgPattern} />
    </StyledWrapper>
  );
};

export default DeepLink;
