import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import CheckReactSvg from "PUBLIC_DIR/images/check.react.svg";

import { Button } from "../button";
import { InputSize, InputType, TextInput } from "../text-input";
import { Text } from "../text";

import { ToggleContent } from "./ToggleContent";
import { ToggleContentProps } from "./ToggleContent.types";

// const optionsChildren = [
//   "button",
//   "icon",
//   "text",
//   "toggleContent",
//   "textInput",
// ];

const meta = {
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
    // buttonLabel: {
    //   description: "Button text",
    //   control: "text",
    // },
    // onClickButton: {
    //   action: "button clicked!",
    //   table: { disable: true },
    // },
    // text: {
    //   table: {
    //     disable: true,
    //   },
    // },
    onChange: {
      control: "action",
      description:
        "The change event is triggered when the element's value is modified",
    },
    // textInnerToggleContent: {
    //   table: {
    //     disable: true,
    //   },
    // },
  },
} satisfies Meta<typeof ToggleContent>;
type Story = StoryObj<typeof ToggleContent>;

export default meta;

const Template = ({
  // buttonLabel,
  // onClickButton,
  // text,
  // textInnerToggleContent,
  // onChangeTextInput,
  isOpen,
  children,
  // textInputValue,
  ...args
}: ToggleContentProps) => {
  const [opened, setOpened] = useState(isOpen);
  const childrenItems: React.ReactNode[] = [];

  if (children && Array.isArray(children))
    children.map((item: string) => {
      switch (item) {
        case "button":
          childrenItems.push(
            <Button label="Button label" key={item} onClick={() => {}} />,
          );
          return;
        case "icon":
          childrenItems.push(<CheckReactSvg key={item} />);
          return;
        case "text":
          childrenItems.push(<Text key={item}>Text test</Text>);
          return;
        case "toggleContent":
          childrenItems.push(
            <ToggleContent isOpen={opened} label="Toggle label" key={item}>
              Inner text
            </ToggleContent>,
          );
          return;
        case "textInput":
          childrenItems.push(
            <TextInput
              key={item}
              value="text"
              size={InputSize.base}
              type={InputType.text}
              onChange={() => {
                // onChangeTextInput(event.target.value);
              }}
            />,
          );
          break;
        default:
          break;
      }
      return null;
    });

  return (
    <ToggleContent
      {...args}
      isOpen={opened}
      onChange={(checked) => {
        setOpened(checked);
      }}
    >
      {childrenItems}
    </ToggleContent>
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    children: ["text"],
    // buttonLabel: "OK",
    // text: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi.",
    // textInnerToggleContent:
    //   "Lorem ipsum dolor sit amet, consectetuer adipiscing elit.",
    isOpen: true,
    label: "Some label",
  },
};
