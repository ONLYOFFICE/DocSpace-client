import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { TableSkeleton } from "./index";

export default {
  title: "Skeletons/Table",
  component: TableSkeleton,
  argTypes: {
    count: {
      control: { type: "number", min: 1, max: 50 },
      defaultValue: 25,
    },
    backgroundColor: { control: "color" },
    foregroundColor: { control: "color" },
    backgroundOpacity: {
      control: { type: "number", min: 0, max: 1, step: 0.1 },
    },
    foregroundOpacity: {
      control: { type: "number", min: 0, max: 1, step: 0.1 },
    },
    speed: { control: { type: "number", min: 0.5, max: 3, step: 0.1 } },
    animate: { control: "boolean" },
  },
} as Meta;

const Template: StoryFn = (args) => <TableSkeleton {...args} />;

export const Default = Template.bind({});
Default.args = {};

export const CustomCount = Template.bind({});
CustomCount.args = {
  count: 5,
};

export const CustomColors = Template.bind({});
CustomColors.args = {
  count: 3,
  backgroundColor: "#e0e0e0",
  foregroundColor: "#f5f5f5",
};
