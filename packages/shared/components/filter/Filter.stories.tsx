import React from "react";
import { StoryFn, Meta } from "@storybook/react";

import ViewRowsReactSvgUrl from "PUBLIC_DIR/images/view-rows.react.svg?url";
import ViewTilesReactSvgUrl from "PUBLIC_DIR/images/view-tiles.react.svg?url";

import { DeviceType, FilterGroups } from "../../enums";
import Filter from ".";
import {
  FilterProps,
  TGetSelectedSortData,
  TSortDataItem,
} from "./Filter.types";

export default {
  title: "Layout components/Filter",
  component: Filter,
  argTypes: {
    onSearch: { action: "onSearch" },
    onClearFilter: { action: "onClearFilter" },
    onChangeViewAs: { action: "onChangeViewAs" },
    onSort: { action: "onSort" },
    onFilter: { action: "onFilter" },
    onSortButtonClick: { action: "onSortButtonClick" },
  },
} as Meta;

const mockFilterData = [
  {
    group: FilterGroups.filterType,
    key: "documents",
    label: "Documents",
    isHeader: true,
    groupItem: [
      {
        group: FilterGroups.filterType,
        key: "doc",
        label: "DOC",
        isSelected: false,
      },
      {
        group: FilterGroups.filterType,
        key: "pdf",
        label: "PDF",
        isSelected: false,
      },
    ],
  },
];

const mockSortData: TSortDataItem[] = [
  {
    key: "name",
    label: "Name",
    isSelected: false,
    id: "1",
    className: "",
    sortDirection: "asc",
    sortId: "1",
  },
  {
    key: "modified",
    label: "Modified",
    isSelected: false,
    id: "2",
    className: "",
    sortDirection: "asc",
    sortId: "1",
  },
];

const Template: StoryFn<FilterProps> = (args) => <Filter {...args} />;

export const Default = Template.bind({});
Default.args = {
  placeholder: "Search...",
  isIndexEditingMode: false,
  getSortData: () => mockSortData,
  getSelectedSortData: (() => {}) as TGetSelectedSortData,
  view: "tile",
  viewAs: "tile",
  viewSelectorVisible: true,
  getFilterData: () => Promise.resolve(mockFilterData),
  getSelectedFilterData: () => Promise.resolve([]),
  getViewSettingsData: () => [
    { id: "1", label: "Grid", value: "tile", icon: ViewTilesReactSvgUrl },
    { id: "2", label: "List", value: "row", icon: ViewRowsReactSvgUrl },
  ],
  isRecentFolder: false,
  isRooms: false,
  isContactsPage: false,
  isContactsPeoplePage: false,
  isContactsGroupsPage: false,
  isContactsInsideGroupPage: false,
  isContactsGuestsPage: false,
  isIndexing: false,
  filterTitle: "Filter",
  sortByTitle: "Sort by",
  currentDeviceType: DeviceType.desktop,
  userId: "1",
  filterHeader: "Filter",
  selectorLabel: "Select",
};

export const EditingMode = Template.bind({});
EditingMode.args = {
  ...Default.args,
  isIndexEditingMode: true,
};

export const WithSelectedFilters = Template.bind({});
WithSelectedFilters.args = {
  ...Default.args,
  getSelectedFilterData: () =>
    Promise.resolve([
      {
        group: FilterGroups.filterType,
        key: "doc",
        label: "DOC",
        isSelected: true,
      },
    ]),
};

export const MobileView = Template.bind({});
MobileView.args = {
  ...Default.args,
  currentDeviceType: DeviceType.mobile,
};

export const RoomsView = Template.bind({});
RoomsView.args = {
  ...Default.args,
  isRooms: true,
  getFilterData: () =>
    Promise.resolve([
      {
        group: FilterGroups.filterRoom,
        key: "rooms",
        label: "Rooms",
        isHeader: true,
        groupItem: [
          {
            group: FilterGroups.filterRoom,
            key: "room-selector",
            label: "Select Room",
            displaySelectorType: "room",
            isSelected: false,
          },
        ],
      },
    ]),
};

export const ContactsView = Template.bind({});
ContactsView.args = {
  ...Default.args,
  isContactsPage: true,
  getFilterData: () =>
    Promise.resolve([
      {
        group: FilterGroups.filterGroup,
        key: "groups",
        label: "Groups",
        isHeader: true,
        groupItem: [
          {
            group: FilterGroups.filterGroup,
            key: "group-selector",
            label: "Select Group",
            displaySelectorType: "group",
            isSelected: false,
          },
        ],
      },
    ]),
};
