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

import { Meta, StoryObj } from "@storybook/react";
import { DropDownItem } from "../drop-down-item";

import { DropDown } from ".";
import { DropDownProps } from "./DropDown.types";

const meta = {
  title: "Components/DropDown",
  component: DropDown,
  // subcomponents: { DropDownItem },
  // argTypes: {
  //   onClick: { action: "onClickItem", table: { disable: true } },
  // },
  parameters: {
    docs: {
      description: {
        component: `Is a dropdown with any number of action
        By default, it is used with DropDownItem elements in role of children.

If you want to display something custom, you can put it in children, but take into account that all stylization is assigned to the implemented component.

When using component, it should be noted that parent must have CSS property _position: relative_. Otherwise, DropDown will appear outside parent's border.
`,
      },
    },
  },
} satisfies Meta<typeof DropDown>;
type Story = StoryObj<typeof DropDown>;

export default meta;

const Template = (args: DropDownProps) => {
  const { open } = args;

  return (
    <div style={{ height: "200px", position: "relative", padding: "20px" }}>
      <DropDown
        {...args}
        open={open}
        isDefaultMode={false}
        clickOutsideAction={() => {}}
        style={{ top: "20px" }}
      >
        <DropDownItem isHeader label="Category 1" />

        <DropDownItem label="Button 1" onClick={() => {}} />
        <DropDownItem label="Button 2" onClick={() => {}} />
        <DropDownItem label="Button 3" onClick={() => {}} />
        <DropDownItem label="Button 4" onClick={() => {}} disabled />
        <DropDownItem isSeparator />
        <DropDownItem label="Button 5" onClick={() => {}} />
        <DropDownItem label="Button 6" onClick={() => {}} />
      </DropDown>
    </div>
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    open: true,
  },
};
