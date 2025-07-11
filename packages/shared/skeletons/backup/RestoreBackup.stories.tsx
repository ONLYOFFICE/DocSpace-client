import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import RestoreBackupLoader from "./RestoreBackup";
import type { BackupLoaderProps } from "./Backup.types";

export default {
  title: "Skeletons/backup/RestoreBackupLoader",
  component: RestoreBackupLoader,
  argTypes: {
    borderRadius: {
      control: "text",
      description: "Border radius of the skeleton elements",
    },
    backgroundColor: {
      control: "color",
      description: "Background color of the skeleton",
    },
    foregroundColor: {
      control: "color",
      description: "Foreground color of the skeleton animation",
    },
    backgroundOpacity: {
      control: { type: "range", min: 0, max: 1, step: 0.1 },
      description: "Opacity of the background",
    },
    foregroundOpacity: {
      control: { type: "range", min: 0, max: 1, step: 0.1 },
      description: "Opacity of the foreground animation",
    },
    speed: {
      control: { type: "range", min: 0.5, max: 3, step: 0.5 },
      description: "Animation speed in seconds",
    },
    animate: {
      control: "boolean",
      description: "Whether to show animation",
    },
  },
} as Meta;

const Template: StoryFn<BackupLoaderProps> = (args) => (
  <RestoreBackupLoader {...args} />
);

export const Default = Template.bind({});
Default.args = {
  title: "Restore Backup Loader",
  borderRadius: "3px",
  backgroundColor: "#000000",
  foregroundColor: "#ffffff",
  backgroundOpacity: 0.2,
  foregroundOpacity: 0.4,
  speed: 1,
  animate: true,
};

export const Dark = Template.bind({});
Dark.args = {
  ...Default.args,
  backgroundColor: "#ffffff",
  foregroundColor: "#000000",
  backgroundOpacity: 0.1,
  foregroundOpacity: 0.3,
};

export const NoAnimation = Template.bind({});
NoAnimation.args = {
  ...Default.args,
  animate: false,
};

export const CustomColors = Template.bind({});
CustomColors.args = {
  ...Default.args,
  backgroundColor: "#e6e6e6",
  foregroundColor: "#b3b3b3",
  backgroundOpacity: 0.3,
  foregroundOpacity: 0.5,
};

export const CustomSizing = Template.bind({});
CustomSizing.args = {
  ...Default.args,
  style: {
    maxWidth: "800px",
    margin: "0 auto",
  },
};
