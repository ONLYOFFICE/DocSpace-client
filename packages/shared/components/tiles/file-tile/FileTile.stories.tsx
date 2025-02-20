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
import { FileTile } from "./FileTile";
import { FileTileProps } from "./FileTile.types";
import { ReactSVG } from "react-svg";
import File32ReactSvgUrl from "PUBLIC_DIR/images/icons/32/file.svg?url";
import ImageReactSvgUrl from "PUBLIC_DIR/images/empty_screen_done.svg?url";
import { Link } from "../../link";
import { Badge } from "../../badge";
import { ColorTheme } from "../../color-theme/ColorTheme";
import { ThemeId } from "../../color-theme/ColorTheme.enums";

import LockedReact12SvgUrl from "PUBLIC_DIR/images/icons/12/lock.react.svg?url";
import { IconSizeType } from "../../../utils";
import i18nextStoryDecorator from "../../../.storybook/decorators/i18nextStoryDecorator";
import { TileContent } from "../tile-content/TileContent";

const element = (
  <ReactSVG
    className="room-icon-empty"
    src={File32ReactSvgUrl}
    data-testid="empty-icon"
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
      isVersionBadge
      className="badge badge-version badge-version-current tablet-badge icons-group"
      backgroundColor="#A3A9AE"
      label="New"
      title="my badge"
      style={{
        width: "max-content",
      }}
      onClick={() => {}}
    />
  </div>
);

const contentElement = (
  <div className="badges">
    <ColorTheme
      themeId={ThemeId.IconButton}
      iconName={LockedReact12SvgUrl}
      className="badge lock-file icons-group"
      size={IconSizeType.medium}
      data-id="file-lock"
      data-locked={false}
      onClick={() => {}}
      color="#A3A9AE"
      isDisabled={false}
      hoverColor="#A3A9AE"
      title="Lock file"
    />
  </div>
);

const meta = {
  title: "Components/FileTile",
  component: FileTile,
  parameters: {
    docs: {
      description: {
        component:
          "File tile component for displaying file information in a tile format",
      },
    },
  },
  argTypes: {
    checked: { control: "boolean" },
    dragging: { control: "boolean" },
    inProgress: { control: "boolean" },
  },
  decorators: [i18nextStoryDecorator],
} satisfies Meta<typeof FileTile>;

type Story = StoryObj<typeof meta>;

export default meta;

const Template = (args: FileTileProps) => {
  const [checked, setChecked] = useState(args.checked);

  const onSelect = (isSelected: boolean, item: any) => {
    setChecked(isSelected);
  };

  return (
    <div style={{ maxWidth: "300px", margin: "30px" }}>
      <FileTile {...args} checked={checked} onSelect={onSelect}>
        <TileContent>
          <Link>File Content</Link>
        </TileContent>
      </FileTile>
    </div>
  );
};

export const Default: Story = {
  render: (args) => Template(args),
  args: {
    item: {
      id: "file-1",
      title: "Document.docx",
      fileExst: ".docx",
      fileType: "docx",
      contextOptions,
    },
    element,
    contextOptions,
    contentElement,
    badges: badges,
    temporaryIcon: ImageReactSvgUrl,
    onSelect: (item: any) => {},
    thumbnailClick: (e: React.MouseEvent) => {},
    setSelection: (checked: boolean) => {},
    withCtrlSelect: (item: any) => {},
    withShiftSelect: (item: any) => {},
    getContextModel: () => {
      return contextOptions;
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Basic file tile with selection functionality",
      },
    },
  },
};

export const Checked: Story = {
  render: (args) => Template(args),
  args: {
    ...Default.args,
    checked: true,
  },
  parameters: {
    docs: {
      description: {
        story: "File tile in checked state",
      },
    },
  },
};

export const InProgress: Story = {
  render: (args) => Template(args),
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
