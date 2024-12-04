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

import { Loader } from ".";
import { LoaderTypes } from "./Loader.enums";
import { globalColors } from "../../themes";

const meta = {
  title: "Components/Loader",
  component: Loader,
  parameters: {
    docs: {
      description: {
        component:
          "Loader component is used for displaying loading actions on a page",
      },
    },
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?type=design&node-id=419-1989&mode=design&t=TBNCKMQKQMxr44IZ-0",
    },
  },
  argTypes: {
    color: { control: "color" },
  },
} satisfies Meta<typeof Loader>;
type Story = StoryObj<typeof Loader>;

export default meta;

export const Default: Story = {
  render: (args) => (
    <div style={{ height: "100px" }}>
      <Loader {...args} />
    </div>
  ),
  args: {
    type: LoaderTypes.base,
    color: globalColors.loaderLight,
    size: "18px",
    label: "Loading content, please wait...",
  },
};

export const Examples = {
  render: () => {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
          height: "100px",
        }}
      >
        <Loader
          type={LoaderTypes.base}
          color={globalColors.loaderLight}
          size="18px"
          label="Loading content, please wait..."
        />
        <Loader
          type={LoaderTypes.dualRing}
          color={globalColors.loaderLight}
          size="40px"
          label="Loading content, please wait."
        />
        <Loader
          type={LoaderTypes.oval}
          color={globalColors.loaderLight}
          size="40px"
          label="Loading content, please wait."
        />
        <Loader type={LoaderTypes.rombs} color="" size="40px" />
        <Loader type={LoaderTypes.track} color="" style={{ width: "30px" }} />
      </div>
    );
  },
};
