import React from "react";
import { storiesOf } from "@storybook/react";
import {
  withKnobs,
  text,
  boolean,
  color,
  number,
} from "@storybook/addon-knobs/react";
import Section from "../../../../.storybook/decorators/sectionBlue";

import Loaders from "..";
import { LOADER_STYLE } from "@docspace/shared/constants";
import styled from "styled-components";
import withReadme from "storybook-readme/with-readme";
import Readme from "./README.md";

const StyledH1 = styled.h1`
  padding-left: 16px;
`;

storiesOf("Components|Loaders", module)
  .addDecorator(withKnobs)
  .addDecorator(withReadme(Readme))
  .add("header loader", () => (
    <Section>
      <StyledH1>Header Loader</StyledH1>
      <Loaders.Header
        title={text("title", LOADER_STYLE.title)}
        borderRadius={text("borderRadius", "3")}
        backgroundColor={color("backgroundColor", "#fff")}
        foregroundColor={color("foregroundColor", "#fff")}
        backgroundOpacity={number("backgroundOpacity", 0.2)}
        foregroundOpacity={number("foregroundOpacity", 0.25)}
        speed={number("speed", LOADER_STYLE.speed)}
        animate={boolean("animate", LOADER_STYLE.animate)}
      />
    </Section>
  ));
