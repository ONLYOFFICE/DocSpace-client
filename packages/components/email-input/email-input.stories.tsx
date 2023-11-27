import React, { useEffect, useState } from "react";
import { EmailSettings } from "../utils/email";
import EmailInput from "./";

const disable = {
  table: {
    disable: true,
  },
};

export default {
  title: "Components/EmailInput",
  component: EmailInput,
  argTypes: {
    allowDomainPunycode: disable,
    allowLocalPartPunycode: disable,
    allowDomainIp: disable,
    allowStrictLocalPart: disable,
    allowSpaces: disable,
    allowName: disable,
    allowLocalDomainName: disable,
  },
};

const Template = ({
  allowDomainPunycode,
  allowLocalPartPunycode,
  allowDomainIp,
  allowStrictLocalPart,
  allowSpaces,
  allowName,
  allowLocalDomainName,
  ...rest
}: any) => {
  const [emailValue, setEmailValue] = useState("");

  const onChangeHandler = (value: any) => {
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
        onValidateInput={(isEmailValid: any) => rest.onValidateInput(isEmailValid)}
        onChange={(e: any) => {
          rest.onChange(e.target.value);
          onChangeHandler(e.target.value);
        }}
      />
    </div>
  );
};

export const Default = Template.bind({});
// @ts-expect-error TS(2339): Property 'args' does not exist on type '({ allowDo... Remove this comment to see the full error message
Default.args = {
  allowDomainPunycode: false,
  allowLocalPartPunycode: false,
  allowDomainIp: false,
  allowSpaces: false,
  allowName: false,
  allowLocalDomainName: false,
  allowStrictLocalPart: true,
  placeholder: "Input email",
  size: "base",
};
