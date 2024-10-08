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
      <Box {...boxProps} backgroundProp="#F4991A">
        <Text color="#000">200px</Text>
      </Box>
      <Box {...boxProps} backgroundProp="#F2EAD3">
        <Text color="#000">minmax(100px,1fr)</Text>
      </Box>
      <Box {...boxProps} backgroundProp="#F9F5F0">
        <Text color="#000">auto</Text>
      </Box>
    </Grid>
  );
};

// const TemplateColumns = (args: GridProps) => {
//   return (
//     <>
//       <Grid
//         {...args}
//         {...gridProps}
//         columnsProp={["200px", "100px", "1fr", "auto"]}
//       >
//         <Box {...boxProps} backgroundProp="#F4991A">
//           <Text color="#000">200px</Text>
//         </Box>
//         <Box {...boxProps} backgroundProp="#F2EAD3">
//           <Text color="#000">minmax(100px,1fr)</Text>
//         </Box>
//         <Box {...boxProps} backgroundProp="#F9F5F0">
//           <Text color="#000">auto</Text>
//         </Box>
//       </Grid>

//       <Grid {...args} {...gridProps} columnsProp="25%">
//         <Box {...boxProps} backgroundProp="#F4991A">
//           <Text color="#000">25%</Text>
//         </Box>
//         <Box {...boxProps} backgroundProp="#F2EAD3">
//           <Text color="#000">25%</Text>
//         </Box>
//         <Box {...boxProps} backgroundProp="#F9F5F0">
//           <Text color="#000">25%</Text>
//         </Box>
//       </Grid>

//       <Grid
//         {...args}
//         {...gridProps}
//         columnsProp={[{ count: 3, size: "100px" }]}
//       >
//         <Box {...boxProps} backgroundProp="#F4991A">
//           <Text color="#000">100px</Text>
//         </Box>
//         <Box {...boxProps} backgroundProp="#F2EAD3">
//           <Text color="#000">100px</Text>
//         </Box>
//         <Box {...boxProps} backgroundProp="#F9F5F0">
//           <Text color="#000">100px</Text>
//         </Box>
//       </Grid>

//       <Grid
//         {...args}
//         {...gridProps}
//         columnsProp={{ count: 3, size: ["100px", "1fr"] }}
//       >
//         <Box {...boxProps} backgroundProp="#F4991A">
//           <Text color="#000">minmax(100px,1fr)</Text>
//         </Box>
//         <Box {...boxProps} backgroundProp="#F2EAD3">
//           <Text color="#000">minmax(100px,1fr)</Text>
//         </Box>
//         <Box {...boxProps} backgroundProp="#F9F5F0">
//           <Text color="#000">minmax(100px,1fr)</Text>
//         </Box>
//       </Grid>
//     </>
//   );
// };

// const TemplateRows = (args: any) => {
//   return (
//     <>
//       <Grid
//         {...args}
//         {...gridProps}
//         rowsProp={["100px", ["100px", "1fr"], "auto"]}
//       >
//         <Box {...boxProps} backgroundProp="#F4991A">
//           <Text color="#000">100px</Text>
//         </Box>
//         <Box {...boxProps} backgroundProp="#F2EAD3">
//           <Text color="#000">minmax(100px,1fr)</Text>
//         </Box>
//         <Box {...boxProps} backgroundProp="#F9F5F0">
//           <Text color="#000">auto</Text>
//         </Box>
//       </Grid>

//       <Grid {...args} {...gridProps} rowsProp="50px">
//         <Box {...boxProps} backgroundProp="#F4991A">
//           <Text color="#000">50px</Text>
//         </Box>
//         <Box {...boxProps} backgroundProp="#F2EAD3">
//           <Text color="#000">50px</Text>
//         </Box>
//         <Box {...boxProps} backgroundProp="#F9F5F0">
//           <Text color="#000">50px</Text>
//         </Box>
//       </Grid>
//     </>
//   );
// };

// const TemplateLayout = (args: any) => {
//   return (
//     <Grid
//       {...args}
//       widthProp="100vw"
//       heightProp="100vh"
//       gridGap="10px"
//       rowsProp={["auto", "1fr", "auto"]}
//       columnsProp={[["100px", "1fr"], "3fr", ["100px", "1fr"]]}
//       areasProp={[
//         { name: "header", start: [0, 0], end: [2, 0] },
//         { name: "navbar", start: [0, 1], end: [0, 1] },
//         { name: "main", start: [1, 1], end: [1, 1] },
//         { name: "sidebar", start: [2, 1], end: [2, 1] },
//         { name: "footer", start: [0, 2], end: [2, 2] },
//       ]}
//     >
//       <Box {...boxProps} gridArea="header" backgroundProp="#F4991A">
//         <Text color="#000">header</Text>
//       </Box>
//       <Box {...boxProps} gridArea="navbar" backgroundProp="#F2EAD3">
//         <Text color="#000">navbar</Text>
//       </Box>
//       <Box {...boxProps} gridArea="main" backgroundProp="#F9F5F0">
//         <Text color="#000">main</Text>
//       </Box>
//       <Box {...boxProps} gridArea="sidebar" backgroundProp="#F2EAD3">
//         <Text color="#000">sidebar</Text>
//       </Box>
//       <Box {...boxProps} gridArea="footer" backgroundProp="#F4991A">
//         <Text color="#000">footer</Text>
//       </Box>
//     </Grid>
//   );
// };

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    columnsProp: ["200px", "100px", "1fr", "auto"],
  },
};

// export const Columns = TemplateColumns.bind({});
// export const Rows = TemplateRows.bind({});
// export const Layout = TemplateLayout.bind({});
