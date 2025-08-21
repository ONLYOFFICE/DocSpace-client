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
import PublicRoomIconReactSvgUrl from "PUBLIC_DIR/images/icons/32/room/public.svg?url";
import UnpinReactSvgUrl from "PUBLIC_DIR/images/unpin.react.svg?url";

import { RoomsType } from "../../../enums";

import { Link } from "../../link";
import { IconButton } from "../../icon-button";
import { IconSizeType } from "../../../utils";
import i18nextStoryDecorator from "../../../.storybook/decorators/i18nextStoryDecorator";

import { RoomTile } from "./RoomTile";
import { RoomTileProps } from "./RoomTile.types";
import { TileContent } from "../tile-content/TileContent";

const element = (
  <ReactSVG
    className="room-icon-empty"
    src={PublicRoomIconReactSvgUrl}
    data-testid="empty-icon"
  />
);

const badges = (
  <div className="badges">
    <IconButton
      onClick={() => {}}
      className="badge icons-group is-pinned tablet-badge tablet-pinned"
      iconName={UnpinReactSvgUrl}
      size={IconSizeType.medium}
    />
  </div>
);

const contextOptions = [
  {
    id: "option_edit",
    key: "edit",
    label: "Edit",
    onClick: () => {},
    disabled: false,
  },
  {
    id: "option_delete",
    key: "delete",
    label: "Delete",
    onClick: () => {},
    disabled: false,
  },
];

const meta = {
  title: "Components/RoomTile",
  component: RoomTile,
  parameters: {
    docs: {
      description: {
        component:
          "Room tile component for displaying room information in a tile format",
      },
    },
  },
  argTypes: {
    checked: { control: "boolean" },
    isActive: { control: "boolean" },
    isBlockingOperation: { control: "boolean" },
    indeterminate: { control: "boolean" },
  },
  decorators: [i18nextStoryDecorator],
} satisfies Meta<typeof RoomTile>;

type Story = StoryObj<typeof meta>;

export default meta;

const Template = ({ checked: initialChecked, ...args }: RoomTileProps) => {
  const [checked, setChecked] = useState(initialChecked);

  const onSelect = (isSelected: boolean) => {
    setChecked(isSelected);
  };

  return (
    <div style={{ maxWidth: "300px", margin: "30px" }}>
      <RoomTile {...args} checked={checked} onSelect={onSelect}>
        <TileContent>
          <Link>Room Content</Link>
        </TileContent>
      </RoomTile>
    </div>
  );
};

export const Default: Story = {
  render: Template,
  args: {
    item: {
      id: "room-1",
      title: "Sample Room",
      roomType: "collaboration",
      tags: [
        {
          label: "Collaboration",
          roomType: RoomsType.EditingRoom,
        },
      ],
      contextOptions,
    },
    element,
    contextOptions,
    badges,
    thumbnailClick: () => {},
    getContextModel: () => contextOptions,
    selectTag: () => {},
    selectOption: () => {},
    getRoomTypeName: (type: string) => type,
    columnCount: 1,
  },
  parameters: {
    docs: {
      description: {
        story: "Basic room tile with selection functionality",
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
        story: "Room tile in checked state",
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
        story: "File tile showing progress state",
      },
    },
  },
};

export const BlockingOperation: Story = {
  render: Template,
  args: {
    ...Default.args,
    isBlockingOperation: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Room tile showing blocking operation state",
      },
    },
  },
};
