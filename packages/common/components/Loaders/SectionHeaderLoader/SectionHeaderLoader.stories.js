import React from "react";
import { storiesOf } from "@storybook/react";
import {
  withKnobs,
  text,
  boolean,
  color,
  number,
} from "@storybook/addon-knobs/react";
import Section from "../../../../.storybook/decorators/section";

import Loaders from "..";
import { LOADER_STYLE } from "@docspace/shared/constants";
import withReadme from "storybook-readme/with-readme";
import Readme from "./README.md";

storiesOf("Components|Loaders", module)
  .addDecorator(withKnobs)
  .addDecorator(withReadme(Readme))
  .add("section header loader", () => (
    <Section>
      <h1>Section Header Loader</h1>
      <Loaders.SectionHeader
        title={text("title", LOADER_STYLE.title)}
        borderRadius={text("borderRadius", "3")}
        backgroundColor={color("backgroundColor", LOADER_STYLE.backgroundColor)}
        foregroundColor={color("foregroundColor", LOADER_STYLE.foregroundColor)}
        backgroundOpacity={number(
          "backgroundOpacity",
          LOADER_STYLE.backgroundOpacity
        )}
        foregroundOpacity={number(
          "foregroundOpacity",
          LOADER_STYLE.foregroundOpacity
        )}
        speed={number("speed", LOADER_STYLE.speed)}
        animate={boolean("animate", LOADER_STYLE.animate)}
      />
    </Section>
  ));
