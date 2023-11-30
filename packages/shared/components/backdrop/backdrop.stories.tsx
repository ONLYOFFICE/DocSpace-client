import React, { useState } from "react";

import { Meta, StoryObj } from "@storybook/react";

import { Button, ButtonSize } from "../button";
import { Backdrop } from ".";
import { BackdropProps } from "./Backdrop.types";

const meta = {
  title: "Components/Backdrop",
  component: Backdrop,
  // subcomponents: { Button },
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
} satisfies Meta<typeof Backdrop>;

type Story = StoryObj<typeof Backdrop>;

export default meta;

const Template = (args: BackdropProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const toggleVisible = () => setIsVisible(!isVisible);

  return (
    <>
      <Button
        label="Show Backdrop"
        primary
        size={ButtonSize.medium}
        onClick={toggleVisible}
      />
      <Backdrop
        {...args}
        visible={isVisible}
        onClick={() => {
          toggleVisible();
        }}
      />
    </>
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: { withBackground: true },
};
