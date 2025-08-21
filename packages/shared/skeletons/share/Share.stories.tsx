import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { useTranslation } from "react-i18next";
import ShareSkeleton from "./index";
import i18nextStoryDecorator from "../../.storybook/decorators/i18nextStoryDecorator";

const ShareSkeletonWithTranslation = (props: any) => {
  const { t } = useTranslation();
  return <ShareSkeleton t={t} {...props} />;
};

export default {
  title: "Skeletons/Share",
  component: ShareSkeletonWithTranslation,
  decorators: [i18nextStoryDecorator],
} as Meta;

const Template: StoryFn = (args) => <ShareSkeletonWithTranslation {...args} />;

export const Default = Template.bind({});
Default.args = {};
