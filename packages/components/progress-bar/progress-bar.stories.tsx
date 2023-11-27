import React from "react";
import ProgressBar from "./";

export default {
  title: "Components/ProgressBar",
  component: ProgressBar,
  parameters: {
    docs: {
      description: {
        component:
          "A container that displays a process or operation as a progress bar",
      },
    },
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?node-id=991%3A43382&mode=dev",
    },
  },
};

//

const Template = (args: any) => {
  return <ProgressBar {...args} />;
};
export const Default = Template.bind({});
// @ts-expect-error TS(2339): Property 'args' does not exist on type '(args: any... Remove this comment to see the full error message
Default.args = {
  label: "Operation in progress...",
  percent: 20,
};
