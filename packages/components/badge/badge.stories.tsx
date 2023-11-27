import React from "react";

import Badge from "./";

export default {
  title: "Components/Badge",
  component: Badge,
  parameters: {
    docs: {
      description: {
        component: "Used for buttons, numbers or status markers next to icons.",
      },
    },
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?type=design&node-id=6057-171831&mode=design&t=TBNCKMQKQMxr44IZ-0",
    },
  },
};

const Template = (args: any) => <Badge {...args} />;
const NumberTemplate = (args: any) => <Badge {...args} />;
const TextTemplate = (args: any) => <Badge {...args} />;
const MixedTemplate = (args: any) => <Badge {...args} />;
const HighTemplate = (args: any) => <Badge {...args} />;

export const Default = Template.bind({});
// @ts-expect-error TS(2339): Property 'args' does not exist on type '(args: any... Remove this comment to see the full error message
Default.args = {
  label: 24,
};
export const NumberBadge = NumberTemplate.bind({});
// @ts-expect-error TS(2339): Property 'argTypes' does not exist on type '(args:... Remove this comment to see the full error message
NumberBadge.argTypes = {
  label: { control: "number" },
};
// @ts-expect-error TS(2339): Property 'args' does not exist on type '(args: any... Remove this comment to see the full error message
NumberBadge.args = {
  label: 3,
};
export const TextBadge = TextTemplate.bind({});
// @ts-expect-error TS(2339): Property 'argTypes' does not exist on type '(args:... Remove this comment to see the full error message
TextBadge.argTypes = {
  label: { control: "text" },
};
// @ts-expect-error TS(2339): Property 'args' does not exist on type '(args: any... Remove this comment to see the full error message
TextBadge.args = {
  label: "New",
};
export const MixedBadge = MixedTemplate.bind({});
// @ts-expect-error TS(2339): Property 'argTypes' does not exist on type '(args:... Remove this comment to see the full error message
MixedBadge.argTypes = {
  label: { control: "text" },
};
// @ts-expect-error TS(2339): Property 'args' does not exist on type '(args: any... Remove this comment to see the full error message
MixedBadge.args = {
  label: "Ver.2",
};

export const HighBadge = HighTemplate.bind({});
// @ts-expect-error TS(2339): Property 'args' does not exist on type '(args: any... Remove this comment to see the full error message
HighBadge.args = {
  type: "high",
  label: "High",
  backgroundColor: "#f2675a",
};
// @ts-expect-error TS(2339): Property 'argTypes' does not exist on type '(args:... Remove this comment to see the full error message
HighBadge.argTypes = {
  type: { control: "radio" },
};
