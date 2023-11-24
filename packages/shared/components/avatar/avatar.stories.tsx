import { Meta, StoryObj } from "@storybook/react";

import AtReactSvgUrl from "PUBLIC_DIR/images/@.react.svg?url";

import { Avatar, AvatarRole, AvatarSize } from ".";

const meta = {
  title: "Components/Avatar",
  component: Avatar,
  argTypes: {
    editAction: { action: "editAction" },
  },
  parameters: {
    docs: {
      description: {
        component: "Used to display an avatar or brand.",
      },
    },
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?type=design&node-id=878-37278&mode=design&t=TBNCKMQKQMxr44IZ-0",
    },
  },
} satisfies Meta<typeof Avatar>;
type Story = StoryObj<typeof Avatar>;

export default meta;

export const Default: Story = {
  args: {
    size: AvatarSize.max,
    role: AvatarRole.owner,
    source: "",
    userName: "",
    editing: false,
    hideRoleIcon: false,
    tooltipContent: "",
    withTooltip: false,
  },
};

export const Picture: Story = {
  args: {
    size: AvatarSize.max,
    role: AvatarRole.admin,
    source:
      "https://images.unsplash.com/photo-1623949444573-4811dfc64771?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80",
    userName: "",
    editing: false,
    hideRoleIcon: false,
    tooltipContent: "",
    withTooltip: false,
  },
};

export const Initials: Story = {
  args: {
    size: AvatarSize.max,
    role: AvatarRole.guest,
    source: "",
    userName: "John Doe",
    editing: false,
    hideRoleIcon: false,
    tooltipContent: "",
    withTooltip: false,
  },
};

export const Icon: Story = {
  args: {
    size: AvatarSize.max,
    role: AvatarRole.user,
    source: AtReactSvgUrl,
    userName: "",
    editing: false,
    hideRoleIcon: false,
    tooltipContent: "",
    withTooltip: false,
  },
};
