import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { ArticleButtonLoader } from ".";
import { ButtonLoaderProps } from "./ArticleButtonLoader.types";

export default {
  title: "Skeletons/article/ArticleButtonLoader",
  component: ArticleButtonLoader,
  parameters: {
    docs: {
      description: {
        component: "A skeleton loader component for article buttons",
      },
    },
  },
} as Meta;

const Template: StoryFn<ButtonLoaderProps> = (args) => (
  <ArticleButtonLoader {...args} />
);

export const Default = Template.bind({});
Default.args = {
  width: `211px`,
  height: `32px`,
  borderRadius: "3px",
  backgroundColor: "#ECEEF1",
  foregroundColor: "#F8F9F9",
  backgroundOpacity: 1,
  foregroundOpacity: 1,
  speed: 1,
  animate: true,
};

export const CustomSized = Template.bind({});
CustomSized.args = {
  ...Default.args,
  width: `150px`,
  height: `40px`,
};

export const CustomColors = Template.bind({});
CustomColors.args = {
  ...Default.args,
  backgroundColor: "#E5E5E5",
  foregroundColor: "#F0F0F0",
};

export const NoAnimation = Template.bind({});
NoAnimation.args = {
  ...Default.args,
  animate: false,
};

export const CustomStyle = Template.bind({});
CustomStyle.args = {
  ...Default.args,
  style: {
    margin: "20px",
    padding: "10px",
    border: "1px solid #ccc",
  },
};
