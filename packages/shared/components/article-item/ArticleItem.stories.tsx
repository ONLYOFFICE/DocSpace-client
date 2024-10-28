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
import styled from "styled-components";
import { Meta, StoryObj } from "@storybook/react";

import CatalogFolderReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.folder.react.svg?url";
import CatalogGuestReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.guest.react.svg?url";
import CatalogTrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.trash.react.svg?url";

import { ArticleItemPure } from "./ArticleItem";
import { ArticleItemProps } from "./ArticleItem.types";
import { injectDefaultTheme } from "../../utils";

const meta = {
  title: "Components/ArticleItem",
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
} satisfies Meta<typeof ArticleItemPure>;
type Story = StoryObj<typeof ArticleItemPure>;

export default meta;

const CatalogWrapper = styled.div.attrs(injectDefaultTheme)`
  background-color: ${(props) => props.theme.catalogItem.container.background};
  padding: 15px;
`;

const Template = (args: ArticleItemProps) => {
  return (
    <CatalogWrapper style={{ width: "250px" }}>
      <ArticleItemPure {...args} onClick={() => {}} onClickBadge={() => {}} />
    </CatalogWrapper>
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    icon: CatalogFolderReactSvgUrl,
    text: "Documents",
    showText: true,
    showBadge: true,
    isEndOfBlock: false,
    labelBadge: "2",
  },
};

const OnlyIcon = () => {
  return (
    <CatalogWrapper style={{ width: "52px" }}>
      <ArticleItemPure
        icon={CatalogFolderReactSvgUrl}
        text="My documents"
        showText={false}
        showBadge={false}
      />
    </CatalogWrapper>
  );
};

export const IconWithoutBadge: Story = { render: () => <OnlyIcon /> };

const OnlyIconWithBadge = () => {
  return (
    <CatalogWrapper style={{ width: "52px" }}>
      <ArticleItemPure
        icon={CatalogGuestReactSvgUrl}
        text="My documents"
        showText={false}
        showBadge
      />
    </CatalogWrapper>
  );
};

export const IconWithBadge: Story = { render: () => <OnlyIconWithBadge /> };

const InitialIcon = () => {
  return (
    <CatalogWrapper style={{ width: "52px" }}>
      <ArticleItemPure
        icon={CatalogFolderReactSvgUrl}
        text="Documents"
        showText={false}
        showBadge={false}
        showInitial
        onClick={() => {}}
      />
    </CatalogWrapper>
  );
};

export const IconWithInitialText: Story = { render: () => <InitialIcon /> };

const WithBadgeIcon = () => {
  return (
    <CatalogWrapper style={{ width: "250px" }}>
      <ArticleItemPure
        icon={CatalogFolderReactSvgUrl}
        text="My documents"
        showText
        showBadge
        iconBadge={CatalogTrashReactSvgUrl}
      />
    </CatalogWrapper>
  );
};

export const ItemWithBadgeIcon: Story = { render: () => <WithBadgeIcon /> };

const TwoItem = () => {
  return (
    <CatalogWrapper style={{ width: "250px" }}>
      <ArticleItemPure
        icon={CatalogFolderReactSvgUrl}
        text="My documents"
        showText
        showBadge
        onClick={() => {}}
        isEndOfBlock
        labelBadge={3}
        onClickBadge={() => {}}
      />
      <ArticleItemPure
        icon={CatalogFolderReactSvgUrl}
        text="Some text"
        showText
        showBadge
        onClick={() => {}}
        iconBadge={CatalogTrashReactSvgUrl}
        onClickBadge={() => {}}
      />
    </CatalogWrapper>
  );
};

export const ItemIsEndOfBlock: Story = { render: () => <TwoItem /> };
