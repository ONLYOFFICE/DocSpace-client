import React, { ChangeEvent, useState } from "react";
import { Meta, StoryObj } from "@storybook/react";

import { Textarea } from "./Textarea";
import { TextareaProps } from "./Textarea.types";

const meta = {
  title: "Components/Textarea",
  component: Textarea,
  parameters: {
    docs: {
      description: {
        component: "Textarea is used for displaying custom textarea",
      },
    },
  },
  argTypes: {
    color: { control: "color" },
    onChange: { action: "onChange" },
  },
} satisfies Meta<typeof Textarea>;
type Story = StoryObj<typeof Textarea>;

export default meta;

const Template = ({ value, onChange, ...args }: TextareaProps) => {
  const [val, setValue] = useState(value);
  return (
    <Textarea
      value={val}
      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
        if (e.target.value) {
          onChange?.(e);
          setValue(e.target.value);
        }
      }}
      {...args}
    />
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    placeholder: "Add comment",
    isDisabled: false,
    isReadOnly: false,
    hasError: false,
    maxLength: 1000,
    id: "",
    name: "",
    tabIndex: 1,
    fontSize: 13,
    heightTextArea: "89px",
    value:
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae",
    isJSONField: false,
    enableCopy: false,
    hasNumeration: false,
    isFullHeight: false,
  },
};

// Default.parameters = {
//   design: {
//     type: "figma",
//     url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?type=design&node-id=3399-102679&mode=design&t=TBNCKMQKQMxr44IZ-0",
//   },
// };

export const JsonViewer: Story = {
  render: (args) => <Template {...args} />,
  args: {
    placeholder: "Input JSON into value prop",
    isDisabled: false,
    isReadOnly: true,
    hasError: false,
    maxLength: 1000,
    id: "",
    name: "",
    tabIndex: 1,
    fontSize: 13,
    heightTextArea: "89px",
    value:
      '{"menu": {"id": "file","value": "File","popup": {"menuitem": [{"value": "New", "onclick": "CreateNewDoc()"},{"value": "Open", "onclick": "OpenDoc()"},{"value": "Close", "onclick": "CloseDoc()"}]}}}',
    isJSONField: true,
    enableCopy: true,
    hasNumeration: true,
    isFullHeight: true,
  },
};
