// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

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
