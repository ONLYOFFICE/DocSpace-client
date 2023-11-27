import React from "react";

import FloatingButton from ".";

export default {
  title: "components/FloatingButton",
  component: FloatingButton,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?type=design&node-id=1053-45015&mode=design&t=TBNCKMQKQMxr44IZ-0",
    },
  },
};

const Template = (args: any) => <div
  style={{
    height: "600px",
    display: "flex",
    justifyContent: "flex-start",
    position: "relative",
  }}
>
  <FloatingButton {...args} />
</div>;

export const Default = Template.bind({});

// @ts-expect-error TS(2339): Property 'args' does not exist on type '(args: any... Remove this comment to see the full error message
Default.args = {
  id: undefined,
  className: undefined,
  style: undefined,
  icon: "upload",
  alert: false,
  percent: 0,
};
