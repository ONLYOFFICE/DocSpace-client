import { ThemeContext } from "styled-components";
import React, { useContext, forwardRef, ForwardedRef } from "react";

import StyledFloatingButtonTheme, {
  DefaultStylesProps,
} from "./FloatingButton.theme.styled";

export interface FloatingButtonThemeProps
  extends Omit<
      React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLDivElement>,
        HTMLDivElement
      >,
      "ref"
    >,
    Omit<DefaultStylesProps, "color" | "$currentColorScheme"> {
  icon: string;
}

function FloatingButtonTheme(
  props: FloatingButtonThemeProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const { currentColorScheme } = useContext(ThemeContext);

  return (
    <StyledFloatingButtonTheme
      ref={ref}
      $currentColorScheme={currentColorScheme}
      {...props}
    />
  );
}

export default forwardRef(FloatingButtonTheme);
