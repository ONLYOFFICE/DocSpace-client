import * as React from "react";
import { MINIMAL_VIEWPORTS } from "@storybook/addon-viewport";
import { useDarkMode } from "storybook-dark-mode";
import { I18nextProvider } from "react-i18next";
import { Base, Dark } from "../themes/index";
import "PUBLIC_DIR/css/fonts.css";
import ThemeWrapper from "./globals/theme-wrapper";
import { DocsContainer } from "./DocsContainer";
import globalTypes from "./globals";
import { initialize, mswLoader } from "msw-storybook-addon";
// import "../index";

import lightTheme from "./lightTheme";
import darkTheme from "./darkTheme";
import StorybookGlobalStyles from "./styles/StorybookGlobalStyles";
import i18n from "./i18n";

initialize({
  onUnhandledRequest: (req, print) => {
    const url = new URL(req.url);

    // Ignore requests to fetch static images.
    if (url.pathname.includes("/images/")) {
      return;
    }

    print.warning();
  },
});

const preview = {
  globalTypes,
  parameters: {
    backgrounds: { disable: true },
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: { expanded: true },
    docs: {
      container: DocsContainer,
    },
    viewport: {
      viewports: MINIMAL_VIEWPORTS,
    },
    previewTabs: {
      "storybook/docs/panel": {
        hidden: true,
      },
    },
    darkMode: {
      light: lightTheme,
      dark: darkTheme,
    },
  },
  decorators: [
    (Story) => (
      <I18nextProvider i18n={i18n}>
        <Story />
      </I18nextProvider>
    ),
    (Story, context) => {
      const theme = useDarkMode() ? Dark : Base;
      const interfaceDirection = context.globals.direction;

      return (
        <ThemeWrapper theme={{ ...theme, interfaceDirection }}>
          <StorybookGlobalStyles />
          <Story />
        </ThemeWrapper>
      );
    },
  ],
  tags: ["autodocs"],
  loaders: [mswLoader],
};

export default preview;
