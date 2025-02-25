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
import type { Meta, StoryObj } from "@storybook/react";

import { CircleSkeleton } from ".";

const meta: Meta<typeof CircleSkeleton> = {
  title: "Skeletons/Circle",
  component: CircleSkeleton,
  tags: ["autodocs"],
  argTypes: {
    radius: {
      control: "text",
      description: "Radius of the circle",
    },
    x: {
      control: "text",
      description: "X coordinate of circle center",
    },
    y: {
      control: "text",
      description: "Y coordinate of circle center",
    },
    width: {
      control: "text",
      description: "Width of the SVG container",
    },
    height: {
      control: "text",
      description: "Height of the SVG container",
    },
    backgroundColor: {
      control: "color",
      description: "Background color of the skeleton",
    },
    foregroundColor: {
      control: "color",
      description: "Foreground color of the skeleton",
    },
    backgroundOpacity: {
      control: { type: "range", min: 0, max: 1, step: 0.1 },
      description: "Opacity of the background",
    },
    foregroundOpacity: {
      control: { type: "range", min: 0, max: 1, step: 0.1 },
      description: "Opacity of the foreground",
    },
    speed: {
      control: { type: "range", min: 0.5, max: 3, step: 0.1 },
      description: "Animation speed in seconds",
    },
    animate: {
      control: "boolean",
      description: "Whether to animate the skeleton",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A circular skeleton loader component with customizable dimensions, colors, and animation.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CircleSkeleton>;

export const Default: Story = {
  args: {
    width: "50",
    height: "50",
    radius: "20",
    x: "25",
    y: "25",
  },
};

export const SmallAvatar: Story = {
  args: {
    width: "32",
    height: "32",
    radius: "16",
    x: "16",
    y: "16",
  },
};

export const LargeAvatar: Story = {
  args: {
    width: "80",
    height: "80",
    radius: "40",
    x: "40",
    y: "40",
  },
};

export const CustomColors: Story = {
  args: {
    width: "50",
    height: "50",
    radius: "20",
    x: "25",
    y: "25",
    backgroundColor: "#e0e0e0",
    foregroundColor: "#f5f5f5",
    backgroundOpacity: 0.8,
    foregroundOpacity: 0.4,
  },
};

export const NoAnimation: Story = {
  args: {
    width: "50",
    height: "50",
    radius: "20",
    x: "25",
    y: "25",
    animate: false,
  },
};

export const SlowAnimation: Story = {
  args: {
    width: "50",
    height: "50",
    radius: "20",
    x: "25",
    y: "25",
    speed: 2.5,
  },
};

export const AvatarGroup: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "8px" }}>
      <CircleSkeleton width="40" height="40" radius="20" x="20" y="20" />
      <CircleSkeleton width="40" height="40" radius="20" x="20" y="20" />
      <CircleSkeleton width="40" height="40" radius="20" x="20" y="20" />
      <CircleSkeleton width="40" height="40" radius="20" x="20" y="20" />
    </div>
  ),
};
