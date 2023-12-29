import React, {
  ForwardedRef,
  PropsWithChildren,
  forwardRef,
  useContext,
} from "react";
import { ThemeContext } from "styled-components";

import { StyledThemeComboButton } from "./Combobox.styled";
import type { ComboButtonThemeProps } from "./Combobox.types";

const ComboButtonTheme = forwardRef(
  (
    props: PropsWithChildren<ComboButtonThemeProps>,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const defaultTheme = useContext(ThemeContext);

    const currentColorScheme = defaultTheme?.currentColorScheme;

    return (
      <StyledThemeComboButton
        {...props}
        ref={ref}
        $currentColorScheme={currentColorScheme}
      />
    );
  },
);

ComboButtonTheme.displayName = "ComboButtonTheme";

export default ComboButtonTheme;
