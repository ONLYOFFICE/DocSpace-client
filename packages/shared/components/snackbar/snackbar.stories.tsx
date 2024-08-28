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

import { SnackBar } from "./Snackbar";
import { SnackbarProps } from "./Snackbar.types";
import { globalColors } from "../../themes";

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
    backgroundColor: globalColors.lightToastInfo,
    textColor: globalColors.darkBlack,
    opacity: 1,
    headerText: "Attention",
    text: "We apologize for any short-term technical issues in service functioning, that may appear on 22.06.2021 during the update of ONLYOFFICE Personal.",
    showIcon: true,
    fontSize: "13px",
    fontWeight: 400,
    textAlign: "left",
    htmlContent: "",
    countDownTime: 0,
    sectionWidth: 500,
  },
};
