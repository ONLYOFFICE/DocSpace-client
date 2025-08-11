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

import { ComboBoxSize } from "../combobox";

import { AccessRightSelect } from "./AccessRightSelect";

import { data } from "./data";

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      height: "420px",
    }}
  >
    {children}
  </div>
);

const meta = {
  title: "Components/AccessRightSelect",
  component: AccessRightSelect,
  parameters: {
    docs: {
      description: {
        component:
          "A dropdown component for selecting access rights with various display options.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    accessOptions: { control: "object" },
    selectedOption: { control: "object" },
    scaledOptions: { control: "boolean" },
    scaled: { control: "boolean" },
    directionX: {
      control: { type: "select" },
      options: ["right", "left"],
    },
    size: {
      control: { type: "select" },
      options: Object.values(ComboBoxSize),
    },
    manualWidth: { control: "text" },
    isDisabled: { control: "boolean" },
    withoutBackground: { control: "boolean" },
    withBlur: { control: "boolean" },
    directionY: {
      control: { type: "select" },
      options: ["top", "bottom", "both"],
    },
    isAside: { control: "boolean" },
    isMobileView: { control: "boolean" },
    manualY: { control: "text" },
    fixedDirection: { control: "boolean" },
    withBackground: { control: "boolean" },
    shouldShowBackdrop: { control: "boolean" },
    noBorder: { control: "boolean" },
    isSelectionDisabled: { control: "boolean" },
    topSpace: { control: "number" },
    modernView: { control: "boolean" },
    fillIcon: { control: "boolean" },
    isDefaultMode: { control: "boolean" },
    comboIcon: { control: "text" },
    usePortalBackdrop: { control: "boolean" },
    type: {
      control: { type: "select" },
      options: [undefined, "badge", "onlyIcon", "descriptive"],
    },

    className: { table: { disable: true } },
    onSelect: { table: { disable: true } },
    advancedOptions: { table: { disable: true } },
  },
  args: {
    usePortalBackdrop: true,
  },
} satisfies Meta<typeof AccessRightSelect>;

export default meta;
type Story = StoryObj<typeof AccessRightSelect>;

export const Default: Story = {
  args: {
    accessOptions: data,
    selectedOption: data[0],
    scaledOptions: false,
    scaled: false,
    directionX: "right",
    size: ComboBoxSize.content,
    manualWidth: "fit-content",
  },
  render: (args) => (
    <Wrapper>
      <AccessRightSelect {...args} />
    </Wrapper>
  ),
};
