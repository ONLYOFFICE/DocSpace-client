// (c) Copyright Ascensio System SIA 2009-2025
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

import RowLoader from "./Row";

const meta = {
  title: "Skeletons/Selector/Row",
  component: RowLoader,
  parameters: {
    docs: {
      description: {
        component: "Loading skeleton for selector rows",
      },
    },
  },
  argTypes: {
    count: {
      control: "number",
      defaultValue: 3,
      description: "Number of rows to display",
    },
    isMultiSelect: {
      control: "boolean",
      defaultValue: false,
      description: "Show checkbox for multiple selection",
    },
    isContainer: {
      control: "boolean",
      defaultValue: true,
      description: "Render as a container with multiple rows",
    },
    isUser: {
      control: "boolean",
      defaultValue: false,
      description: "Apply user-specific styling (rounded avatar)",
    },
    withAllSelect: {
      control: "boolean",
      defaultValue: false,
      description: "Show 'select all' option at the top",
    },
    style: {
      control: "object",
      description: "Custom styles for the container",
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RowLoader>;

export default meta;

type Story = StoryObj<typeof RowLoader>;

export const Default: Story = {
  args: {
    count: 3,
    isContainer: true,
  },
};

export const MultiSelect: Story = {
  args: {
    ...Default.args,
    isMultiSelect: true,
    withAllSelect: true,
  },
};

export const User: Story = {
  args: {
    ...Default.args,
    isUser: true,
    isMultiSelect: true,
  },
};

export const Single: Story = {
  args: {
    isContainer: false,
    isMultiSelect: true,
  },
};
