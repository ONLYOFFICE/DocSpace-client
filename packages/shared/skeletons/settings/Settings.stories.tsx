import { Meta, StoryObj } from "@storybook/react";

import {
  SettingsCommonSkeleton,
  SettingsDSConnectSkeleton,
  SettingsHeaderSkeleton,
  SettingsSMTPSkeleton,
  SettingsStorageManagementSkeleton,
} from "./index";

const meta = {
  title: "Skeletons/Settings",
  parameters: {
    docs: {
      description: {
        component: "Loading skeletons for settings pages",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type CommonStory = StoryObj<typeof SettingsCommonSkeleton>;
type DSConnectStory = StoryObj<typeof SettingsDSConnectSkeleton>;
type HeaderStory = StoryObj<typeof SettingsHeaderSkeleton>;
type SMTPStory = StoryObj<typeof SettingsSMTPSkeleton>;
type StorageStory = StoryObj<typeof SettingsStorageManagementSkeleton>;

export const Common: CommonStory = {
  render: () => <SettingsCommonSkeleton />,
};

export const DSConnect: DSConnectStory = {
  render: () => <SettingsDSConnectSkeleton />,
};

export const Header: HeaderStory = {
  render: () => <SettingsHeaderSkeleton />,
};

export const SMTP: SMTPStory = {
  render: () => <SettingsSMTPSkeleton />,
};

export const StorageManagement: StorageStory = {
  render: () => <SettingsStorageManagementSkeleton />,
};
