import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { BrowserRouter } from "react-router";

import EmptyScreenOauthLightSvg from "PUBLIC_DIR/images/emptyview/empty.oauth2.light.svg";
import EmptyFilterRoomsLightIcon from "PUBLIC_DIR/images/emptyFilter/empty.filter.rooms.light.svg";
import ClearEmptyFilterSvg from "PUBLIC_DIR/images/clear.empty.filter.svg";
import { EmptyView } from ".";
import type { EmptyViewProps } from "./EmptyView.types";

const meta = {
  title: "Layout components/EmptyView",
  component: EmptyView,
  parameters: {
    docs: {
      description: {
        component:
          "Empty state component with customizable icon, title, description and action options",
      },
    },
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
} satisfies Meta<typeof EmptyView>;
export default meta;
type Story = StoryObj<typeof EmptyView>;

const Template = ({ ...args }: EmptyViewProps) => {
  return <EmptyView {...args} />;
};

export const Default: Story = {
  render: Template,
  args: {
    icon: <EmptyFilterRoomsLightIcon />,
    title: "Empty Folder",
    description: "This folder is empty. Add files or folders to get started.",
    options: [
      {
        key: "upload",
        icon: <ClearEmptyFilterSvg />,
        to: "#",
        description: "Clear Filter",
        onClick: () => console.log("Upload clicked"),
      },
    ],
  },
};

export const NoOptions: Story = {
  render: Template,
  args: {
    icon: <EmptyScreenOauthLightSvg />,
    title: "No Files Found",
    description: "There are no files matching your search criteria.",
  },
};
