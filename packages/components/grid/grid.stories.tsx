import React from "react";

import Grid from "./";
import Box from "../box";
import Text from "../text";

export default {
  title: "Components/Grid",
  component: Grid,
  subcomponents: { Box },
  argTypes: {},
  parameters: {
    docs: {
      description: {
        component:
          "A container that lays out its contents in a 2-dimensional grid system. Use Box components to define rows and columns",
      },
    },
  },
};

const gridProps = {
  marginProp: "0 0 20px 0",
};

const boxProps = {
  paddingProp: "10px",
  displayProp: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const Template = (args: any) => {
  return (
    <Grid {...args} {...gridProps}>
      // @ts-expect-error TS(2322): Type '{ children: Element; backgroundProp: string;... Remove this comment to see the full error message
      <Box {...boxProps} backgroundProp="#F4991A">
        // @ts-expect-error TS(2322): Type '{ children: string; color: string; }' is not... Remove this comment to see the full error message
        <Text color={"#000"}>200px</Text>
      </Box>
      // @ts-expect-error TS(2322): Type '{ children: Element; backgroundProp: string;... Remove this comment to see the full error message
      <Box {...boxProps} backgroundProp="#F2EAD3">
        // @ts-expect-error TS(2322): Type '{ children: string; color: string; }' is not... Remove this comment to see the full error message
        <Text color={"#000"}>minmax(100px,1fr)</Text>
      </Box>
      // @ts-expect-error TS(2322): Type '{ children: Element; backgroundProp: string;... Remove this comment to see the full error message
      <Box {...boxProps} backgroundProp="#F9F5F0">
        // @ts-expect-error TS(2322): Type '{ children: string; color: string; }' is not... Remove this comment to see the full error message
        <Text color={"#000"}>auto</Text>
      </Box>
    </Grid>
  );
};

const TemplateColumns = (args: any) => {
  return (
    <>
      <Grid
        {...args}
        {...gridProps}
        columnsProp={["200px", ["100px", "1fr"], "auto"]}
      >
        // @ts-expect-error TS(2322): Type '{ children: Element; backgroundProp: string;... Remove this comment to see the full error message
        <Box {...boxProps} backgroundProp="#F4991A">
          // @ts-expect-error TS(2322): Type '{ children: string; color: string; }' is not... Remove this comment to see the full error message
          <Text color={"#000"}>200px</Text>
        </Box>
        // @ts-expect-error TS(2322): Type '{ children: Element; backgroundProp: string;... Remove this comment to see the full error message
        <Box {...boxProps} backgroundProp="#F2EAD3">
          // @ts-expect-error TS(2322): Type '{ children: string; color: string; }' is not... Remove this comment to see the full error message
          <Text color={"#000"}>minmax(100px,1fr)</Text>
        </Box>
        // @ts-expect-error TS(2322): Type '{ children: Element; backgroundProp: string;... Remove this comment to see the full error message
        <Box {...boxProps} backgroundProp="#F9F5F0">
          // @ts-expect-error TS(2322): Type '{ children: string; color: string; }' is not... Remove this comment to see the full error message
          <Text color={"#000"}>auto</Text>
        </Box>
      </Grid>

      <Grid {...args} {...gridProps} columnsProp="25%">
        // @ts-expect-error TS(2322): Type '{ children: Element; backgroundProp: string;... Remove this comment to see the full error message
        <Box {...boxProps} backgroundProp="#F4991A">
          // @ts-expect-error TS(2322): Type '{ children: string; color: string; }' is not... Remove this comment to see the full error message
          <Text color={"#000"}>25%</Text>
        </Box>
        // @ts-expect-error TS(2322): Type '{ children: Element; backgroundProp: string;... Remove this comment to see the full error message
        <Box {...boxProps} backgroundProp="#F2EAD3">
          // @ts-expect-error TS(2322): Type '{ children: string; color: string; }' is not... Remove this comment to see the full error message
          <Text color={"#000"}>25%</Text>
        </Box>
        // @ts-expect-error TS(2322): Type '{ children: Element; backgroundProp: string;... Remove this comment to see the full error message
        <Box {...boxProps} backgroundProp="#F9F5F0">
          // @ts-expect-error TS(2322): Type '{ children: string; color: string; }' is not... Remove this comment to see the full error message
          <Text color={"#000"}>25%</Text>
        </Box>
      </Grid>

      <Grid {...args} {...gridProps} columnsProp={{ count: 3, size: "100px" }}>
        // @ts-expect-error TS(2322): Type '{ children: Element; backgroundProp: string;... Remove this comment to see the full error message
        <Box {...boxProps} backgroundProp="#F4991A">
          // @ts-expect-error TS(2322): Type '{ children: string; color: string; }' is not... Remove this comment to see the full error message
          <Text color={"#000"}>100px</Text>
        </Box>
        // @ts-expect-error TS(2322): Type '{ children: Element; backgroundProp: string;... Remove this comment to see the full error message
        <Box {...boxProps} backgroundProp="#F2EAD3">
          // @ts-expect-error TS(2322): Type '{ children: string; color: string; }' is not... Remove this comment to see the full error message
          <Text color={"#000"}>100px</Text>
        </Box>
        // @ts-expect-error TS(2322): Type '{ children: Element; backgroundProp: string;... Remove this comment to see the full error message
        <Box {...boxProps} backgroundProp="#F9F5F0">
          // @ts-expect-error TS(2322): Type '{ children: string; color: string; }' is not... Remove this comment to see the full error message
          <Text color={"#000"}>100px</Text>
        </Box>
      </Grid>

      <Grid
        {...args}
        {...gridProps}
        columnsProp={{ count: 3, size: ["100px", "1fr"] }}
      >
        // @ts-expect-error TS(2322): Type '{ children: Element; backgroundProp: string;... Remove this comment to see the full error message
        <Box {...boxProps} backgroundProp="#F4991A">
          // @ts-expect-error TS(2322): Type '{ children: string; color: string; }' is not... Remove this comment to see the full error message
          <Text color={"#000"}>minmax(100px,1fr)</Text>
        </Box>
        // @ts-expect-error TS(2322): Type '{ children: Element; backgroundProp: string;... Remove this comment to see the full error message
        <Box {...boxProps} backgroundProp="#F2EAD3">
          // @ts-expect-error TS(2322): Type '{ children: string; color: string; }' is not... Remove this comment to see the full error message
          <Text color={"#000"}>minmax(100px,1fr)</Text>
        </Box>
        // @ts-expect-error TS(2322): Type '{ children: Element; backgroundProp: string;... Remove this comment to see the full error message
        <Box {...boxProps} backgroundProp="#F9F5F0">
          // @ts-expect-error TS(2322): Type '{ children: string; color: string; }' is not... Remove this comment to see the full error message
          <Text color={"#000"}>minmax(100px,1fr)</Text>
        </Box>
      </Grid>
    </>
  );
};

const TemplateRows = (args: any) => {
  return (
    <>
      <Grid
        {...args}
        {...gridProps}
        rowsProp={["100px", ["100px", "1fr"], "auto"]}
      >
        // @ts-expect-error TS(2322): Type '{ children: Element; backgroundProp: string;... Remove this comment to see the full error message
        <Box {...boxProps} backgroundProp="#F4991A">
          // @ts-expect-error TS(2322): Type '{ children: string; color: string; }' is not... Remove this comment to see the full error message
          <Text color={"#000"}>100px</Text>
        </Box>
        // @ts-expect-error TS(2322): Type '{ children: Element; backgroundProp: string;... Remove this comment to see the full error message
        <Box {...boxProps} backgroundProp="#F2EAD3">
          // @ts-expect-error TS(2322): Type '{ children: string; color: string; }' is not... Remove this comment to see the full error message
          <Text color={"#000"}>minmax(100px,1fr)</Text>
        </Box>
        // @ts-expect-error TS(2322): Type '{ children: Element; backgroundProp: string;... Remove this comment to see the full error message
        <Box {...boxProps} backgroundProp="#F9F5F0">
          // @ts-expect-error TS(2322): Type '{ children: string; color: string; }' is not... Remove this comment to see the full error message
          <Text color={"#000"}>auto</Text>
        </Box>
      </Grid>

      <Grid {...args} {...gridProps} rowsProp="50px">
        // @ts-expect-error TS(2322): Type '{ children: Element; backgroundProp: string;... Remove this comment to see the full error message
        <Box {...boxProps} backgroundProp="#F4991A">
          // @ts-expect-error TS(2322): Type '{ children: string; color: string; }' is not... Remove this comment to see the full error message
          <Text color={"#000"}>50px</Text>
        </Box>
        // @ts-expect-error TS(2322): Type '{ children: Element; backgroundProp: string;... Remove this comment to see the full error message
        <Box {...boxProps} backgroundProp="#F2EAD3">
          // @ts-expect-error TS(2322): Type '{ children: string; color: string; }' is not... Remove this comment to see the full error message
          <Text color={"#000"}>50px</Text>
        </Box>
        // @ts-expect-error TS(2322): Type '{ children: Element; backgroundProp: string;... Remove this comment to see the full error message
        <Box {...boxProps} backgroundProp="#F9F5F0">
          // @ts-expect-error TS(2322): Type '{ children: string; color: string; }' is not... Remove this comment to see the full error message
          <Text color={"#000"}>50px</Text>
        </Box>
      </Grid>
    </>
  );
};

const TemplateLayout = (args: any) => {
  return (
    <Grid
      {...args}
      widthProp="100vw"
      heightProp="100vh"
      gridGap="10px"
      rowsProp={["auto", "1fr", "auto"]}
      columnsProp={[["100px", "1fr"], "3fr", ["100px", "1fr"]]}
      areasProp={[
        { name: "header", start: [0, 0], end: [2, 0] },
        { name: "navbar", start: [0, 1], end: [0, 1] },
        { name: "main", start: [1, 1], end: [1, 1] },
        { name: "sidebar", start: [2, 1], end: [2, 1] },
        { name: "footer", start: [0, 2], end: [2, 2] },
      ]}
    >
      // @ts-expect-error TS(2322): Type '{ children: Element; gridArea: string; backg... Remove this comment to see the full error message
      <Box {...boxProps} gridArea="header" backgroundProp="#F4991A">
        // @ts-expect-error TS(2322): Type '{ children: string; color: string; }' is not... Remove this comment to see the full error message
        <Text color={"#000"}>header</Text>
      </Box>
      // @ts-expect-error TS(2322): Type '{ children: Element; gridArea: string; backg... Remove this comment to see the full error message
      <Box {...boxProps} gridArea="navbar" backgroundProp="#F2EAD3">
        // @ts-expect-error TS(2322): Type '{ children: string; color: string; }' is not... Remove this comment to see the full error message
        <Text color={"#000"}>navbar</Text>
      </Box>
      // @ts-expect-error TS(2322): Type '{ children: Element; gridArea: string; backg... Remove this comment to see the full error message
      <Box {...boxProps} gridArea="main" backgroundProp="#F9F5F0">
        // @ts-expect-error TS(2322): Type '{ children: string; color: string; }' is not... Remove this comment to see the full error message
        <Text color={"#000"}>main</Text>
      </Box>
      // @ts-expect-error TS(2322): Type '{ children: Element; gridArea: string; backg... Remove this comment to see the full error message
      <Box {...boxProps} gridArea="sidebar" backgroundProp="#F2EAD3">
        // @ts-expect-error TS(2322): Type '{ children: string; color: string; }' is not... Remove this comment to see the full error message
        <Text color={"#000"}>sidebar</Text>
      </Box>
      // @ts-expect-error TS(2322): Type '{ children: Element; gridArea: string; backg... Remove this comment to see the full error message
      <Box {...boxProps} gridArea="footer" backgroundProp="#F4991A">
        // @ts-expect-error TS(2322): Type '{ children: string; color: string; }' is not... Remove this comment to see the full error message
        <Text color={"#000"}>footer</Text>
      </Box>
    </Grid>
  );
};

export const Default = Template.bind({});
// @ts-expect-error TS(2339): Property 'args' does not exist on type '(args: any... Remove this comment to see the full error message
Default.args = {
  columnsProp: ["200px", ["100px", "1fr"], "auto"],
};
export const Columns = TemplateColumns.bind({});
export const Rows = TemplateRows.bind({});
export const Layout = TemplateLayout.bind({});
