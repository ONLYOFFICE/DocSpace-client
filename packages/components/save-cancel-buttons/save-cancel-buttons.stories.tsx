import React from "react";
import styled from "styled-components";
import SaveCancelButtons from "./";

export default {
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
};

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
}: any) => {
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
        onSaveClick={() => onSaveClick("on Save button clicked")}
        onCancelClick={() => onCancelClick("on Cancel button clicked")}
      />
    </StyledWrapper>
  );
};

export const Default = Template.bind({});
// @ts-expect-error TS(2339): Property 'args' does not exist on type '({ onSaveC... Remove this comment to see the full error message
Default.args = {
  showReminder: false,
  reminderText: "You have unsaved changes",
  saveButtonLabel: "Save",
  cancelButtonLabel: "Cancel",
};
