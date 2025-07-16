import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import SettingsReactSvgUrl from "PUBLIC_DIR/images/settings.react.svg?url";

import { DropDownItem } from ".";
import { DropDownItemProps } from "./DropDownItem.types";

export default {
  title: "Base UI Components/DropDownItem",
  component: DropDownItem,
  parameters: {
    docs: {
      description: {
        component: "DropDownItem component for dropdown menus and lists",
      },
    },
  },
  argTypes: {
    onClick: { action: "clicked" },
  },
} as Meta;

const Template: StoryFn<DropDownItemProps> = (args) => (
  <DropDownItem {...args} />
);

export const Default = Template.bind({});
Default.args = {
  label: "Default Item",
};

export const WithIcon = Template.bind({});
WithIcon.args = {
  label: "Settings",
  icon: SettingsReactSvgUrl,
};

export const Disabled = Template.bind({});
Disabled.args = {
  label: "Disabled Item",
  disabled: true,
};

export const Selected = Template.bind({});
Selected.args = {
  label: "Selected Item",
  isSelected: true,
};

export const WithBadge = Template.bind({});
WithBadge.args = {
  label: "Notifications",
  icon: SettingsReactSvgUrl,
  isBeta: true,
};

export const WithToggle = Template.bind({});
WithToggle.args = {
  label: "Toggle Feature",
  withToggle: true,
  checked: false,
};

export const Submenu = Template.bind({});
Submenu.args = {
  label: "Submenu Item",
  isSubMenu: true,
};

export const Header = Template.bind({});
Header.args = {
  label: "Header Item",
  isHeader: true,
};

export const Separator = Template.bind({});
Separator.args = {
  isSeparator: true,
};

export const Modern = Template.bind({});
Modern.args = {
  label: "Modern Style",
  isModern: true,
  icon: SettingsReactSvgUrl,
};

export const WithTextOverflow = Template.bind({});
WithTextOverflow.args = {
  label:
    "This is a very long item label that should trigger text overflow ellipsis",
  textOverflow: true,
  minWidth: "200px",
};

export const ActiveDescendant = Template.bind({});
ActiveDescendant.args = {
  label: "Active Descendant",
  isActiveDescendant: true,
};
