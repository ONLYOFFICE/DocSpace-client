import DeveloperReactSvgUrl from "PUBLIC_DIR/images/catalog.developer.react.svg?url";
import ArrowReactSvgUrl from "PUBLIC_DIR/images/arrow.right.react.svg?url";
import React from "react";

import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ReactSVG } from "react-svg";

import Text from "@docspace/components/text";
import { mobile } from "@docspace/components/utils/device";

import { DeviceType } from "../../../constants";

const StyledWrapper = styled.div`
  cursor: pointer;
  position: relative;
  margin-top: auto;
  margin-bottom: 16px;
  padding: 12px 16px;
  display: flex;
  gap: 8px;
  align-items: center;
  border: ${(props) => props.theme.filesArticleBody.devTools.border};
  border-radius: 6px;

  @media ${mobile} {
    bottom: 0px;
    margin-top: 32px;
  }

  .icon {
    height: 16px;
  }

  .arrow {
    height: 16px;
    margin-left: auto;
  }

  .label {
    color: ${(props) => props.theme.filesArticleBody.devTools.color};
  }

  svg {
    path {
      fill: ${(props) => props.theme.filesArticleBody.devTools.color};
    }
  }
`;

const ArticleDevToolsBar = ({
  showText,
  articleOpen,
  currentDeviceType,
  toggleArticleOpen,
}) => {
  const { t } = useTranslation(["Settings"]);
  const navigate = useNavigate();

  const onClick = () => {
    navigate("/portal-settings/developer-tools");
    articleOpen &&
      currentDeviceType === DeviceType.mobile &&
      toggleArticleOpen();
  };

  if (!showText) return <></>;

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
