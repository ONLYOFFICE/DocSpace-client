import React from "react";

import AccessRightSelect from "./";
import { data } from "./data";

export default {
  title: "Components/AccessRightSelect",
  component: AccessRightSelect,
};

const Wrapper = (props: any) => <div
  style={{
    height: "420px",
  }}
>
  {props.children}
</div>;

const Template = (args: any) => <Wrapper>
  <AccessRightSelect {...args} />
</Wrapper>;

export const Default = Template.bind({});

// @ts-expect-error TS(2339): Property 'args' does not exist on type '(args: any... Remove this comment to see the full error message
Default.args = {
  accessOptions: data,
  selectedOption: data[0],
  scaledOptions: false,
  scaled: false,
  directionX: "left",
  size: "content",
  manualWidth: "fit-content",
};
