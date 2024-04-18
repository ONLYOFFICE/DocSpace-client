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

import { Meta, StoryObj } from "@storybook/react";

import CatalogFolderReactSvgUrl from "PUBLIC_DIR/images/catalog.folder.react.svg?url";

import { MainButton } from "./MainButton";

const meta = {
  title: "Components/MainButton",
  component: MainButton,
  parameters: { docs: { description: { component: "Components/MainButton" } } },
  // onAction: { action: "onAction" },
  // clickItem: { action: "clickItem", table: { disable: true } },
} satisfies Meta<typeof MainButton>;

type Story = StoryObj<typeof meta>;

export default meta;

const itemsModel = [
  {
    key: 0,
    label: "New document",
    icon: CatalogFolderReactSvgUrl,
  },
  {
    key: 1,
    label: "New spreadsheet",
    icon: CatalogFolderReactSvgUrl,
  },
  {
    key: 2,
    label: "New presentation",
    icon: CatalogFolderReactSvgUrl,
  },
  {
    key: 3,
    label: "Master form",
    icon: CatalogFolderReactSvgUrl,
    items: [
      {
        key: 4,
        label: "From blank",
      },
      {
        key: 5,
        label: "From an existing text file",
      },
    ],
  },
  {
    key: 6,
    label: "New folder",
    icon: CatalogFolderReactSvgUrl,
  },
  {
    key: 7,
    isSeparator: true,
  },
  {
    key: 8,
    label: "Upload",
    icon: CatalogFolderReactSvgUrl,
  },
];

export const Default: Story = {
  args: {
    isDisabled: false,
    isDropdown: true,
    text: "Actions",
    model: itemsModel,
    style: {
      maxWidth: "210px",
    },
  },
};
