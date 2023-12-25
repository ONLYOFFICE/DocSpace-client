import React from "react";

import { FillingStatusLine } from "./FillingStatusLine";
import { FillingStatusLineProps } from "./FillingStatusLine.types";

export default {
  title: "Components/FillingStatusLine",
  component: FillingStatusLine,
};

const Template = (args: FillingStatusLineProps) => {
  return <FillingStatusLine {...args} />;
};

export const Default = Template.bind({});
