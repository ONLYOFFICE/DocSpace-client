import React from "react";
import Box from "../box";
import SnackBar from "./";

export default {
  title: "Components/SnackBar",
  component: SnackBar,
  parameters: {
    docs: {
      description: {
        component: "SnackBar is used for displaying important messages.",
      },
    },
  },
  argTypes: {
    textColor: { control: "color" },
    backgroundColor: { control: "color" },
    showIcon: { control: "boolean" },
  },
};

const Wrapper = ({
  children
}: any) => (
  // @ts-expect-error TS(2322): Type '{ children: any; id: string; displayProp: st... Remove this comment to see the full error message
  <Box id="main-bar" displayProp="grid">
    {children}
  </Box>
);

const BaseTemplate = (args: any) => <Wrapper>
  // @ts-expect-error TS(2554): Expected 0-1 arguments, but got 2.
  <SnackBar {...args} onClose={(e: any) => alert("OnClose handled!", e)} />
</Wrapper>;

export const base = BaseTemplate.bind({});
// @ts-expect-error TS(2339): Property 'args' does not exist on type '(args: any... Remove this comment to see the full error message
base.args = {
  backgroundImg: "",
  backgroundColor: "#f8f7bf",
  textColor: "#000",
  opacity: 1,
  headerText: "Attention",
  text: "We apologize for any short-term technical issues in service functioning, that may appear on 22.06.2021 during the update of Onlyoffice Personal.",
  showIcon: true,
  fontSize: "13px",
  fontWeight: "400",
  textAlign: "left",
  htmlContent: "",
};
