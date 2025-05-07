import { Meta, StoryObj } from "@storybook/react";

import BreadCrumbsLoader from "./BreadCrumbs";

const meta = {
  title: "Skeletons/Selector/BreadCrumbs",
  component: BreadCrumbsLoader,
  parameters: {
    docs: {
      description: {
        component: "Loading skeleton for breadcrumb navigation",
      },
    },
  },
  argTypes: {
    style: {
      control: "object",
      description: "Custom styles for the container",
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BreadCrumbsLoader>;

export default meta;

type BreadCrumbsStory = StoryObj<typeof BreadCrumbsLoader>;

export const Default: BreadCrumbsStory = {
  args: {
    style: { margin: "20px" },
  },
};
