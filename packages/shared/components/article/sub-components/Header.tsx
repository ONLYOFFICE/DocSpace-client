import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "styled-components";

import { getLogoFromPath } from "../../../utils";
import { DeviceType } from "../../../enums";
import { ArticleHeaderLoader } from "../../../skeletons/article";

import {
  StyledArticleHeader,
  StyledHeading,
  StyledIconBox,
} from "../Article.styled";
import { ArticleHeaderProps } from "../Article.types";

const ArticleHeader = ({
  showText,
  children,
  onClick,
  onLogoClickAction,
  isBurgerLoading,
  whiteLabelLogoUrls,

  withCustomArticleHeader,
  currentDeviceType,
  ...rest
}: ArticleHeaderProps) => {
  const navigate = useNavigate();
  const theme = useTheme();

  const onLogoClick = () => {
    onLogoClickAction?.();
    navigate("/");
  };

  const burgerLogo = !theme.isBase
    ? getLogoFromPath(whiteLabelLogoUrls[5]?.path?.dark)
    : getLogoFromPath(whiteLabelLogoUrls[5]?.path?.light);
  const logo = !theme.isBase
    ? getLogoFromPath(whiteLabelLogoUrls[0]?.path?.dark)
    : getLogoFromPath(whiteLabelLogoUrls[0]?.path?.light);

  if (currentDeviceType === DeviceType.mobile) return null;

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
          <img src={burgerLogo} alt="burger-logo" onClick={onLogoClick} />
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
          <Link to="/">
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
