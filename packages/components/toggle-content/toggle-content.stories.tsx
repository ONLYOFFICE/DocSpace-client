import React, { useState } from "react";
import ToggleContent from ".";
import Button from "../button";
import TextInput from "../button";
import Text from "../text";
//import { Icons } from "../icons";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/check.react.... Remove this comment to see the full error message
import CheckReactSvg from "PUBLIC_DIR/images/check.react.svg";

const optionsChildren = [
  "button",
  "icon",
  "text",
  "toggleContent",
  "textInput",
];

export default {
  title: "Components/ToggleContent",
  component: ToggleContent,
  parameters: {
    docs: {
      description: {
        component:
          "ToggleContent allow you to adding information, which you may hide/show by clicking header",
      },
    },
  },
  argTypes: {
    children: {
      table: {
        disable: true,
      },
    },
    buttonLabel: {
      description: "Button text",
      control: "text",
    },
    onClickButton: {
      action: "button clicked!",
      table: { disable: true },
    },
    text: {
      table: {
        disable: true,
      },
    },
    onChange: {
      control: "action",
      description:
        "The change event is triggered when the element's value is modified",
    },
    textInnerToggleContent: {
      table: {
        disable: true,
      },
    },
  },
};

const Template = ({
  buttonLabel,
  onClickButton,
  text,
  textInnerToggleContent,
  onChangeTextInput,
  isOpen,
  children,
  textInputValue,
  ...args
}: any) => {
  const [opened, setOpened] = useState(isOpen);
  let childrenItems: any = [];

  children.map((item: any, indx: any) => {
    switch (item) {
      case "button":
        childrenItems.push(
          // @ts-expect-error TS(2322): Type '{ label: any; key: any; onClick: any; }' is ... Remove this comment to see the full error message
          <Button label={buttonLabel} key={indx} onClick={onClickButton} />
        );
        break;
      case "icon":
        childrenItems.push(<CheckReactSvg key={indx} />);
        break;
      case "text":
        // @ts-expect-error TS(2322): Type '{ children: any; key: any; }' is not assigna... Remove this comment to see the full error message
        childrenItems.push(<Text key={indx}>{text}</Text>);
        break;
      case "toggleContent":
        childrenItems.push(
          // @ts-expect-error TS(2322): Type '{ children: any; key: any; }' is not assigna... Remove this comment to see the full error message
          <ToggleContent key={indx}>{textInnerToggleContent}</ToggleContent>
        );
        break;
      case "textInput":
        childrenItems.push(
          <TextInput
            key={indx}
            // @ts-expect-error TS(2322): Type '{ key: any; value: string; onChange: (event:... Remove this comment to see the full error message
            value="text"
            onChange={(event: any) => {
              onChangeTextInput(event.target.value);
            }}
          />
        );
        break;
      default:
        break;
    }
  });

  return (
    <ToggleContent
      {...args}
      isOpen={opened}
      onChange={(checked: any) => {
        setOpened(checked);
      }}
    >
      {childrenItems}
    </ToggleContent>
  );
};

export const Default = Template.bind({});
// @ts-expect-error TS(2339): Property 'args' does not exist on type '({ buttonL... Remove this comment to see the full error message
Default.args = {
  children: ["text"],
  buttonLabel: "OK",
  text: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi.",
  textInnerToggleContent:
    "Lorem ipsum dolor sit amet, consectetuer adipiscing elit.",
  isOpen: true,
  label: "Some label",
};
