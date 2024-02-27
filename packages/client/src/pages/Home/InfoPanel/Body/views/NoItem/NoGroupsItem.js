import EmptyScreenPersonSvgUrl from "PUBLIC_DIR/images/empty_screen_persons.svg?url";
import EmptyScreenPersonSvgDarkUrl from "PUBLIC_DIR/images/empty_screen_persons_dark.svg?url";
import React from "react";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/shared/components/text";
import { StyledNoItemContainer } from "../../styles/noItem";

const NoGroupsItem = ({ t, theme }) => {
  const imgSrc = theme.isBase
    ? EmptyScreenPersonSvgUrl
    : EmptyScreenPersonSvgDarkUrl;

  return (
    <StyledNoItemContainer>
      <div className="no-thumbnail-img-wrapper no-accounts">
        <img src={imgSrc} />
      </div>
      <Text className="no-item-text" textAlign="center">
        {t("InfoPanel:GroupsEmptyScreenText")}
      </Text>
    </StyledNoItemContainer>
  );
};

export default inject(({ settingsStore }) => {
  return {
    theme: settingsStore.theme,
  };
})(observer(NoGroupsItem));
