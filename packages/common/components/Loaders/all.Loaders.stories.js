import React from "react";
import { storiesOf } from "@storybook/react";
import Section from "../../../.storybook/decorators/section";

import Loaders from ".";

storiesOf("Components|TTT", module)
  .addParameters({ options: { showAddonPanel: false } })
  .add("all", () => (
    <Section>
      <h1>Base loader</h1>

      <h1>Article Header Loader</h1>
      <Loaders.ArticleHeader />

      <h1>Filter loader</h1>
      <Loaders.Filter />

      <h1>Section Header loader</h1>
      <Loaders.SectionHeader />

      <h1>Tree Folders loader</h1>
      <Loaders.TreeFolders />

      <h1>Main Button loader</h1>
      <Loaders.MainButton />
    </Section>
  ));
