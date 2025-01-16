import React from "react";
import { render } from "@testing-library/react";
import { ThemeProvider } from "../components/theme-provider";
import { Base, TTheme } from "../themes";

const defaultTheme: TTheme = {
  ...Base,
};

export const renderWithTheme = (
  ui: React.ReactNode,
  theme: TTheme = defaultTheme,
) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};
