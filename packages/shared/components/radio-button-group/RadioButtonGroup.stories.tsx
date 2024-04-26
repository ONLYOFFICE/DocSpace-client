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
