import { FC } from "react";
import { Meta, StoryObj } from "@storybook/react";

import Headline from "./Headline";
import type { HeadlineProps } from "./Headline.types";

type HeadlineType = FC<HeadlineProps>;

const meta: Meta<HeadlineType> = {
  title: "Components/Headline",
  component: Headline,
};

export default meta;

export const Default: StoryObj<HeadlineType> = {
  args: {
    color: "#333",
    type: "content",
    children: "Sample text heading",
  },
};
