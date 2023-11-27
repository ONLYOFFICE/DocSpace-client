import React from "react";
import FillingStatusLine from "./";

export default {
  title: "Components/FillingStatusLine",
  component: FillingStatusLine,
};

const Template = (args: any) => {
  return <FillingStatusLine {...args} />;
};

export const Default = Template.bind({});
