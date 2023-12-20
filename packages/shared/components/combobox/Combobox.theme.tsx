import React, {
  ForwardedRef,
  PropsWithChildren,
  forwardRef,
  useContext,
} from "react";
import { ThemeContext } from "styled-components";

import { StyledThemeComboButton } from "./Combobox.styled";
import type {
  ComboButtonThemeProps,
  TOption,
  TOptionKey,
} from "./Combobox.types";

const ComboButtonTheme = forwardRef(
  <T extends TOption<Extract<T["key"], TOptionKey>>>(
    props: PropsWithChildren<ComboButtonThemeProps<T>>,
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
