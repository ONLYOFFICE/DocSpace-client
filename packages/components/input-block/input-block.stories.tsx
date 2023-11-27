import React, { useState } from "react";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/settings.rea... Remove this comment to see the full error message
import SettingsReactSvgUrl from "PUBLIC_DIR/images/settings.react.svg?url";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/search.react... Remove this comment to see the full error message
import SearchReactSvgUrl from "PUBLIC_DIR/images/search.react.svg?url";
import InputBlock from ".";
import Button from "../button";
import IconButton from "../icon-button";

export default {
  title: "Components/InputBlock",
  component: InputBlock,
  argTypes: {
    iconColor: { control: "color" },
    hoverColor: { control: "color" },
    onChange: { action: "onChange" },
    onBlur: { action: "onBlur" },
    onFocus: { action: "onFocus" },
    onIconClick: { action: "onIconClick" },
    // optionsMultiSelect: {
    //   control: {
    //     type: "multi-select",
    //     options: ["button", "icon"],
    //   },
    // },
  },
};

const Template = ({
  optionsMultiSelect,
  onChange,
  ...args
}: any) => {
  const [value, setValue] = useState("");

  const children: any = [];

  if (optionsMultiSelect) {
    optionsMultiSelect.forEach(function (item: any, i: any) {
      switch (item) {
        case "button":
          // @ts-expect-error TS(2322): Type '{ label: string; key: any; }' is not assigna... Remove this comment to see the full error message
          children.push(<Button label="OK" key={i} />);
          break;
        case "icon":
          children.push(
            <IconButton
              // @ts-expect-error TS(2322): Type '{ size: number; color: string; key: any; ico... Remove this comment to see the full error message
              size={16}
              color=""
              key={i}
              iconName={SettingsReactSvgUrl}
            />
          );
          break;
        default:
          break;
      }
    });
  }

  return (
    <InputBlock
      {...args}
      value={value}
      onChange={(e: any) => {
        setValue(e.target.value), onChange(e.target.value);
      }}
    >
      {children}
    </InputBlock>
  );
};

export const Default = Template.bind({});
// @ts-expect-error TS(2339): Property 'args' does not exist on type '({ options... Remove this comment to see the full error message
Default.args = {
  id: "",
  name: "",
  placeholder: "This is placeholder",
  maxLength: 255,
  size: "base",
  isAutoFocussed: false,
  isReadOnly: false,
  hasError: false,
  hasWarning: false,
  scale: false,
  autoComplete: "off",
  tabIndex: 1,
  iconSize: 0,
  mask: null,
  isDisabled: false,
  iconName: SearchReactSvgUrl,
  isIconFill: false,
};
