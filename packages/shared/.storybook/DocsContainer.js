import React, { useState, useEffect } from "react";
import { DocsContainer as BaseContainer } from "@storybook/blocks";
import { addons } from "@storybook/preview-api";
import darkTheme from "./darkTheme";
import lightTheme from "./lightTheme";

const DARK_MODE_EVENT_NAME = "DARK_MODE";

export const DocsContainer = ({ children, context }) => {
  const [isDark, setIsDark] = useState(
    document.body.classList.contains("dark"),
  );

  useEffect(() => {
    const chan = addons.getChannel();
    chan.on(DARK_MODE_EVENT_NAME, setIsDark);
    return () => chan.off(DARK_MODE_EVENT_NAME, setIsDark);
  }, []);

  return (
    <BaseContainer context={context} theme={isDark ? darkTheme : lightTheme}>
      {children}
    </BaseContainer>
  );
};
