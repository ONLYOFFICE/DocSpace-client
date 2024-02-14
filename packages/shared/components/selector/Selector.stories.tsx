import React from "react";
import styled from "styled-components";
import { Meta, StoryObj } from "@storybook/react";

import CustomSvgUrl from "PUBLIC_DIR/images/icons/32/room/custom.svg?url";
import ArchiveSvgUrl from "PUBLIC_DIR/images/room.archive.svg?url";
import EmptyScreenFilter from "PUBLIC_DIR/images/empty_screen_filter.png";

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
      key: `user_${i}`,
      id: `user_${i}`,
      label: `${label} ${i}`,
      icon: CustomSvgUrl,
      shared: false,
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

export const Default: Story = {
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
