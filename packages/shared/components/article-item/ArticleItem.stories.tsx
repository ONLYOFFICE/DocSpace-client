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
import { BrowserRouter } from "react-router";

import CatalogFolderReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.folder.react.svg?url";
import CatalogTrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.trash.react.svg?url";

import { ArticleItemPure } from ".";
import styles from "./ArticleItem.module.scss";

const defaultLinkData = {
  path: "",
  state: {},
};

const meta = {
  title: "Base UI Components/ArticleItem",
  component: ArticleItemPure,
  parameters: {
    docs: {
      description: {
        component:
          "Display catalog item. Can show only icon. If is it end of block - adding margin bottom.",
      },
    },
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?type=design&node-id=474-2027&mode=design&t=TBNCKMQKQMxr44IZ-0",
    },
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <div className={styles.storyCatalogWrapper} style={{ width: "250px" }}>
          <Story />
        </div>
      </BrowserRouter>
    ),
  ],
  args: {
    icon: CatalogFolderReactSvgUrl,
    text: "Documents",
    showText: true,
    linkData: defaultLinkData,
  },
  argTypes: {
    showText: { control: "boolean" },
    showBadge: { control: "boolean" },
    isActive: { control: "boolean" },
    isDragging: { control: "boolean" },
    isDragActive: { control: "boolean" },
    isHeader: { control: "boolean" },
    isFirstHeader: { control: "boolean", if: { arg: "isHeader" } },
    isEndOfBlock: { control: "boolean" },
    showInitial: { control: "boolean" },
    labelBadge: { control: "text" },
    text: { control: "text" },
  },
} satisfies Meta<typeof ArticleItemPure>;

type Story = StoryObj<typeof ArticleItemPure>;

export default meta;

export const Default: Story = {
  args: {},
};

export const IconOnly: Story = {
  args: {
    showText: false,
    showBadge: false,
  },
  decorators: [
    (Story) => (
      <div className={styles.storyCatalogWrapper} style={{ width: "52px" }}>
        <Story />
      </div>
    ),
  ],
};

export const WithBadge: Story = {
  args: {
    showBadge: true,
    labelBadge: "42",
  },
};

export const WithCustomBadge: Story = {
  args: {
    showBadge: true,
    iconBadge: CatalogTrashReactSvgUrl,
  },
};

export const Active: Story = {
  args: {
    isActive: true,
    showBadge: true,
    labelBadge: "New",
  },
};

export const Dragging: Story = {
  args: {
    isDragging: true,
  },
};

export const DragTarget: Story = {
  args: {
    isDragActive: true,
  },
};

export const Header: Story = {
  args: {
    text: "RECENT",
    isHeader: true,
    showText: true,
  },
};

export const EndOfBlock: Story = {
  render: () => (
    <>
      <ArticleItemPure
        icon={CatalogFolderReactSvgUrl}
        text="First Item"
        showText
        showBadge
        isEndOfBlock
        labelBadge="3"
        linkData={defaultLinkData}
      />
      <ArticleItemPure
        icon={CatalogFolderReactSvgUrl}
        text="Second Item"
        showText
        showBadge
        iconBadge={CatalogTrashReactSvgUrl}
        linkData={defaultLinkData}
      />
    </>
  ),
};
