﻿import InfoPanelRoomEmptyScreenSvgUrl from "PUBLIC_DIR/images/empty_screen_corporate.svg?url";
import InfoPanelRoomEmptyScreenDarkSvgUrl from "PUBLIC_DIR/images/empty_screen_corporate_dark.svg?url";
import { inject, observer } from "mobx-react";
import { Text } from "@docspace/shared/components/text";

import { StyledNoItemContainer } from "../../styles/noItem";

const NoRoomItem = ({ t, theme }) => {
  const imageSrc = theme.isBase
    ? InfoPanelRoomEmptyScreenSvgUrl
    : InfoPanelRoomEmptyScreenDarkSvgUrl;

  return (
    <StyledNoItemContainer className="info-panel_gallery-empty-screen">
      <div className="no-thumbnail-img-wrapper">
        <img src={imageSrc} alt="No Room Image" />
      </div>
      <Text className="no-item-text" textAlign="center">
        {t("RoomsEmptyScreenTent")}
      </Text>
    </StyledNoItemContainer>
  );
};

export default inject(({ settingsStore }) => {
  return {
    theme: settingsStore.theme,
  };
})(observer(NoRoomItem));
