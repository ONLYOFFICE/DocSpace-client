import React, { useState } from "react";
import FieldContainer from ".";
import TextInput from "../text-input";

export default {
  title: "Components/FieldContainer",
  component: FieldContainer,
  argTypes: {
    errorColor: { control: "color" },
  },
  parameters: {
    docs: {
      description: {
        component: "Responsive form field container",
      },
    },
  },
};

const Template = (args: any) => {
  const [value, setValue] = useState("");
  return (
    <FieldContainer {...args}>
      <TextInput
        value={value}
        hasError={args.hasError}
        className="field-input"
        onChange={(e: any) => {
          setValue(e.target.value);
        }}
      />
    </FieldContainer>
  );
};

export const Default = Template.bind({});
// @ts-expect-error TS(2339): Property 'args' does not exist on type '(args: any... Remove this comment to see the full error message
Default.args = {
  isVertical: false,
  isRequired: false,
  hasError: false,
  labelVisible: true,
  labelText: "Name:",
  maxLabelWidth: "110px",
  tooltipContent: "Paste you tooltip content here",
  helpButtonHeaderContent: "Tooltip header",
  place: "top",
  errorMessage:
    "Error text. Lorem ipsum dolor sit amet, consectetuer adipiscing elit",
  errorColor: "#C96C27",
  errorMessageWidth: "293px",
  removeMargin: false,
};
