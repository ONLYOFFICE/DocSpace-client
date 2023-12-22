import React from "react";
import Tags from ".";

export default {
  title: "Components/Tags",
  component: Tags,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?type=design&node-id=62-2597&mode=design&t=TBNCKMQKQMxr44IZ-0",
    },
  },
};

const Template = (args: any) => <Tags {...args} />;

export const Default = Template.bind({});

// @ts-expect-error TS(2339): Property 'args' does not exist on type '(args: any... Remove this comment to see the full error message
Default.args = {
  tags: ["tag1", "tag2"],
  id: "",
  className: "",
  columnCount: 2,
  style: {},
  onSelectTag: (tags: any) => {},
};
