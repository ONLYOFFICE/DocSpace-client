import React from "react";
import styled from "styled-components";
import { Meta, StoryObj } from "@storybook/react";

import { SaveCancelButtons } from "./SaveCancelButton";
import { SaveCancelButtonProps } from "./SaveCancelButton.types";

const meta = {
  title: "Components/SaveCancelButtons",
  component: SaveCancelButtons,
  parameters: {
    docs: {
      description: {
        component:
          "Save and cancel buttons are located in the settings sections.",
      },
    },
  },
  argTypes: {
    onSaveClick: { action: "onSaveClick" },
    onCancelClick: { action: "onCancelClick" },
  },
} satisfies Meta<typeof SaveCancelButtons>;
type Story = StoryObj<typeof meta>;

export default meta;

const StyledWrapper = styled.div`
  position: relative;
  height: 300px;

  .positionAbsolute {
    position: absolute;
  }
`;

const Template = ({
  onSaveClick,
  onCancelClick,
  ...args
}: SaveCancelButtonProps) => {
  const isAutoDocs =
    typeof window !== "undefined" && window?.location?.href.includes("docs");

  return (
    <StyledWrapper>
      <SaveCancelButtons
        {...args}
        className={
          isAutoDocs && !args.displaySettings
            ? `positionAbsolute ${args.className}`
            : args.className
        }
        onSaveClick={() => onSaveClick?.()}
        onCancelClick={() => onCancelClick?.()}
      />
    </StyledWrapper>
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    showReminder: false,
    reminderText: "You have unsaved changes",
    saveButtonLabel: "Save",
    cancelButtonLabel: "Cancel",
  },
};
