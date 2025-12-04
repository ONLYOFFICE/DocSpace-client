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

// @ts-nocheck

import React from "react";
import { Meta, StoryObj } from "@storybook/react";

import ArchiveSvgUrl from "PUBLIC_DIR/images/room.archive.svg?url";
import FolderSvgUrl from "PUBLIC_DIR/images/icons/32/folder.svg?url";
import EmptyScreenFilter from "PUBLIC_DIR/images/emptyFilter/empty.filter.rooms.light.svg";

import { RoomsTypeValues } from "../../utils";

import RoomType from "../room-type";
import { AvatarRole } from "../avatar";
import {
  BreadCrumbsLoader,
  RowLoader,
  SearchLoader,
} from "../../skeletons/selector";

import { Selector } from "./Selector";
import { SelectorProps, TSelectorItem } from "./Selector.types";
import { globalColors } from "../../themes";
import { EmployeeStatus, EmployeeType } from "../../enums";

const meta = {
  title: "Components/Selector",
  component: Selector,
  parameters: {},
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

  // const items = <RoomType />;

  items.push({
    key: "create_new",
    id: "create_new_item",
    label: "New folder",
    isCreateNewItem: true,
    dropDownItems: RoomsTypeValues.map((value) => (
      <RoomType
        key={value}
        roomType={value}
        selectedId={value}
        type="dropdownItem"
        isOpen={false}
        onClick={() => {}}
      />
    )),
    onCreateClick: () => {},
    onBackClick: () => {},
  });

  items.push({
    key: "input_item",
    id: "input_item",
    label: "",
    isInputItem: true,
    icon: FolderSvgUrl,
    defaultInputValue: "New folder",
    onAcceptInput: () => {},
    onCancelInput: () => {},
  });

  for (let i = 0; i < count; i += 1) {
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
      isRoomAdmin: false,
      avatar: "",
      role: AvatarRole.owner,
      hasAvatar: false,
      userType: EmployeeType.Admin,
      status: EmployeeStatus.Active,
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
  const { isMultiSelect } = args;

  const [rendItems, setRendItems] = React.useState(renderedItems);
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);

  const loadNextPage = React.useCallback(async (index: number) => {
    setRendItems((val) => [...val, ...items.slice(index, index + 100)]);
  }, []);

  React.useEffect(() => {
    // Ensure initial scroll is at top with minimal interference and no jumps.
    const raf = requestAnimationFrame(() => {
      const root = wrapperRef.current;
      if (!root) return;

      const setTop = (node: unknown) => {
        try {
          if (
            node &&
            typeof node.scrollTop === "number" &&
            node.scrollTop > 0
          ) {
            node.scrollTo?.(0, 0);
            node.scrollTop = 0;
          }
        } catch (e) {
          console.log(e);
        }
      };

      const pageEl = (document.scrollingElement ||
        document.documentElement) as unknown as HTMLElement;
      setTop(pageEl);

      // Story-local scroll containers
      const scrollRoot = root.querySelector(
        ".selector-body-scroll",
      ) as HTMLElement | null;
      const scrollContent = root.querySelector(
        ".selector-body-scroll .scrollbar__content",
      ) as HTMLElement | null;
      [scrollRoot, scrollContent].forEach(setTop);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{
        width: "480px",
        height: "485px",
        border: `1px solid ${globalColors.grayLightMid}`,
        margin: "auto",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* @ts-expect-error args is good */}
      <Selector
        {...args}
        items={rendItems}
        loadNextPage={loadNextPage}
        searchLoader={<SearchLoader />}
        rowLoader={<RowLoader isUser={false} isMultiSelect={isMultiSelect} />}
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
    submitButtonLabel: "Add",
    onSubmit: () => {},
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
    breadCrumbsLoader: <BreadCrumbsLoader />,
    withoutBackButton: false,
    withSearch: false,
    isBreadCrumbsLoading: false,
    alwaysShowFooter: false,
    disableSubmitButton: false,
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
    submitButtonLabel: "Add",
    onSubmit: () => {},
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
    breadCrumbsLoader: <BreadCrumbsLoader />,
    withoutBackButton: false,
    withSearch: false,
    isBreadCrumbsLoading: false,
    withFooterInput: false,
    footerInputHeader: "",
    footerCheckboxLabel: "",
    currentFooterInputValue: "",
    alwaysShowFooter: false,
    disableSubmitButton: false,
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
    submitButtonLabel: "Add",
    onSubmit: () => {},
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
    breadCrumbsLoader: <BreadCrumbsLoader />,
    withoutBackButton: false,
    withSearch: false,
    isBreadCrumbsLoading: false,
    withFooterInput: true,
    footerInputHeader: "File name",
    footerCheckboxLabel: "Open saved document in new tab",
    currentFooterInputValue: "OldFIleName.docx",
    alwaysShowFooter: false,
    disableSubmitButton: false,
    descriptionText: "",
  },
};
