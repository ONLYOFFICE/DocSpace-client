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

import { Box } from "../box";
import { Text } from "../text";

import { Grid } from "./grid";
import { GridProps } from "./Grid.types";
import { globalColors } from "../../themes";

const meta = {
  title: "Components/Grid",
  component: Grid,
  // subcomponents: { Box },
  argTypes: {},
  parameters: {
    docs: {
      description: {
        component:
          "A container that lays out its contents in a 2-dimensional grid system. Use Box components to define rows and columns",
      },
    },
  },
} satisfies Meta<typeof Grid>;
type Story = StoryObj<typeof Grid>;

export default meta;

const gridProps = {
  marginProp: "0 0 20px 0",
};

const boxProps = {
  paddingProp: "10px",
  displayProp: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const Template = (args: GridProps) => {
  return (
    <Grid {...args} {...gridProps}>
      <Box {...boxProps} backgroundProp={globalColors.secondOrange}>
        <Text color={globalColors.darkBlack}>200px</Text>
      </Box>
      <Box {...boxProps} backgroundProp={globalColors.lightToastAlert}>
        <Text color={globalColors.darkBlack}>minmax(100px,1fr)</Text>
      </Box>
      <Box {...boxProps} backgroundProp={globalColors.grayLight}>
        <Text color={globalColors.darkBlack}>auto</Text>
      </Box>
    </Grid>
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    columnsProp: ["200px", "100px", "1fr", "auto"],
  },
};
