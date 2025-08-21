// (c) Copyright Ascensio System SIA 2009-2025
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
import { ReactSVG } from "react-svg";
import Folder32ReactSvgUrl from "PUBLIC_DIR/images/icons/32/folder.svg?url";
import ImageReactSvgUrl from "PUBLIC_DIR/images/icons/96/folder.svg?url";
import { Link } from "../../link";
import { Badge } from "../../badge";
import i18nextStoryDecorator from "../../../.storybook/decorators/i18nextStoryDecorator";

import { FolderTile } from "./FolderTile";
import { FolderTileProps } from "./FolderTile.types";
import { TileContent } from "../tile-content/TileContent";

const element = (
  <ReactSVG
    className="folder-icon"
    src={Folder32ReactSvgUrl}
    data-testid="folder-icon"
  />
);

const contextOptions = [
  {
    id: "option_copy-to",
    key: "copy-to",
    label: "Copy",
    onClick: () => {},
    disabled: false,
  },
  {
    id: "option_move-to",
    key: "move-to",
    label: "Move to",
    onClick: () => {},
    disabled: false,
  },
];

const badges = (
  <div className="badges">
    <Badge
      noHover
      className="badge badge-version tablet-badge icons-group"
      backgroundColor="#A3A9AE"
      label="1"
      title="my badge"
      style={{
        width: "max-content",
      }}
      onClick={() => {}}
    />
  </div>
);

const meta = {
  title: "Components/FolderTile",
  component: FolderTile,
  parameters: {
    docs: {
      description: {
        component:
          "Folder tile component for displaying folder information in a tile format",
      },
    },
  },
  argTypes: {
    checked: { control: "boolean" },
    inProgress: { control: "boolean" },
    indeterminate: { control: "boolean" },
  },
  decorators: [i18nextStoryDecorator],
} satisfies Meta<typeof FolderTile>;

type Story = StoryObj<typeof meta>;

export default meta;

const Template = ({ checked: initialChecked, ...args }: FolderTileProps) => {
  const [checked, setChecked] = useState(initialChecked);

  const onSelect = (isSelected: boolean) => {
    setChecked(isSelected);
  };

  return (
    <div style={{ maxWidth: "300px", margin: "30px" }}>
      <FolderTile {...args} checked={checked} onSelect={onSelect}>
        <TileContent>
          <Link>Folder Content</Link>
        </TileContent>
      </FolderTile>
    </div>
  );
};

export const Default: Story = {
  render: Template,
  args: {
    item: {
      id: "folder-1",
      title: "My Folder",
      isFolder: true,
      contextOptions: ["copy-to", "move-to"],
    },
    element,
    contextOptions,
    badges,
    onSelect: () => {},
    setSelection: () => {},
    withCtrlSelect: () => {},
    withShiftSelect: () => {},
    getContextModel: () => contextOptions,
  },
  parameters: {
    docs: {
      description: {
        story: "Basic folder tile with selection functionality",
      },
    },
  },
};

export const Big: Story = {
  render: Template,
  args: {
    item: {
      id: "folder-1",
      title: "My Folder",
      isFolder: true,
      contextOptions: ["copy-to", "move-to"],
    },
    element,
    contextOptions,
    badges,
    isBigFolder: true,
    temporaryIcon: ImageReactSvgUrl,
    onSelect: () => {},
    setSelection: () => {},
    withCtrlSelect: () => {},
    withShiftSelect: () => {},
    getContextModel: () => contextOptions,
  },
  parameters: {
    docs: {
      description: {
        story: "Big folder tile with selection functionality",
      },
    },
  },
};

export const Checked: Story = {
  render: Template,
  args: {
    ...Default.args,
    checked: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Folder tile in checked state",
      },
    },
  },
};

export const InProgress: Story = {
  render: Template,
  args: {
    ...Default.args,
    inProgress: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Folder tile in progress state",
      },
    },
  },
};
