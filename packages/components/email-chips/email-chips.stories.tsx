import React from "react";
import EmailChips from ".";

export default {
  title: "Components/EmailChips",
  component: EmailChips,
};

const Options = [
  { name: "Ivan Petrov", email: "myname@gmul.com", isValid: true },
  { name: "Donna Cross", email: "myname45@gmul.com", isValid: true },
  { name: "myname@gmul.co45", email: "myname@gmul.co45", isValid: false },
  { name: "Lisa Cooper", email: "myn348ame@gmul.com", isValid: true },
  { name: "myname19@gmail.com", email: "myname19@gmail.com", isValid: true },
  { name: "myname@gmail.com", email: "myname@gmail.com", isValid: true },
  {
    name: "mynameiskonstantine1353434@gmail.com",
    email: "mynameiskonstantine1353434@gmail.com",
    isValid: true,
  },
  {
    name: "mynameiskonstantine56454864846455488875454654846454@gmail.com",
    email: "mynameiskonstantine56454864846455488875454654846454@gmail.com",
    isValid: true,
  },
  {
    name: "mynameiskonstantine3246@gmail.com",
    email: "mynameiskonstantine3246@gmail.com",
    isValid: true,
  },
];

const Wrapper = (props: any) => <div
  style={{
    height: "220px",
  }}
>
  {props.children}
</div>;

const Template = (args: any) => <Wrapper>
  <EmailChips {...args} />
</Wrapper>;

export const Default = Template.bind({});
// @ts-expect-error TS(2339): Property 'args' does not exist on type '(args: any... Remove this comment to see the full error message
Default.args = {
  options: Options,
  onChange: (selected: any) => {},
  placeholder: "Invite people by name or email",
  clearButtonLabel: "Clear list",
  existEmailText: "This email address has already been entered",
  invalidEmailText: "Invalid email address",
  exceededLimitText:
    "The limit on the number of emails has reached the maximum",
  exceededLimitInputText:
    "The limit on the number of characters has reached the maximum value",
  chipOverLimitText:
    "The limit on the number of characters has reached the maximum value",
  exceededLimit: 500,
};

export const Empty = Template.bind({});
// @ts-expect-error TS(2339): Property 'args' does not exist on type '(args: any... Remove this comment to see the full error message
Empty.args = {
  options: [],
  placeholder: "Type your chips...",
  clearButtonLabel: "Clear list",
  existEmailText: "This email address has already been entered",
  invalidEmailText: "Invalid email address",
  exceededLimitText:
    "The limit on the number of emails has reached the maximum",
  exceededLimitInputText:
    "The limit on the number of characters has reached the maximum value",
  chipOverLimitText:
    "The limit on the number of characters has reached the maximum value",
  exceededLimit: 500,
};
