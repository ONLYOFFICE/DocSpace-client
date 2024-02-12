import React from "react";
import { Meta, StoryObj } from "@storybook/react";

import { LinkWithDropdown } from "./LinkWithDropdown";

import { LinkWithDropDownProps } from "./LinkWithDropdown.types";

const meta = {
  title: "Components/LinkWithDropdown",
  component: LinkWithDropdown,
  parameters: { docs: { description: { component: "Link with dropdown" } } },
  argTypes: {
    color: { control: "color" },
    dropdownType: { required: false },
    // linkLabel: { control: "text", description: "Link text" },
    // onItemClick: { action: "Button action", table: { disable: true } },
  },
} satisfies Meta<typeof LinkWithDropdown>;
type Story = StoryObj<typeof meta>;

export default meta;

const Template = ({ ...args }: LinkWithDropDownProps) => {
  const dropdownItems = [
    {
      key: "key1",
      label: "Button 1",
      onClick: () => {},
    },
    {
      key: "key2",
      label: "Button 2",
      onClick: () => {},
    },
    {
      key: "key3",
      isSeparator: true,
    },
    {
      key: "key4",
      label: "Button 3",
      onClick: () => {},
    },
  ];
  return (
    <LinkWithDropdown {...args} data={dropdownItems}>
      Test link
    </LinkWithDropdown>
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    fontSize: "13px",
    fontWeight: 400,
    isBold: false,
    isTextOverflow: false,
    isSemitransparent: false,
  },
};
