import { ThemeContext } from "styled-components";
import React, { useContext, forwardRef, PropsWithChildren } from "react";

import { StyledFloatingButtonTheme } from "./FloatingButton.styled";

import { FloatingButtonThemeProps } from "./FloatingButton.types";

const FloatingButtonTheme = forwardRef<
  HTMLDivElement,
  PropsWithChildren<FloatingButtonThemeProps>
>((props, ref) => {
  const defaultTheme = useContext(ThemeContext);

  const currentColorScheme = defaultTheme?.currentColorScheme;

  return (
    <StyledFloatingButtonTheme
      {...props}
      ref={ref}
      $currentColorScheme={currentColorScheme}
    />
  );
});

FloatingButtonTheme.displayName = "FloatingButtonTheme";

export { FloatingButtonTheme };
