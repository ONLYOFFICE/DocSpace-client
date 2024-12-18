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
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "styled-components";

import { getLogoUrl } from "../../../utils";
import { DeviceType, WhiteLabelLogoType } from "../../../enums";
import { ArticleHeaderLoader } from "../../../skeletons/article";
import {
  StyledArticleHeader,
  StyledHeading,
  StyledIconBox,
} from "../Article.styled";
import { ArticleHeaderProps } from "../Article.types";
import { AsideHeader } from "../../aside-header";

const ArticleHeader = ({
  showText,
  children,
  onClick,
  onLogoClickAction,
  isBurgerLoading,

  withCustomArticleHeader,
  currentDeviceType,
  onIconClick,

  ...rest
}: ArticleHeaderProps) => {
  const navigate = useNavigate();
  const theme = useTheme();

  const onLogoClick = () => {
    onLogoClickAction?.();
    navigate("/");
  };

  const burgerLogo = getLogoUrl(WhiteLabelLogoType.LeftMenu, !theme.isBase);
  const logo = getLogoUrl(WhiteLabelLogoType.LightSmall, !theme.isBase);

  if (currentDeviceType === DeviceType.mobile)
    return (
      <AsideHeader
        headerHeight="49px"
        isCloseable
        withoutBorder
        onCloseClick={onIconClick}
      />
    );

  const isLoadingComponent =
    currentDeviceType === DeviceType.tablet ? (
      <ArticleHeaderLoader
        height="28px"
        width={showText ? "100%" : "28px"}
        showText={showText}
      />
    ) : (
      <ArticleHeaderLoader height="28px" width="211px" showText={showText} />
    );

  const mainComponent = (
    <>
      {currentDeviceType === DeviceType.tablet && (
        <StyledIconBox showText={showText}>
          <img
            src={burgerLogo}
            className="burger-logo"
            alt="burger-logo"
            onClick={onLogoClick}
          />
        </StyledIconBox>
      )}
      <StyledHeading showText={showText}>
        {currentDeviceType === DeviceType.tablet ? (
          <img
            className="logo-icon_svg"
            alt="burger-logo"
            src={logo}
            onClick={onLogoClick}
          />
        ) : (
          <Link to="/" onClick={onLogoClick}>
            <img className="logo-icon_svg" alt="burger-logo" src={logo} />
          </Link>
        )}
      </StyledHeading>
    </>
  );

  return (
    <StyledArticleHeader showText={showText} {...rest}>
      {withCustomArticleHeader && children
        ? children
        : isBurgerLoading
          ? isLoadingComponent
          : mainComponent}
    </StyledArticleHeader>
  );
};

ArticleHeader.displayName = "Header";

export default ArticleHeader;
