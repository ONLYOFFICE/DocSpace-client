import React from "react";
import { StoryFn, Meta } from "@storybook/react";
import PublicRoomBar from "./index";
import { PublicRoomBarProps } from "./PublicRoomBar.types";

export default {
  title: "Base UI Components/PublicRoomBar",
  component: PublicRoomBar,
  argTypes: {
    headerText: {
      control: "text",
      description: "Header text or component to be displayed",
    },
    bodyText: {
      control: "text",
      description: "Body text or component to be displayed",
    },
    iconName: {
      control: "text",
      description: "Custom icon path (optional)",
    },
    barIsVisible: {
      control: "boolean",
      description: "Controls the visibility of the bar",
    },
    onClose: {
      action: "clicked",
      description: "Callback function when close button is clicked",
    },
  },
} as Meta;

const Template: StoryFn<PublicRoomBarProps> = (args) => (
  <PublicRoomBar {...args} />
);

export const Default = Template.bind({});
Default.args = {
  headerText: "Public Room",
  bodyText: "This room is accessible to anyone with the link",
  barIsVisible: false,
};

export const WithCustomIcon = Template.bind({});
WithCustomIcon.args = {
  ...Default.args,
  iconName: "custom-icon-path.svg",
};

export const WithoutCloseButton = Template.bind({});
WithoutCloseButton.args = {
  ...Default.args,
  onClose: undefined,
};

export const WithCustomComponents = Template.bind({});
WithCustomComponents.args = {
  headerText: <div style={{ color: "blue" }}>Custom Header Component</div>,
  bodyText: <div style={{ fontStyle: "italic" }}>Custom Body Component</div>,
  barIsVisible: true,
};

export const Visible = Template.bind({});
Visible.args = {
  ...Default.args,
  barIsVisible: true,
};
