import React, { PropsWithChildren, forwardRef, useContext } from "react";
import { ThemeContext } from "styled-components";

import { ContainerToggleButtonTheme } from "./ToggleButton.styled";
import { ToggleButtomThemeProps } from "./ToggleButton.types";

const ToggleButtonTheme = forwardRef<
  HTMLDivElement,
  PropsWithChildren<ToggleButtomThemeProps>
>((props, ref) => {
  const defaultTheme = useContext(ThemeContext);

  const currentColorScheme = defaultTheme?.currentColorScheme;

  return (
    <ContainerToggleButtonTheme
      ref={ref}
      $currentColorScheme={currentColorScheme}
      {...props}
    />
  );
});

ToggleButtonTheme.displayName = "ToggleButtonTheme";

export default ToggleButtonTheme;
