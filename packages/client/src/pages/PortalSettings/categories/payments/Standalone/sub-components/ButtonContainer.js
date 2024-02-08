import React from "react";
import { inject, observer } from "mobx-react";

import { Button } from "@docspace/shared/components/button";

import { StyledButtonComponent } from "../StyledComponent";

const ButtonContainer = ({ t, buyUrl }) => {
  const onClickBuy = () => {
    window.open(buyUrl, "_blank");
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

export default inject(({ paymentStore }) => {
  const { buyUrl } = paymentStore;

  return {
    buyUrl,
  };
})(observer(ButtonContainer));
