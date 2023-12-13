import React from "react";
import styled, { css } from "styled-components";
import PanelReactSvgUrl from "PUBLIC_DIR/images/panel.react.svg?url";
import IconButton from "@docspace/components/icon-button";
import { tablet } from "@docspace/components/utils/device";
import { Base } from "@docspace/components/themes";
import { ColorTheme, ThemeType } from "@docspace/components/ColorTheme";

const StyledInfoPanelToggleColorThemeWrapper = styled(ColorTheme)`
  align-self: center;

  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin-right: auto;
          transform: scaleX(-1);
        `
      : css`
          margin-left: auto;
        `}

  margin-bottom: 1px;
  padding: 0;

  .info-panel-toggle {
    margin-inline-end: 8px;
  }

  ${(props) =>
    props.isInfoPanelVisible &&
    css`
      .info-panel-toggle-bg {
        height: 30px;
        width: 30px;
        background: ${props.theme.backgroundAndSubstrateColor};
        border: 1px solid ${props.theme.backgroundAndSubstrateColor};
        border-radius: 50%;
        .info-panel-toggle {
          margin: auto;
          margin-top: 25%;
        }
      }
    `}

  @media ${tablet} {
    display: none;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: ${props.isRootFolder ? "auto" : "0"};
          `
        : css`
            margin-left: ${props.isRootFolder ? "auto" : "0"};
          `}
  }
`;
StyledInfoPanelToggleColorThemeWrapper.defaultProps = { theme: Base };

const ToggleInfoPanelButton = ({
  isRootFolder,
  isInfoPanelVisible,
  toggleInfoPanel,
  id,
  titles,
}) => {
  return (
    <StyledInfoPanelToggleColorThemeWrapper
      isRootFolder={isRootFolder}
      themeId={ThemeType.InfoPanelToggle}
      isInfoPanelVisible={isInfoPanelVisible}
    >
      <div className="info-panel-toggle-bg">
        <IconButton
          id={id}
          className="info-panel-toggle"
          iconName={PanelReactSvgUrl}
          size="16"
          isFill={true}
          title={titles?.infoPanel}
          onClick={toggleInfoPanel}
        />
      </div>
    </StyledInfoPanelToggleColorThemeWrapper>
  );
};

export default ToggleInfoPanelButton;
