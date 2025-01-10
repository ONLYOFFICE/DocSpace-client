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

import { SelectorAddButton } from ".";

const meta = {
  title: "Interactive elements/SelectorAddButton",
  component: SelectorAddButton,
  tags: ["autodocs"],
  argTypes: {
    onClick: { action: "onClick" },
    title: {
      description: "Title text",
      control: "text",
    },
    isDisabled: {
      description: "Disable the button",
      control: "boolean",
    },
    isAction: {
      description: "Change colors to accent",
      control: "boolean",
    },
    iconName: {
      description: "Custom icon URL",
      control: "text",
    },
    iconSize: {
      description: "Specifies the icon size",
      control: "number",
    },
    className: {
      description: "Additional CSS class",
      control: "text",
    },
    id: {
      description: "HTML id attribute",
      control: "text",
    },
    style: {
      description: "Custom CSS styles",
      control: "object",
    },
  },
} satisfies Meta<typeof SelectorAddButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Add item",
    isDisabled: false,
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    isDisabled: true,
  },
};

export const WithAction: Story = {
  args: {
    ...Default.args,
    isAction: true,
  },
};
