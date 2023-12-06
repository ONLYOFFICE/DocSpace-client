import React, { useEffect, useState } from "react";
import { Meta, StoryObj } from "@storybook/react";

import { EmailSettings } from "../../utils";
import { InputSize } from "../text-input";

import { EmailInput } from "./EmailInput";
import { EmailInputProps, TValidate } from "./EmailInput.types";

// const disable = {
//   table: {
//     disable: true,
//   },
// };

const meta = {
  title: "Components/EmailInput",
  component: EmailInput,
  argTypes: {
    // allowDomainPunycode: disable,
    // allowLocalPartPunycode: disable,
    // allowDomainIp: disable,
    // allowStrictLocalPart: disable,
    // allowSpaces: disable,
    // allowName: disable,
    // allowLocalDomainName: disable,
  },
} satisfies Meta<typeof EmailInput>;
type Story = StoryObj<typeof EmailInput>;

export default meta;

const Template = ({
  allowDomainPunycode = false,
  allowLocalPartPunycode = false,
  allowDomainIp = false,
  allowStrictLocalPart = false,
  allowSpaces = false,
  allowName = false,
  allowLocalDomainName = false,
  ...rest
}: EmailInputProps & {
  allowDomainPunycode: boolean;
  allowLocalPartPunycode: boolean;
  allowDomainIp: boolean;
  allowStrictLocalPart: boolean;
  allowSpaces: boolean;
  allowName: boolean;
  allowLocalDomainName: boolean;
}) => {
  const [emailValue, setEmailValue] = useState("");

  const onChangeHandler = (value: string) => {
    setEmailValue(value);
  };
  const settings = EmailSettings.parse({
    allowDomainPunycode,
    allowLocalPartPunycode,
    allowDomainIp,
    allowStrictLocalPart,
    allowSpaces,
    allowName,
    allowLocalDomainName,
  });

  useEffect(() => {
    setEmailValue(rest.value);
  }, [rest.value]);

  return (
    <div style={{ margin: "7px" }}>
      <EmailInput
        {...rest}
        value={emailValue}
        emailSettings={settings}
        onValidateInput={(data: TValidate) => rest.onValidateInput?.(data)}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          rest.onChange(e);
          onChangeHandler(e.target.value);
        }}
      />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    // allowDomainPunycode: false,
    // allowLocalPartPunycode: false,
    // allowDomainIp: false,
    // allowSpaces: false,
    // allowName: false,
    // allowLocalDomainName: false,
    // allowStrictLocalPart: true,
    placeholder: "Input email",
    size: InputSize.base,
  },
};
