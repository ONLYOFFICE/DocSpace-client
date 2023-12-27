import React from "react";
import { ReactSVG } from "react-svg";
import styled from "styled-components";
import InfoIcon from "PUBLIC_DIR/images/info.outline.react.svg?url";
import CrossReactSvg from "PUBLIC_DIR/images/cross.react.svg?url";
import { IconButton } from "@docspace/shared/components";
import { Text } from "@docspace/shared/components";

const StyledInfoBar = styled.div`
  display: flex;
  background-color: ${(props) => props.theme.infoBar.background};
  color: #333;
  font-size: ${(props) => props.theme.getCorrectFontSize("12px")};
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 10px;
  margin: -4px 16px 20px;
  .text-container {
    width: 100%;
    display: flex;
    flex-direction: column;
  }
  .header-body {
    display: flex;
    height: fit-content;
    width: 100%;
    gap: 8px;
    font-weight: 600;
    .header-icon {
      svg {
        path {
          fill: #ed7309;
        }
      }
    }

    &__title {
      color: ${(props) => props.theme.infoBar.title};
    }
  }
  .body-container {
    color: ${(props) => props.theme.infoBar.description};
    font-weight: 400;
  }
  .close-icon {
    margin: 3px 1px 0px 0px;
    path {
      fill: ${({ theme }) => theme.iconButton.color};
    }
    svg {
      width: 12px;
      height: 12px;
    }
  }
`;

const InfoBar = (props) => {
  const { t, iconName, onClose, ...rest } = props;

  return (
    <StyledInfoBar {...rest}>
      <div className="text-container">
        <div className="header-body">
          <div className="header-icon">
            <ReactSVG src={InfoIcon} />
          </div>
          <Text className="header-body__title" fontSize="12px" fontWeight={600}>
            {t("Common:Info")}
          </Text>
        </div>
        <div className="body-container">{t("InfoPanel:InfoBanner")}</div>
      </div>

      <IconButton
        className="close-icon"
        size={10}
        iconName={CrossReactSvg}
        onClick={onClose}
      />
    </StyledInfoBar>
  );
};

export default InfoBar;
