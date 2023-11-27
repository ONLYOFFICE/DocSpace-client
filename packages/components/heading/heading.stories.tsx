import React from "react";
import Heading from ".";

export default {
  title: "Components/Heading",
  component: Heading,
  argTypes: {
    color: { control: "color" },
    headerText: { control: "text", description: "Header text" },
  },
  parameters: {
    docs: {
      description: {
        component: "Heading text structured in levels",
      },
    },
  },
};

const Template = ({
  headerText,
  ...args
}: any) => {
  return (
    <div style={{ margin: "7px" }}>
      <Heading {...args}>{headerText}</Heading>
    </div>
  );
};

export const Default = Template.bind({});
// @ts-expect-error TS(2339): Property 'args' does not exist on type '({ headerT... Remove this comment to see the full error message
Default.args = {
  level: 1,
  title: "",
  truncate: false,
  isInline: false,
  size: "large",
  headerText: "Sample text Heading",
};
