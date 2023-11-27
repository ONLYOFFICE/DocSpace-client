import Submenu from ".";
import React from "react";
import { data, startSelect } from "./data";

export default {
  title: "Components/Submenu",
  component: Submenu,
};

const Wrapper = (props: any) => <div
  style={{
    height: "170px",
  }}
>
  {props.children}
</div>;

const Template = (args: any) => <Wrapper>
  <Submenu {...args} />
</Wrapper>;

export const Default = Template.bind({});
// @ts-expect-error TS(2339): Property 'args' does not exist on type '(args: any... Remove this comment to see the full error message
Default.args = {
  data: data,
  startSelect: startSelect,
};
