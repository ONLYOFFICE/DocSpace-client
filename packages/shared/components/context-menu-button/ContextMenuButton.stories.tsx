import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";

import VerticalDotsReactSvgUrl from "PUBLIC_DIR/images/vertical-dots.react.svg?url";

import { ContextMenuButton } from "./ContextMenuButton";
import { ContextMenuButtonProps } from "./ContextMenuButton.types";
import { ContextMenuButtonDisplayType } from "./ContextMenuButton.enums";

const meta = {
  title: "Components/ContextMenuButton",
  component: ContextMenuButton,
  argTypes: {
    clickColor: { control: "color" },
    color: { control: "color" },
    getData: { required: true },
    hoverColor: { control: "color" },
    // onClickLabel: { action: "onClickLabel", table: { disable: true } },
    onMouseLeave: { action: "onMouseLeave" },
    onMouseEnter: { action: "onMouseEnter" },
    onMouseOver: { action: "onMouseOver" },
    onMouseOut: { action: "onMouseOut" },
  },
  parameters: {
    docs: {
      description: {
        component: `ContextMenuButton is used for displaying context menu actions on a list's item`,
      },
    },
  },
} satisfies Meta<typeof ContextMenuButton>;
type Story = StoryObj<typeof meta>;

export default meta;

const Template = (args: ContextMenuButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const onClickHandler = () => {
    setIsOpen(!isOpen);
  };
  return (
    <div style={{ height: "100px" }}>
      <ContextMenuButton
        {...args}
        opened={isOpen}
        isDisabled={false}
        onClick={onClickHandler}
      />
    </div>
  );
};

const getData = () => {
  return [
    {
      key: "key1",
      label: "label1",
    },
    {
      key: "key2",
      label: "label2",
    },
  ];
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    title: "Actions",
    displayType: ContextMenuButtonDisplayType.dropdown,
    iconName: VerticalDotsReactSvgUrl,
    size: 16,
    directionX: "left",
    isDisabled: false,
    data: [],
    getData,
  },
};
