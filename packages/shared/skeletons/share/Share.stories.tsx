import React from "react";
import { Meta, Story } from "@storybook/react";
import ShareSkeleton from "./index";

export default {
  title: "Skeletons/Share",
  component: ShareSkeleton,
} as Meta;

const mockT = (key: string) => key;

const Template: Story = (args) => <ShareSkeleton t={mockT} {...args} />;

export const Default = Template.bind({});
Default.args = {};

export const WithCustomTranslation = Template.bind({});
WithCustomTranslation.args = {
  t: (key: string) => `Translated: ${key}`,
};
