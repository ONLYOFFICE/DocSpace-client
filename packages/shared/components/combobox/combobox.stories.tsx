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

import { ComboBox } from "./ComboBox";
import { ComboboxProps } from "./Combobox.types";
import { globalColors } from "../../themes";

const meta = {
  title: "Components/ComboBox",
  component: ComboBox,
} satisfies Meta<typeof ComboBox>;
type Story = StoryObj<typeof ComboBox>;

export default meta;

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return <div style={{ height: "220px" }}>{children}</div>;
};

const Template = (args: ComboboxProps) => (
  <Wrapper>
    <ComboBox
      {...args}
      isDefaultMode={false}
      fixedDirection
      directionY="both"
      options={[
        { key: 1, label: "Option 1" },
        { key: 2, label: "Option 2" },
      ]}
      selectedOption={{
        key: 0,
        label: "Select",
      }}
    />
  </Wrapper>
);

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    scaled: false,
    options: [
      {
        key: 1,
        label: "Open",
        backgroundColor: globalColors.lightBlueMain,
        color: globalColors.white,
      },
      {
        key: 2,
        label: "Done",
        backgroundColor: globalColors.black,
        color: globalColors.white,
      },
      {
        key: 3,
        label: "2nd turn",
        backgroundColor: globalColors.white,
        color: globalColors.grayText,
        border: globalColors.lightBlueMain,
      },
      {
        key: 4,
        label: "3rd turn",
        backgroundColor: globalColors.white,
        color: globalColors.grayText,
        border: globalColors.lightBlueMain,
      },
    ],
    selectedOption: {
      key: 0,
      label: "Select",
    },
    dropDownMaxHeight: 1500,
  },
};
