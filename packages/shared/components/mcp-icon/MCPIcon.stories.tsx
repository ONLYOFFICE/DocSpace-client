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

import LogoUrl from "PUBLIC_DIR/images/logo/leftmenu.svg?url";

import { MCPIconSize } from "./MCPIcon.enum";
import { MCPIcon } from "./MCPIcon";

const meta = {
  title: "Base UI components/MCPIcon",
  component: MCPIcon,
  parameters: {
    docs: {
      description: {
        component:
          "An icon component for MCP (Model Context Protocol) with configurable size options.",
      },
    },
  },
  argTypes: {
    title: {
      description: "Title text for the icon",
      control: "text",
    },
    size: {
      description: "Size of the icon",
      control: "select",
      options: Object.values(MCPIconSize),
    },
    imgSrc: {
      description: "Image source URL for the icon",
      control: "text",
    },
    className: {
      description: "Additional CSS class name",
      control: "text",
    },
    dataTestId: {
      description: "Test ID for testing purposes",
      control: "text",
    },
  },
} satisfies Meta<typeof MCPIcon>;

export default meta;
type Story = StoryObj<typeof MCPIcon>;

export const Default: Story = {
  args: {
    title: "DocSpace MCP",
    size: MCPIconSize.Large,
  },
};

export const WithImage: Story = {
  args: {
    title: "Any",
    size: MCPIconSize.Large,
    imgSrc: LogoUrl,
  },
};
