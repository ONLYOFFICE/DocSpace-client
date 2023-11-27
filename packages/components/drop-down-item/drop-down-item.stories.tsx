import React from "react";
import DropDown from "../drop-down";
import DropDownItem from ".";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/question.rea... Remove this comment to see the full error message
import QuestionReactSvgUrl from "PUBLIC_DIR/images/question.react.svg?url";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/eye.react.sv... Remove this comment to see the full error message
import EyeReactSvgUrl from "PUBLIC_DIR/images/eye.react.svg?url";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/copy.react.s... Remove this comment to see the full error message
import CopyReactSvgUrl from "PUBLIC_DIR/images/copy.react.svg?url";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/chat.react.s... Remove this comment to see the full error message
import ChatReactSvgUrl from "PUBLIC_DIR/images/chat.react.svg?url";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/nav.logo.rea... Remove this comment to see the full error message
import NavLogoReactSvgUrl from "PUBLIC_DIR/images/nav.logo.react.svg?url";

export default {
  title: "Components/DropDownItem",
  component: DropDownItem,
  subcomponents: { DropDown },
  argTypes: {
    onClick: { action: "onClick" },
  },
  parameters: {
    docs: {
      description: {
        component: `Is a item of DropDown component

An item can act as separator, header, or container.

When used as container, it will retain all styling features and positioning. To disable hover effects in container mode, you can use _noHover_ property.`,
      },
    },
  },
};

const Template = (args: any) => {
  const isHeader = args.isHeader;
  const isSeparator = args.isSeparator;
  const useIcon = args.useIcon;
  const direction = "left";
  const noHover = args.noHover;
  const disabled = args.disabled;
  const { onClick } = args;
  return (
    <div style={{ height: "220px", position: "relative" }}>
      // @ts-expect-error TS(2769): No overload matches this call.
      <DropDown
        isDefaultMode={false}
        directionX={direction}
        open={true}
        clickOutsideAction={() => {}}
        style={{ top: "20px", left: "20px" }}
      >
        <DropDownItem
          isHeader={isHeader}
          label={isHeader ? "Category" : ""}
          noHover={noHover}
        />
        <DropDownItem
          icon={QuestionReactSvgUrl}
          label="Button 1"
          disabled={disabled}
          onClick={() => onClick("Button 1 clicked")}
          noHover={noHover}
        />
        <DropDownItem
          icon={EyeReactSvgUrl}
          label="Button 2"
          onClick={() => onClick("Button 2 clicked")}
          noHover={noHover}
        />
        <DropDownItem
          disabled
          icon={CopyReactSvgUrl}
          label={args.label || "Button 3"}
          // @ts-expect-error TS(17001): JSX elements cannot have multiple attributes with ... Remove this comment to see the full error message
          disabled={disabled}
          onClick={() => onClick("Button 3 clicked")}
          noHover={noHover}
        />
        <DropDownItem
          icon={ChatReactSvgUrl}
          label="Button 4"
          onClick={() => onClick("Button 4 clicked")}
          noHover={noHover}
        />
        <DropDownItem isSeparator={isSeparator} />
        <DropDownItem
          isHeader={isHeader}
          label={isHeader ? "Category" : ""}
          noHover={noHover}
        />
        <DropDownItem
          icon={NavLogoReactSvgUrl}
          label="Button 5"
          onClick={() => onClick("Button 5 clicked")}
          noHover={noHover}
        />
        <DropDownItem
          disabled
          icon={NavLogoReactSvgUrl}
          label="Button 6"
          onClick={() => console.log("Button 6 clicked")}
          noHover={noHover}
        />
      </DropDown>
    </div>
  );
};
export const Default = Template.bind({});
