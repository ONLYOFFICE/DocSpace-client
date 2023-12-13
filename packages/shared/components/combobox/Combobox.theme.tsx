import React, { PropsWithChildren, forwardRef, useContext } from "react";
import { ThemeContext } from "styled-components";

import { StyledThemeComboButton } from "./Combobox.styled";
import { ComboButtonThemeProps } from "./Combobox.types";

const ComboButtonTheme = forwardRef<
  HTMLDivElement,
  PropsWithChildren<ComboButtonThemeProps>
>((props, ref) => {
  const defaultTheme = useContext(ThemeContext);

  const currentColorScheme = defaultTheme?.currentColorScheme;

  return (
    <StyledThemeComboButton
      {...props}
      ref={ref}
      $currentColorScheme={currentColorScheme}
    />
  );
});

ComboButtonTheme.displayName = "ComboButtonTheme";

export default ComboButtonTheme;
