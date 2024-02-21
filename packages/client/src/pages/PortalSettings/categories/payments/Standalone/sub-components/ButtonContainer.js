import React from "react";
import { inject, observer } from "mobx-react";

import Button from "@docspace/components/button";

import { StyledButtonComponent } from "../StyledComponent";
import { UrlActionType } from "@docspace/common/constants";

const ButtonContainer = ({ t, buyUrl, openUrl }) => {
  const onClickBuy = () => {
    openUrl(buyUrl, UrlActionType.Link);
  };
  return (
    <StyledButtonComponent>
      <Button
        label={t("ActivatePurchaseBuyNow")}
        size={"small"}
        primary
        onClick={onClickBuy}
      />
    </StyledButtonComponent>
  );
};

export default inject(({ payments, auth }) => {
  const { buyUrl } = payments;
  const { openUrl } = auth.settingsStore;

  return {
    buyUrl,
    openUrl,
  };
})(observer(ButtonContainer));
