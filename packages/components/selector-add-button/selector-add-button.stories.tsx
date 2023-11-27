import React from "react";
import SelectorAddButton from "./";

export default {
  title: "Components/SelectorAddButton",
  component: SelectorAddButton,
  argTypes: { onClick: { action: "onClose" } },
};

const Template = ({
  onClick,
  ...args
}: any) => {
  return (
    <SelectorAddButton
      onClick={(e) => {
        !args.isDisabled && onClick(e);
      }}
    />
  );
};

export const Default = Template.bind({});
// @ts-expect-error TS(2339): Property 'args' does not exist on type '({ onClick... Remove this comment to see the full error message
Default.args = {
  isDisabled: false,
  title: "Add item",
};
