import { Meta, StoryObj } from "@storybook/react";

import { TagPure } from "./Tag";

const meta = {
  title: "Components/Tag",
  component: TagPure,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?type=design&node-id=62-2597&mode=design&t=TBNCKMQKQMxr44IZ-0",
    },
  },
} satisfies Meta<typeof TagPure>;
type Story = StoryObj<typeof TagPure>;

export default meta;

export const Default: Story = {
  args: {
    tag: "script",
    label: "Script",
    isNewTag: false,
    isDisabled: false,
    onDelete: () => {},
    onClick: () => {},

    tagMaxWidth: "160px",
    id: "",
    className: "",
    style: { color: "red" },
  },
};

export const WithDropDown: Story = {
  args: {
    tag: "script",
    label: "Script",
    isNewTag: false,
    isDisabled: false,
    onDelete: () => {},
    onClick: () => {},
    advancedOptions: ["Option 1", "Option 2"],
  },
};

export const NewTag: Story = {
  args: {
    tag: "script",
    label: "Script",
    isNewTag: true,
    isDisabled: false,
    onDelete: () => {},
    onClick: () => {},
  },
};

export const DisabledTag: Story = {
  args: {
    tag: "script",
    label: "No tag",
    isNewTag: false,
    isDisabled: true,
    onDelete: () => {},
    onClick: () => {},
  },
};
