import React from "react";

import PanelReactSvgUrl from "PUBLIC_DIR/images/panel.react.svg?url";

import { IconButton } from "../../icon-button";
import { ThemeId } from "../../color-theme";
import { IToggleInfoPanelButtonProps } from "../Navigation.types";
import { StyledInfoPanelToggleColorThemeWrapper } from "../Navigation.styled";

const ToggleInfoPanelButton = ({
  isRootFolder,
  isInfoPanelVisible,
  toggleInfoPanel,
  id,
  titles,
}: IToggleInfoPanelButtonProps) => {
  return (
    <StyledInfoPanelToggleColorThemeWrapper
      isRootFolder={isRootFolder}
      themeId={ThemeId.InfoPanelToggle}
      isInfoPanelVisible={isInfoPanelVisible}
    >
      <div className="info-panel-toggle-bg">
        <IconButton
          id={id}
          className="info-panel-toggle"
          iconName={PanelReactSvgUrl}
          size={16}
          isFill
          title={titles?.infoPanel}
          onClick={toggleInfoPanel}
        />
      </div>
    </StyledInfoPanelToggleColorThemeWrapper>
  );
};

export default ToggleInfoPanelButton;
