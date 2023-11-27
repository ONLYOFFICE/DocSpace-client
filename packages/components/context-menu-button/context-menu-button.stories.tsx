import React, { useState } from "react";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/vertical-dot... Remove this comment to see the full error message
import VerticalDotsReactSvgUrl from "PUBLIC_DIR/images/vertical-dots.react.svg?url";
import ContextMenuButton from "./";

export default {
  title: "Components/ContextMenuButton",
  component: ContextMenuButton,
  argTypes: {
    clickColor: { control: "color" },
    color: { control: "color" },
    getData: { required: true },
    hoverColor: { control: "color" },
    onClickLabel: { action: "onClickLabel", table: { disable: true } },
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
};

const Template = (args: any) => {
  const [isOpen, setIsOpen] = useState(args.opened);
  const getData = () => {
    return [
      {
        key: "key1",
        label: "label1",
        onClick: () => args.onClickLabel("label1"),
      },
      {
        key: "key2",
        label: "label2",
        onClick: () => args.onClickLabel("label2"),
      },
    ];
  };

  const onClickHandler = () => {
    setIsOpen(!isOpen);
    args.onClickLabel();
  };
  return (
    <div style={{ height: "100px" }}>
      <ContextMenuButton
        {...args}
        opened={isOpen}
        getData={getData}
        isDisabled={false}
        onClick={onClickHandler}
      />
    </div>
  );
};

export const Default = Template.bind({});
// @ts-expect-error TS(2339): Property 'args' does not exist on type '(args: any... Remove this comment to see the full error message
Default.args = {
  title: "Actions",
  displayType: "dropdown",
  iconName: VerticalDotsReactSvgUrl,
  size: 16,
  directionX: "left",
  isDisabled: false,
};
