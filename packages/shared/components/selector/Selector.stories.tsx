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

import CustomSvgUrl from "PUBLIC_DIR/images/icons/32/room/custom.svg?url";
import ArchiveSvgUrl from "PUBLIC_DIR/images/room.archive.svg?url";
import EmptyScreenFilter from "PUBLIC_DIR/images/empty_screen_filter.png";
import { RoomsType } from "../../enums";
import { Selector } from "./Selector";
import { SelectorProps, TSelectorItem } from "./Selector.types";

const StyledRowLoader = styled.div`
  width: 100%;
  height: 48px;
`;

const StyledSearchLoader = styled.div`
  width: 100%;
  height: 32px;
  background: black;
`;

const StyledBreadCrumbsLoader = styled.div`
  width: 100%;
  height: 54px;
  background: black;
`;

const meta = {
  title: "Components/Selector",
  component: Selector,
  parameters: {
    docs: {
      description: {
        component:
          "Selector for displaying items list of people or room selector",
      },
    },
  },
  // argTypes: {
  //   height: {
  //     table: {
  //       disable: true,
  //     },
  //   },
  // },
} satisfies Meta<typeof Selector>;
type Story = StoryObj<typeof meta>;

export default meta;

function makeName() {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < 15; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const getItems = (count: number) => {
  const items: TSelectorItem[] = [];

  for (let i = 0; i < count / 2; i += 1) {
    const label = makeName();
    items.push({
      key: `${label} ${i}`,
      id: `${label} ${i}`,
      label: `${label} ${i}`,
      email: "test",
      isOwner: false,
      isAdmin: false,
      isVisitor: false,
      isCollaborator: false,
      avatar: "",
    });
  }

  for (let i = 0; i < count / 2; i += 1) {
    const label = makeName();

    items.push({
      key: `room_${i}`,
      id: `room_${i}`,
      label: `${label} ${i}`,
      icon: CustomSvgUrl,
      shared: false,
      isFolder: true,
      roomType: RoomsType.CustomRoom,
    });
  }

  return items;
};

const getAccessRights = () => {
  const accesses = [
    {
      key: "roomManager",
      label: "Room manager",
      access: 0,
    },
    {
      key: "editor",
      label: "Editor",
      access: 1,
    },
    {
      key: "formFiller",
      label: "Form filler",
      access: 2,
    },
    {
      key: "reviewer",
      label: "Reviewer",
      access: 3,
    },
    {
      key: "commentator",
      label: "Commentator",
      access: 4,
    },
    {
      key: "viewer",
      label: "Viewer",
      access: 5,
    },
  ];

  return accesses;
};

const items = getItems(100000);

const selectedItems = [items[0], items[3], items[7]];

const accessRights = getAccessRights();

const selectedAccessRight = accessRights[1];

const renderedItems = items.slice(0, 100);
const totalItems = items.length;

const Template = (args: SelectorProps) => {
  const [rendItems, setRendItems] = React.useState(renderedItems);

  const loadNextPage = async (index: number) => {
    setRendItems((val) => [...val, ...items.slice(index, index + 100)]);
  };

  const rowLoader = <StyledRowLoader />;
  const searchLoader = <StyledSearchLoader className="search-loader" />;

  return (
    <div
      style={{
        width: "480px",
        height: "485px",
        border: "1px solid #eee",
        margin: "auto",
      }}
    >
      {/* @ts-expect-error args is good */}
      <Selector
        {...args}
        items={rendItems}
        loadNextPage={loadNextPage}
        searchLoader={searchLoader}
        rowLoader={rowLoader}
      />
    </div>
  );
};

// @ts-expect-error args is good
export const Default: Story = {
  // @ts-expect-error args is good
  render: (args) => <Template {...args} />,
  args: {
    headerLabel: "Room list",
    onBackClick: () => {},
    searchPlaceholder: "Search",
    searchValue: "",
    items: renderedItems,
    onSelect: () => {},
    isMultiSelect: false,
    selectedItems,
    acceptButtonLabel: "Add",
    onAccept: () => {},
    withSelectAll: false,
    selectAllLabel: "All accounts",
    selectAllIcon: ArchiveSvgUrl,
    onSelectAll: () => {},
    withAccessRights: false,
    accessRights,
    selectedAccessRight,
    onAccessRightsChange: () => {},
    withCancelButton: false,
    cancelButtonLabel: "Cancel",
    onCancel: () => {},
    emptyScreenImage: EmptyScreenFilter,
    emptyScreenHeader: "No other accounts here yet",
    emptyScreenDescription:
      "The list of users previously invited to DocSpace or separate rooms will appear here. You will be able to invite these users for collaboration at any time.",
    searchEmptyScreenImage: EmptyScreenFilter,
    searchEmptyScreenHeader: "No other accounts here yet search",
    searchEmptyScreenDescription:
      " SEARCH !!! The list of users previously invited to DocSpace or separate rooms will appear here. You will be able to invite these users for collaboration at any time.",
    totalItems,
    hasNextPage: true,
    isNextPageLoading: false,
    isLoading: false,
    withBreadCrumbs: false,
    breadCrumbs: [],
    onSelectBreadCrumb: () => {},
    breadCrumbsLoader: <StyledBreadCrumbsLoader />,
    withoutBackButton: false,
    withSearch: false,
    isBreadCrumbsLoading: false,
    alwaysShowFooter: false,
    disableAcceptButton: false,
    descriptionText: "",
  },
};
// @ts-expect-error args is good
export const BreadCrumbs: Story = {
  render: (args) => <Template {...args} />,
  args: {
    headerLabel: "Room list",
    onBackClick: () => {},
    searchPlaceholder: "Search",
    searchValue: "",
    items: renderedItems,
    onSelect: () => {},
    isMultiSelect: false,
    selectedItems,
    acceptButtonLabel: "Add",
    onAccept: () => {},
    withSelectAll: false,
    selectAllLabel: "All accounts",
    selectAllIcon: ArchiveSvgUrl,
    onSelectAll: () => {},
    withAccessRights: false,
    accessRights,
    selectedAccessRight,
    onAccessRightsChange: () => {},
    withCancelButton: false,
    cancelButtonLabel: "Cancel",
    onCancel: () => {},
    emptyScreenImage: EmptyScreenFilter,
    emptyScreenHeader: "No other accounts here yet",
    emptyScreenDescription:
      "The list of users previously invited to DocSpace or separate rooms will appear here. You will be able to invite these users for collaboration at any time.",
    searchEmptyScreenImage: EmptyScreenFilter,
    searchEmptyScreenHeader: "No other accounts here yet search",
    searchEmptyScreenDescription:
      " SEARCH !!! The list of users previously invited to DocSpace or separate rooms will appear here. You will be able to invite these users for collaboration at any time.",
    totalItems,
    hasNextPage: true,
    isNextPageLoading: false,
    isLoading: false,
    withBreadCrumbs: true,
    breadCrumbs: [
      { id: 1, label: "DocSpace" },
      { id: 2, label: "1111111" },
      { id: 3, label: "21222222222" },
      { id: 4, label: "32222222222222222222222222222222222222" },
      { id: 5, label: "4222222222222222222222222222222222222" },
    ],
    onSelectBreadCrumb: () => {},
    breadCrumbsLoader: <StyledBreadCrumbsLoader />,
    withoutBackButton: false,
    withSearch: false,
    isBreadCrumbsLoading: false,
    withFooterInput: false,
    footerInputHeader: "",
    footerCheckboxLabel: "",
    currentFooterInputValue: "",
    alwaysShowFooter: false,
    disableAcceptButton: false,
    descriptionText: "",
  },
};
// @ts-expect-error args is good
export const NewName: Story = {
  render: (args) => <Template {...args} />,
  args: {
    headerLabel: "Room list",
    onBackClick: () => {},
    searchPlaceholder: "Search",
    searchValue: "",
    items: renderedItems,
    onSelect: () => {},
    isMultiSelect: false,
    selectedItems,
    acceptButtonLabel: "Add",
    onAccept: () => {},
    withSelectAll: false,
    selectAllLabel: "All accounts",
    selectAllIcon: ArchiveSvgUrl,
    onSelectAll: () => {},
    withAccessRights: false,
    accessRights,
    selectedAccessRight,
    onAccessRightsChange: () => {},
    withCancelButton: false,
    cancelButtonLabel: "Cancel",
    onCancel: () => {},
    emptyScreenImage: EmptyScreenFilter,
    emptyScreenHeader: "No other accounts here yet",
    emptyScreenDescription:
      "The list of users previously invited to DocSpace or separate rooms will appear here. You will be able to invite these users for collaboration at any time.",
    searchEmptyScreenImage: EmptyScreenFilter,
    searchEmptyScreenHeader: "No other accounts here yet search",
    searchEmptyScreenDescription:
      " SEARCH !!! The list of users previously invited to DocSpace or separate rooms will appear here. You will be able to invite these users for collaboration at any time.",
    totalItems,
    hasNextPage: true,
    isNextPageLoading: false,
    isLoading: false,
    withBreadCrumbs: true,
    breadCrumbs: [
      { id: 1, label: "DocSpace" },
      { id: 2, label: "1111111" },
      { id: 3, label: "21222222222" },
    ],
    onSelectBreadCrumb: () => {},
    breadCrumbsLoader: <StyledBreadCrumbsLoader />,
    withoutBackButton: false,
    withSearch: false,
    isBreadCrumbsLoading: false,
    withFooterInput: true,
    footerInputHeader: "File name",
    footerCheckboxLabel: "Open saved document in new tab",
    currentFooterInputValue: "OldFIleName.docx",
    alwaysShowFooter: false,
    disableAcceptButton: false,
    descriptionText: "",
  },
};
