import React from "react";
import { Meta, StoryFn } from "@storybook/react";

import AutoBackupLoader from "./AutoBackup";
import { BackupLoaderProps } from "./Backup.types";

export default {
  title: "Skeletons/backup/AutoBackup",
  component: AutoBackupLoader,
  parameters: {
    docs: {
      description: {
        component: "A skeleton loader component for the auto backup section",
      },
    },
  },
  argTypes: {
    title: {
      control: "text",
      description: "Title for accessibility",
      defaultValue: "Auto Backup",
    },
    borderRadius: {
      control: "text",
      description: "Border radius of the skeleton elements",
      defaultValue: "3px",
    },
    backgroundColor: {
      control: "color",
      description: "Background color of the skeleton",
      defaultValue: "#eee",
    },
    foregroundColor: {
      control: "color",
      description: "Foreground color of the skeleton animation",
      defaultValue: "#ddd",
    },
    backgroundOpacity: {
      control: { type: "range", min: 0, max: 1, step: 0.1 },
      description: "Opacity of the background",
      defaultValue: 0.2,
    },
    foregroundOpacity: {
      control: { type: "range", min: 0, max: 1, step: 0.1 },
      description: "Opacity of the foreground animation",
      defaultValue: 0.4,
    },
    speed: {
      control: { type: "range", min: 0.5, max: 3, step: 0.1 },
      description: "Speed of the animation",
      defaultValue: 1,
    },
    animate: {
      control: "boolean",
      description: "Whether to show the animation",
      defaultValue: true,
    },
  },
} as Meta;

const Template: StoryFn<BackupLoaderProps> = (args) => (
  <AutoBackupLoader {...args} />
);

export const Default = Template.bind({});
Default.args = {
  title: "Auto Backup",
  borderRadius: "3px",
  backgroundColor: "#eee",
  foregroundColor: "#ddd",
  backgroundOpacity: 0.2,
  foregroundOpacity: 0.4,
  speed: 1,
  animate: true,
};

export const Dark = Template.bind({});
Dark.args = {
  ...Default.args,
  backgroundColor: "#333",
  foregroundColor: "#444",
};
Dark.parameters = {
  backgrounds: { default: "dark" },
};

export const NoAnimation = Template.bind({});
NoAnimation.args = {
  ...Default.args,
  animate: false,
};

export const CustomColors = Template.bind({});
CustomColors.args = {
  ...Default.args,
  backgroundColor: "#e3f2fd",
  foregroundColor: "#bbdefb",
  backgroundOpacity: 0.3,
  foregroundOpacity: 0.5,
};

export const CustomSizing = Template.bind({});
CustomSizing.args = {
  ...Default.args,
  borderRadius: "8px",
};
