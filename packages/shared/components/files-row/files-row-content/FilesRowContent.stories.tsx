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

import React from "react";
import { Meta, StoryObj } from "@storybook/react";

import LinkReactSvgUrl from "PUBLIC_DIR/images/link.react.svg?url";

import { Link } from "../../link";

import { FilesRowContent } from ".";
import { IconSizeType } from "../../../utils";
import { IconButton } from "../../icon-button";

const MainContent = (
  <Link>
    File name<span className="item-file-exst">.exst</span>
  </Link>
);

const MainIcons = (
  <IconButton
    iconName={LinkReactSvgUrl}
    size={IconSizeType.small}
    hoverColor="accent"
  />
);

const SideElement = <span className="row_update-text">01/01/1970 00:00</span>;

const meta = {
  title: "Components/FilesRow/FilesRowContent",
  component: FilesRowContent,
  parameters: {
    docs: {
      description: {
        component:
          "FilesRowContent component for displaying file information and badges within a row layout",
      },
    },
  },
  argTypes: {
    disableSideInfo: { control: "boolean" },
    sideColor: { control: "color" },

    // Disabled controls
    children: { table: { disable: true } },
    className: { table: { disable: true } },
    id: { table: { disable: true } },
    onClick: { table: { disable: true } },
    style: { table: { disable: true } },
    convertSideInfo: { table: { disable: true } },
    sectionWidth: { table: { disable: true } },
  },
} satisfies Meta<typeof FilesRowContent>;

type Story = StoryObj<typeof FilesRowContent>;
export default meta;

export const Default: Story = {
  args: {
    children: [MainContent, MainIcons, SideElement],
  },
};

export const WithoutSideInfo: Story = {
  args: {
    disableSideInfo: true,
    children: [MainContent, MainIcons, SideElement],
  },
};

export const WithCustomSideColor: Story = {
  args: {
    sideColor: "#2DA7DB",
    children: [MainContent, MainIcons, SideElement],
  },
};
