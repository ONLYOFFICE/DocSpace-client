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

import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";

import ViewRowsReactSvg from "PUBLIC_DIR/images/view-rows.react.svg?url";
import ViewTilesReactSvg from "PUBLIC_DIR/images/view-tiles.react.svg?url";
import EyeReactSvg from "PUBLIC_DIR/images/eye.react.svg?url";

import { Box } from "../box";
import { ViewSelector } from "./ViewSelector";
import { ViewSelectorProps } from "./ViewSelector.types";

const meta = {
  title: "Components/ViewSelector",
  component: ViewSelector,
  parameters: {
    docs: {
      description: {
        component: "Actions with a button.",
      },
    },
  },
  argTypes: {
    onChangeView: {
      action: "onChangeView",
    },
  },
} satisfies Meta<typeof ViewSelector>;
type Story = StoryObj<typeof meta>;

export default meta;

const Template = ({
  onChangeView,
  viewAs,
  viewSettings,
  isDisabled,
  isFilter,
  ...rest
}: ViewSelectorProps) => {
  const [view, setView] = useState(viewAs);

  return (
    <Box paddingProp="16px">
      <ViewSelector
        {...rest}
        isDisabled={isDisabled}
        viewSettings={viewSettings}
        viewAs={view}
        isFilter={isFilter}
        onChangeView={(v) => {
          onChangeView(v);
          setView(v);
        }}
      />
    </Box>
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    viewSettings: [
      {
        value: "row",
        icon: ViewRowsReactSvg,
      },
      {
        value: "tile",
        icon: ViewTilesReactSvg,
        callback: () => {},
      },
      {
        value: "some",
        icon: EyeReactSvg,
        callback: () => {},
      },
    ],
    viewAs: "row",
    isDisabled: false,
    isFilter: false,
  },
};
