import React from "react";
import { storiesOf } from "@storybook/react";
import {
  withKnobs,
  boolean,
  text,
  color,
  number,
} from "@storybook/addon-knobs/react";
import Section from "../../../../.storybook/decorators/section";

import Loaders from "../../../../common/components/Loaders";
import { LOADER_STYLE } from "@docspace/shared/constants";
import withReadme from "storybook-readme/with-readme";
import Readme from "./README.md";

storiesOf("Components|Loaders", module)
  .addDecorator(withKnobs)
  .addDecorator(withReadme(Readme))
  .add("main button loader", () => (
    <Section>
      <h1>Main Button Loader</h1>
      <Loaders.MainButton
        title={text("title", LOADER_STYLE.title)}
        width={text("width", "100%")}
        height={text("height", "32px")}
        borderRadius={text("border radius", "3")}
        backgroundColor={color("backgroundColor", LOADER_STYLE.backgroundColor)}
        foregroundColor={color("foregroundColor", LOADER_STYLE.foregroundColor)}
        backgroundOpacity={number(
          "backgroundOpacity",
          LOADER_STYLE.backgroundOpacity,
        )}
        foregroundOpacity={number(
          "foregroundOpacity",
          LOADER_STYLE.foregroundOpacity,
        )}
        speed={number("speed", LOADER_STYLE.speed)}
        animate={boolean("animate", LOADER_STYLE.animate)}
      />
    </Section>
  ));
