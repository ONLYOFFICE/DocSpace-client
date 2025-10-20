import React from "react";
import { Meta, StoryFn } from "@storybook/react";

import { MobileCategoryWrapper } from "./index";
import { IMobileCategoryWrapperProps } from "./MobileCategoryWrapper.types";

export default {
  title: "Components/MobileCategoryWrapper",
  component: MobileCategoryWrapper,
  parameters: {
    docs: {
      description: {
        component:
          "Mobile category wrapper component with title, subtitle, and optional paid badge",
      },
    },
  },
  argTypes: {
    title: {
      control: "text",
      description: "Title of the category",
    },
    subtitle: {
      control: "text",
      description: "Subtitle or description of the category",
    },
    url: {
      control: "text",
      description: "URL for the link",
    },
    isDisabled: {
      control: "boolean",
      description: "Disable the category wrapper",
    },
    withPaidBadge: {
      control: "boolean",
      description: "Show paid badge",
    },
    badgeLabel: {
      control: "text",
      description: "Text for the paid badge",
    },
    onClickLink: {
      action: "clicked",
      description: "Click handler for the link",
    },
  },
} as Meta;

const Template: StoryFn<IMobileCategoryWrapperProps> = (args) => (
  <MobileCategoryWrapper {...args} />
);

export const Default = Template.bind({});
Default.args = {
  title: "Category Title",
  subtitle: "This is a description of the category that provides more details",
  url: "#",
  isDisabled: false,
  withPaidBadge: false,
  badgeLabel: "PRO",
};

export const WithPaidBadge = Template.bind({});
WithPaidBadge.args = {
  ...Default.args,
  withPaidBadge: true,
  badgeLabel: "PRO",
};

export const Disabled = Template.bind({});
Disabled.args = {
  ...Default.args,
  isDisabled: true,
};
