import React, { Suspense } from "react";
import { I18nextProvider } from "react-i18next";
import type { StoryFn } from "@storybook/react";

import i18n from "../i18n";

const i18nextStoryDecorator = (Story: StoryFn) => {
  return (
    // here catches the suspense from components not yet ready (still loading translations)
    // alternative set useSuspense false on i18next.options.react when initializing i18next
    <Suspense fallback={<div>loading translations...</div>}>
      <I18nextProvider i18n={i18n}>
        <Story />
      </I18nextProvider>
    </Suspense>
  );
};

export default i18nextStoryDecorator;
