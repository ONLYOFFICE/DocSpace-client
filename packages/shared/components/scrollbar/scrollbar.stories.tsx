import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Scrollbar, ScrollbarType } from ".";

const meta = {
  title: "Components/Scrollbar",
  component: Scrollbar,
  parameters: {
    docs: {
      description: {
        component: "Scrollbar is used for displaying custom scrollbar",
      },
    },
  },
} satisfies Meta<typeof Scrollbar>;
type Story = StoryObj<typeof Scrollbar>;

export default meta;

export const Default: Story = {
  render: (args) => (
    <Scrollbar {...args}>
      ================================================================ Lorem
      ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
      incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
      nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
      consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
      cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
      non proident, sunt in culpa qui officia deserunt mollit anim id est
      laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
      eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
      minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
      ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
      velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
      cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
      est laborum.
      ================================================================
    </Scrollbar>
  ),
  args: {
    stype: ScrollbarType.mediumBlack,
    style: { width: 300, height: 200 },
  },
};
