import React, { PropsWithChildren, forwardRef, useContext } from "react";
import { ThemeContext } from "styled-components";
import ContainerToggleButtonTheme, {
  ContainerToggleButtonThemeProps,
} from "./ToggleButton.theme.styled";

interface ToggleButtomThemeProps
  extends Omit<ContainerToggleButtonThemeProps, "$currentColorScheme"> {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

const ToggleButtonTheme = forwardRef<
  HTMLDivElement,
  PropsWithChildren<ToggleButtomThemeProps>
>((props, ref) => {
  const { currentColorScheme } = useContext(ThemeContext);

  return (
    <ContainerToggleButtonTheme
      ref={ref}
      $currentColorScheme={currentColorScheme}
      {...props}
    />
  );
});

export default ToggleButtonTheme;
