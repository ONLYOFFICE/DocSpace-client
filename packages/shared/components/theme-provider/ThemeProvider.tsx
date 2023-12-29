import React from "react";
import { ThemeProvider as Provider } from "styled-components";

import { GlobalStyle } from "../global-style";

import { ThemeProviderProps } from "./ThemeProvider.types";

const ThemeProvider = ({
  theme,
  currentColorScheme,
  children,
}: ThemeProviderProps) => {
  return (
    <Provider theme={{ ...theme, currentColorScheme }}>
      <GlobalStyle />
      {children}
    </Provider>
  );
};

export default ThemeProvider;
