import React from "react";
import { Meta, StoryObj } from "@storybook/react";

import { Box } from "../box";

import { SnackBar } from "./Snackbar";
import { SnackbarProps } from "./Snackbar.types";

const meta = {
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
} satisfies Meta<typeof SnackBar>;
type Story = StoryObj<typeof meta>;

export default meta;

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <Box id="main-bar" displayProp="grid">
    {children}
  </Box>
);

const BaseTemplate = (args: SnackbarProps) => (
  <Wrapper>
    <SnackBar {...args} onClose={() => {}} />
  </Wrapper>
);

export const base: Story = {
  render: (args) => <BaseTemplate {...args} />,
  args: {
    backgroundImg: "",
    backgroundColor: "#f8f7bf",
    textColor: "#000",
    opacity: 1,
    headerText: "Attention",
    text: "We apologize for any short-term technical issues in service functioning, that may appear on 22.06.2021 during the update of Onlyoffice Personal.",
    showIcon: true,
    fontSize: "13px",
    fontWeight: 400,
    textAlign: "left",
    htmlContent: "",
    countDownTime: 0,
    sectionWidth: 500,
  },
};
