import React, { useState } from "react";

import Backdrop from "./";
import Button from "../button";

export default {
  title: "Components/Backdrop",
  component: Backdrop,
  subcomponents: { Button },
  argTypes: {
    onClick: { action: "On Hide", table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        component: "Backdrop for displaying modal dialogs or other components",
      },
    },
  },
};

const Template = (args: any) => {
  const [isVisible, setIsVisible] = useState(args.visible);
  const toggleVisible = () => setIsVisible(!isVisible);
  return <>
    <Button
      // @ts-expect-error TS(2322): Type '{ label: string; primary: true; size: string... Remove this comment to see the full error message
      label="Show Backdrop"
      primary
      size="small"
      onClick={toggleVisible}
    />
    <Backdrop
      {...args}
      visible={isVisible}
      onClick={(e: any) => {
        args.onClick(e);
        // @ts-expect-error TS(2554): Expected 0 arguments, but got 1.
        toggleVisible(false);
      }}
    />
  </>;
};

export const Default = Template.bind({});
// @ts-expect-error TS(2339): Property 'args' does not exist on type '(args: any... Remove this comment to see the full error message
Default.args = {
  withBackground: true,
};
