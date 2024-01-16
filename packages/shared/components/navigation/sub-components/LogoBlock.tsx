import React from "react";
import { INavigationLogoProps } from "../Navigation.types";

const NavigationLogo = ({
  logo,
  burgerLogo,
  ...rest
}: INavigationLogoProps) => {
  return (
    <div {...rest}>
      <img className="logo-icon_svg" alt="logo" src={logo} />
      <div className="header-burger">
        <img src={burgerLogo} alt="burger logo" /* onClick={onLogoClick} */ />
      </div>
      <div className="header_separator" />
    </div>
  );
};

export default NavigationLogo;
