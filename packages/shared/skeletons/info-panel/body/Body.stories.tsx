import React from "react";
import { Meta, StoryObj } from "@storybook/react";

import InfoPanelBodyLoader from "./index";

const meta = {
  title: "Skeletons/InfoPanel/Body",
  component: InfoPanelBodyLoader,
  parameters: {
    docs: {
      description: {
        component: "Loading skeleton for the info panel body content",
      },
    },
  },
  argTypes: {
    view: {
      control: "select",
      options: [
        "members",
        "history",
        "details",
        "gallery",
        "noItem",
        "severalItems",
        "groups",
        "users",
      ],
      defaultValue: "users",
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof InfoPanelBodyLoader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    view: "users",
  },
  parameters: {
    docs: {
      description: {
        story: "Default body skeleton with sections, labels, and values",
      },
    },
  },
};

export const WithoutBorder: Story = {
  args: {
    view: "users",
  },
  parameters: {
    docs: {
      description: {
        story: "Body skeleton without section borders",
      },
    },
  },
};

export const CustomStyling: Story = {
  args: {
    view: "users",
  },
  decorators: [
    (Story) => (
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          border: "1px solid #ccc",
        }}
      >
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: "Body skeleton with custom styling and container",
      },
    },
  },
};
