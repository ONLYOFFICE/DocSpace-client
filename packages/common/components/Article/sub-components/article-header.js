import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import Loaders from "@docspace/common/components/Loaders";

import { Link } from "react-router-dom";

import { inject, observer } from "mobx-react";
import {
  StyledArticleHeader,
  StyledHeading,
  StyledIconBox,
} from "../styled-article";
import { getLogoFromPath } from "../../../utils";
import { DeviceType } from "../../../constants";

const ArticleHeader = ({
  showText,
  children,
  onClick,
  onLogoClickAction,
  isBurgerLoading,
  whiteLabelLogoUrls,
  theme,
  withCustomArticleHeader,
  currentDeviceType,
  ...rest
}) => {
  const navigate = useNavigate();

  const onLogoClick = () => {
    onLogoClickAction && onLogoClickAction();
    navigate("/");
  };

  const burgerLogo = !theme.isBase
    ? getLogoFromPath(whiteLabelLogoUrls[5]?.path?.dark)
    : getLogoFromPath(whiteLabelLogoUrls[5]?.path?.light);
  const logo = !theme.isBase
    ? getLogoFromPath(whiteLabelLogoUrls[0]?.path?.dark)
    : getLogoFromPath(whiteLabelLogoUrls[0]?.path?.light);

  if (currentDeviceType === DeviceType.mobile) return <></>;

  const isLoadingComponent =
    currentDeviceType === DeviceType.tablet ? (
      <Loaders.ArticleHeader height="28px" width={showText ? "100%" : "28px"} />
    ) : (
      <Loaders.ArticleHeader height="28px" width="211px" />
    );

  const mainComponent = (
    <>
      {currentDeviceType === DeviceType.tablet && (
        <StyledIconBox name="article-burger" showText={showText}>
          <img src={burgerLogo} onClick={onLogoClick} />
        </StyledIconBox>
      )}
      <StyledHeading showText={showText} size="large">
        {currentDeviceType === DeviceType.tablet ? (
          <img className="logo-icon_svg" src={logo} onClick={onLogoClick} />
        ) : (
          <Link to="/">
            <img className="logo-icon_svg" src={logo} />
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

ArticleHeader.propTypes = {
  children: PropTypes.any,
  showText: PropTypes.bool,
  onClick: PropTypes.func,
};

ArticleHeader.displayName = "Header";

export default inject(({ auth }) => {
  const { settingsStore } = auth;
  const { isBurgerLoading, whiteLabelLogoUrls, theme } = settingsStore;

  return {
    isBurgerLoading,
    whiteLabelLogoUrls,
    theme,
  };
})(observer(ArticleHeader));
