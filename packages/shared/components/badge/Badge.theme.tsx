import React, { PropsWithChildren, forwardRef, useContext } from "react";
import { ThemeContext } from "styled-components";
import { TColorScheme } from "../../themes";

import { StyledBadgeTheme } from "./Badge.styled";
import { BadgeProps } from "./Badge.types";

const BadgeTheme = forwardRef<HTMLDivElement, PropsWithChildren<BadgeProps>>(
  (props, ref) => {
    const defaultTheme = useContext(ThemeContext);

    const currentColorScheme = defaultTheme?.currentColorScheme;

    return (
      <StyledBadgeTheme
        {...props}
        ref={ref}
        $currentColorScheme={currentColorScheme || ({} as TColorScheme)}
      />
    );
  },
);

BadgeTheme.displayName = "BadgeTheme";

export { BadgeTheme };
