import React from "react";
import { Meta, StoryObj } from "@storybook/react";

import { RadioButtonGroup } from "./RadioButtonGroup";
import {
  RadioButtonGroupProps,
  TRadioButtonOption,
} from "./RadioButtonGroup.types";

// const disable = {
//   table: {
//     disable: true,
//   },
// };

const meta = {
  title: "Components/RadioButtonGroup",
  component: RadioButtonGroup,
  parameters: {
    docs: {
      description: {
        component: "RadioButtonGroup allow you to add group radiobutton",
      },
    },
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?type=design&node-id=556-3247&mode=design&t=TBNCKMQKQMxr44IZ-0",
    },
  },
} satisfies Meta<typeof RadioButtonGroup>;
type Story = StoryObj<typeof meta>;

export default meta;

const Template = ({
  options,
  onClick,

  ...args
}: RadioButtonGroupProps) => {
  const values = ["first", "second", "third"];
  const updateOptions = (newOptions: TRadioButtonOption[]) => {
    const updatedOptions = newOptions.map((item: TRadioButtonOption) => {
      switch (item.value) {
        case "radio1":
          return {
            value: values[0],
          };
        case "radio2":
          return {
            value: values[1],
          };
        case "radio3":
          return {
            value: values[2],
          };
        default:
          return { value: "Default" };
      }
    });

    return updatedOptions;
  };

  const updatedOptions = updateOptions(options);

  return (
    <RadioButtonGroup
      {...args}
      options={updatedOptions}
      selected={updatedOptions[0].value}
      onClick={(e: React.ChangeEvent<HTMLInputElement>) => {
        onClick(e);
      }}
    />
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    orientation: "horizontal",
    width: "100%",
    isDisabled: false,
    fontSize: "13px",
    fontWeight: 400,
    spacing: "15px",
    name: "group",
    options: [{ value: "radio1" }, { value: "radio2" }, { value: "radio3" }],
  },
};
