import React from "react";
import FacebookButton from ".";

export default {
  title: "Components/FacebookButton",
  component: FacebookButton,
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
  return (
    <div style={{ width: 100 }}>
      <FacebookButton {...args} />
    </div>
  );
};

export const Default = Template.bind({});
// @ts-expect-error TS(2339): Property 'args' does not exist on type '(args: any... Remove this comment to see the full error message
Default.args = {
  label: "facebook",
};
