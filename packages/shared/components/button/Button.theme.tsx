import React, { PropsWithChildren, forwardRef, useContext } from "react";
import { ThemeContext } from "styled-components";

import { StyledThemeButton } from "./Button.styled";
import { ButtonThemeProps } from "./Button.types";

const ButtonTheme = forwardRef<
  HTMLButtonElement,
  PropsWithChildren<ButtonThemeProps>
>((props, ref) => {
  const defaultTheme = useContext(ThemeContext);

  const currentColorScheme = defaultTheme?.currentColorScheme;

  return (
    <StyledThemeButton
      {...props}
      ref={ref}
      $currentColorScheme={currentColorScheme}
    />
  );
});

ButtonTheme.displayName = "ButtonTheme";

export default ButtonTheme;
