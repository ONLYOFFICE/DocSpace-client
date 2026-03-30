import React from "react";
import { render } from "@testing-library/react";
import { ThemeProviderComponent } from "@docspace/ui-kit/components/theme-provider";
import { Base, TTheme } from "@docspace/ui-kit/providers/theme";

const defaultTheme: TTheme = {
  ...Base,
};

export const renderWithTheme = (
  ui: React.ReactNode,
  theme: TTheme = defaultTheme,
) => {
  return render(
    <ThemeProviderComponent theme={theme}>{ui}</ThemeProviderComponent>,
  );
};
