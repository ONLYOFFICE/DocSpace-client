import React from "react";
import { Meta, Story } from "@storybook/react";
import { ArticleHeaderLoader } from ".";
import { HeaderLoaderProps } from "./HeaderLoader.types";

export default {
  title: "Skeletons/article/ArticleHeaderLoader",
  component: ArticleHeaderLoader,
  parameters: {
    docs: {
      description: {
        component: "A skeleton loader component for article headers",
      },
    },
  },
} as Meta;

const Template: Story<HeaderLoaderProps> = (args) => (
  <ArticleHeaderLoader {...args} />
);

export const Default = Template.bind({});
Default.args = {
  showText: true,
  width: `210px`,
  height: `20px`,
  borderRadius: "3px",
  backgroundColor: "#ECEEF1",
  foregroundColor: "#F8F9F9",
  backgroundOpacity: 1,
  foregroundOpacity: 1,
  speed: 1,
  animate: true,
};

export const WithoutText = Template.bind({});
WithoutText.args = {
  ...Default.args,
  showText: false,
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
