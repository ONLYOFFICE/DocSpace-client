import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { ArticleProfileLoader } from ".";
import { ProfileLoaderProps } from "./ProfileLoader.types";

export default {
  title: "Skeletons/article/ArticleProfileLoader",
  component: ArticleProfileLoader,
  parameters: {
    docs: {
      description: {
        component: "A skeleton loader component for article profile sections",
      },
    },
  },
} as Meta;

const Template: StoryFn<ProfileLoaderProps> = (args) => (
  <div style={{ position: "relative", height: "200px", width: "300px" }}>
    <ArticleProfileLoader {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  showText: true,
};

export const WithoutText = Template.bind({});
WithoutText.args = {
  showText: false,
};

export const CustomStyle = Template.bind({});
CustomStyle.args = {
  showText: true,
  style: {
    position: "static",
    margin: "20px",
    border: "1px solid #ccc",
  },
};
