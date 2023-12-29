import React, { PropsWithChildren, forwardRef, useContext } from "react";
import { ThemeContext } from "styled-components";

import { StyledThemeMainButton } from "./MainButton.styled";
import { MainButtonThemeProps } from "./MainButton.types";

const MainButtonTheme = forwardRef<
  HTMLDivElement,
  PropsWithChildren<MainButtonThemeProps>
>((props, ref) => {
  const defaultTheme = useContext(ThemeContext);

  const currentColorScheme = defaultTheme?.currentColorScheme;

  return (
    <StyledThemeMainButton
      {...props}
      ref={ref}
      $currentColorScheme={currentColorScheme}
    />
  );
});

MainButtonTheme.displayName = "MainButtonTheme";

export default MainButtonTheme;
