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

import React, { useState, useEffect } from "react";
import { Meta, StoryObj } from "@storybook/react";

import ViewRowsReactSvg from "PUBLIC_DIR/images/view-rows.react.svg?url";
import ViewTilesReactSvg from "PUBLIC_DIR/images/view-tiles.react.svg?url";
import EyeReactSvg from "PUBLIC_DIR/images/eye.react.svg?url";

import { ViewSelector } from ".";
import { ViewSelectorProps } from "./ViewSelector.types";

const meta: Meta<typeof ViewSelector> = {
  title: "Interactive elements/ViewSelector",
  component: ViewSelector,
  parameters: {
    docs: {
      description: {
        component:
          "A component that allows users to switch between different view modes (e.g., row, tile, some).",
      },
    },
  },
  argTypes: {
    viewAs: {
      control: "select",
      options: ["row", "tile", "some"],
      description: "The currently active view mode",
    },
    isDisabled: {
      control: "boolean",
      description: "Whether the view selector is disabled",
    },
    isFilter: {
      control: "boolean",
      description: "Whether to show only one view option at a time",
    },
    className: {
      control: "text",
      description: "Additional CSS class name",
    },
    style: {
      control: "object",
      description: "Additional CSS styles",
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "16px" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ViewSelector>;

const defaultViewSettings = [
  {
    value: "row",
    icon: ViewRowsReactSvg,
    id: "row-view",
  },
  {
    value: "tile",
    icon: ViewTilesReactSvg,
    id: "tile-view",
  },
  {
    value: "some",
    icon: EyeReactSvg,
    id: "some-view",
  },
];

const InteractiveTemplate = ({
  viewAs: argsViewAs,
  ...rest
}: ViewSelectorProps) => {
  const [viewAs, setViewAs] = useState(argsViewAs);

  useEffect(() => {
    setViewAs(argsViewAs);
  }, [argsViewAs]);

  return (
    <ViewSelector
      {...rest}
      viewAs={viewAs}
      onChangeView={(view) => setViewAs(view)}
    />
  );
};

export const Default: Story = {
  render: InteractiveTemplate,
  args: {
    viewSettings: defaultViewSettings,
    viewAs: "row",
    isDisabled: false,
    isFilter: false,
  },
};

export const Disabled: Story = {
  render: InteractiveTemplate,
  args: {
    ...Default.args,
    isDisabled: true,
  },
};

export const FilterMode: Story = {
  render: InteractiveTemplate,
  args: {
    ...Default.args,
    isFilter: true,
  },
};
