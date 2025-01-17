import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Aside } from ".";
import type { AsideProps } from "./Aside.types";

const meta = {
  title: "Base UI Components/Aside",
  component: Aside,
  parameters: {
    docs: {
      description: {
        component:
          "Aside component provides a sliding panel that can contain any content. It can be shown/hidden and customized with various styling options.",
      },
    },
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div style={{ height: "60vh" }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    visible: {
      control: "boolean",
      description: "Controls the visibility of the aside panel",
      defaultValue: true,
    },
    scale: {
      control: "boolean",
      description: "Enables scaling animation",
      defaultValue: false,
    },
    zIndex: {
      control: { type: "number", min: 0 },
      description: "Sets the z-index of the aside panel",
      defaultValue: 400,
    },
    withoutHeader: {
      control: "boolean",
      description: "Removes the header section if true",
      defaultValue: false,
    },
    withoutBodyScroll: {
      control: "boolean",
      description: "Disables body scroll when aside is open",
      defaultValue: false,
    },
    className: {
      control: "text",
      description: "Additional CSS class names",
    },
    onClose: {
      description: "Callback function when the aside is closed",
    },
  },
} as Meta<typeof Aside>;

export default meta;
type Story = StoryObj<AsideProps>;

const ExampleContent = () => (
  <div style={{ padding: "20px" }}>
    <h3>Aside Content</h3>
    <p>
      This is an example of content that can be placed inside the Aside
      component.
    </p>
    <p>The aside panel can be customized using various props:</p>
    <ul>
      <li>visible - show/hide the panel</li>
      <li>scale - enable scaling animation</li>
      <li>zIndex - control stacking order</li>
      <li>withoutHeader - remove header section</li>
      <li>withoutBodyScroll - disable body scroll</li>
    </ul>
  </div>
);

export const Default: Story = {
  args: {
    visible: true,
    onClose: () => console.log("Close clicked"),
    children: <ExampleContent />,
  },
};

export const WithoutHeader: Story = {
  args: {
    ...Default.args,
    withoutHeader: true,
  },
};

export const WithScaling: Story = {
  args: {
    ...Default.args,
    scale: true,
  },
};
