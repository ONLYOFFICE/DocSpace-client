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

import type { Meta, StoryObj } from "@storybook/react";

import { Box } from "./index";

const containerProps = {
  widthProp: "100%",
  paddingProp: "10px",
  displayProp: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
};

const rowProps = {
  displayProp: "flex",
  flexDirection: "row",
};

const commonBoxProps = {
  textAlign: "center",
  marginProp: "10px",
  paddingProp: "10px",
};

const meta = {
  title: "Components/Box",
  component: Box,
  argTypes: {},
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A container that lays out its contents in one direction. Box provides general CSS capabilities like flexbox layout, paddings, background color, border, and animation.",
      },
    },
  },
} satisfies Meta<typeof Box>;
type Story = StoryObj<typeof Box>;

export default meta;

export const Default: Story = {
  render: (args) => <Box {...args}>Example</Box>,
  args: {
    widthProp: "100%",
    paddingProp: "10px",
    displayProp: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    borderProp: "4px dashed gray",
  },
};

export const Example: Story = {
  render: () => (
    <Box {...containerProps}>
      <Box {...rowProps}>
        <Box {...commonBoxProps} backgroundProp="gray">
          color background
        </Box>

        <Box
          {...commonBoxProps}
          backgroundProp="linear-gradient(90deg, white, gray)"
        >
          linear gradient background
        </Box>

        <Box {...commonBoxProps} backgroundProp="radial-gradient(white, gray)">
          radial gradient background
        </Box>
      </Box>
      <Box {...rowProps}>
        <Box {...commonBoxProps} borderProp="4px solid gray">
          solid border
        </Box>

        <Box {...commonBoxProps} borderProp="4px dashed gray">
          dashed border
        </Box>

        <Box {...commonBoxProps} borderProp="4px dotted gray">
          dotted border
        </Box>

        <Box {...commonBoxProps} borderProp="4px double gray">
          double border
        </Box>
      </Box>
      <Box {...rowProps}>
        <Box
          {...commonBoxProps}
          borderProp={{ style: "solid", width: "1px 0", color: "gray" }}
        >
          Horizontal border
        </Box>

        <Box
          {...commonBoxProps}
          borderProp={{
            style: "solid",
            width: "0 1px",
            color: "gray",
          }}
        >
          vertical border
        </Box>

        <Box
          {...commonBoxProps}
          borderProp={{
            style: "solid",
            width: "0 0 0 1px",
            color: "gray",
          }}
        >
          left border
        </Box>

        <Box
          {...commonBoxProps}
          borderProp={{
            style: "solid",
            width: "1px 0 0 0",
            color: "gray",
          }}
        >
          top border
        </Box>

        <Box
          {...commonBoxProps}
          borderProp={{
            style: "solid",
            width: "0 1px 0 0",
            color: "gray",
          }}
        >
          right border
        </Box>

        <Box
          {...commonBoxProps}
          borderProp={{
            style: "solid",
            width: "0 0 1px 0",
            color: "gray",
          }}
        >
          bottom border
        </Box>
      </Box>
      <Box {...rowProps}>
        <Box
          {...commonBoxProps}
          borderProp={{
            style: "solid",
            width: "1px",
            color: "gray",
            radius: "100%",
          }}
        >
          full round
        </Box>

        <Box
          {...commonBoxProps}
          borderProp={{
            style: "solid",
            width: "1px",
            color: "gray",
            radius: "5px",
          }}
        >
          round
        </Box>

        <Box
          {...commonBoxProps}
          borderProp={{
            style: "solid",
            width: "1px",
            color: "gray",
            radius: "5px 0 0 5px",
          }}
        >
          left round
        </Box>

        <Box
          {...commonBoxProps}
          borderProp={{
            style: "solid",
            width: "1px",
            color: "gray",
            radius: "5px 5px 0 0",
          }}
        >
          top round
        </Box>

        <Box
          {...commonBoxProps}
          borderProp={{
            style: "solid",
            width: "1px",
            color: "gray",
            radius: "0 5px 5px 0",
          }}
        >
          right round
        </Box>

        <Box
          {...commonBoxProps}
          borderProp={{
            style: "solid",
            width: "1px",
            color: "gray",
            radius: "0 0 5px 5px",
          }}
        >
          bottom round
        </Box>
      </Box>
      <Box {...rowProps}>
        <Box
          {...commonBoxProps}
          borderProp={{
            style: "dashed solid double dotted",
            width: "2em 1rem 1px 2%",
            color: "red yellow green blue",
            radius: "10% 30% 50% 70%",
          }}
        >
          Mix border
        </Box>
      </Box>
    </Box>
  ),
};
