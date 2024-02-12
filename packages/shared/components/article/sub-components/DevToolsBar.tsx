import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ReactSVG } from "react-svg";

import DeveloperReactSvgUrl from "PUBLIC_DIR/images/catalog.developer.react.svg?url";
import ArrowReactSvgUrl from "PUBLIC_DIR/images/arrow.right.react.svg?url";

import { DeviceType } from "../../../enums";

import { Text } from "../../text";

import { ArticleDevToolsBarProps } from "../Article.types";
import { StyledWrapper } from "../Article.styled";

const ArticleDevToolsBar = ({
  showText,
  articleOpen,
  currentDeviceType,
  toggleArticleOpen,
}: ArticleDevToolsBarProps) => {
  const { t } = useTranslation(["Settings"]);
  const navigate = useNavigate();

  const onClick = () => {
    navigate("/portal-settings/developer-tools");
    if (articleOpen && currentDeviceType === DeviceType.mobile)
      toggleArticleOpen();
  };

  if (!showText) return null;

  return (
    <StyledWrapper onClick={onClick}>
      <ReactSVG src={DeveloperReactSvgUrl} className="icon" />
      <Text fontWeight={600} fontSize="12px" className="label">
        {t("DeveloperTools")}
      </Text>
      <ReactSVG src={ArrowReactSvgUrl} className="arrow" />
    </StyledWrapper>
  );
};

export default ArticleDevToolsBar;
