import React from "react";
import { StoryFn, Meta } from "@storybook/react";

import ViewRowsReactSvgUrl from "PUBLIC_DIR/images/view-rows.react.svg?url";
import ViewTilesReactSvgUrl from "PUBLIC_DIR/images/view-tiles.react.svg?url";

import { DeviceType, FilterGroups, FilterKeys } from "../../enums";
import Filter from ".";
import { FilterProps, TSortDataItem } from "./Filter.types";

/**
 * Filter component stories
 *
 * These stories demonstrate the Filter component capabilities
 * without using complex selectors that might cause infinite loading.
 */

// Mock sort data for all stories
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
  {
    key: "size",
    label: "Size",
    isSelected: false,
    id: "3",
    className: "",
    sortDirection: "asc",
    sortId: "1",
  },
];

// Mock view settings data
const mockViewSettings = [
  { id: "1", label: "Grid", value: "tile", icon: ViewTilesReactSvgUrl },
  { id: "2", label: "List", value: "row", icon: ViewRowsReactSvgUrl },
];

// Simple wrapper component to give the filter some height
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <div style={{ height: "140px" }}>{children}</div>
);

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
  parameters: {
    docs: {
      description: {
        component:
          "Filter component for filtering and sorting data in a table or grid view. This component supports various filter types, sorting options, and view settings.",
      },
    },
  },
} as Meta;

/**
 * Basic template for Filter stories
 * This template wraps the Filter component in a container with fixed height
 */
const Template: StoryFn<FilterProps> = (args) => {
  return (
    <Wrapper>
      <Filter {...args} />
    </Wrapper>
  );
};

const TemplateWithOpenFilter: StoryFn<FilterProps> = (args) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const filterButton = document.querySelector(
        '[data-testid="filter_icon_button"]',
      ) as HTMLElement;
      if (filterButton) {
        filterButton.click();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Wrapper>
      <Filter {...args} />
    </Wrapper>
  );
};

/**
 * Basic filter with document type options
 * This story shows a simple filter with document type options
 */
export const DocumentTypes = TemplateWithOpenFilter.bind({});
DocumentTypes.args = {
  viewAs: "row",
  view: "row",
  getSortData: () => mockSortData,
  getSelectedSortData: () => ({ sortDirection: "asc", sortId: "AZ" }),
  getViewSettingsData: () => mockViewSettings,
  getSelectedFilterData: () => Promise.resolve([]),
  onSearch: (value) => console.log("Search:", value),
  onClearFilter: () => console.log("Clear filter"),
  onChangeViewAs: () => console.log("View changed"),
  onSort: (key, direction) => console.log("Sort by:", key, direction),
  onFilter: (items) => console.log("Filter applied:", items),
  onSortButtonClick: (value) => console.log("Sort button clicked:", value),
  filterTitle: "Filter",
  sortByTitle: "Sort by",
  filterHeader: "Filter",
  selectorLabel: "Select",
  viewSelectorVisible: true,
  placeholder: "Search...",
  userId: "1",
  currentDeviceType: DeviceType.desktop,
  getFilterData: () =>
    Promise.resolve([
      {
        key: FilterGroups.filterType,
        group: FilterGroups.filterType,
        label: "Type",
        isHeader: true,
        isLast: true,
      },
      {
        id: "filter_type-documents",
        key: "documents",
        group: FilterGroups.filterType,
        label: "Documents",
      },
      {
        id: "filter_type-spreadsheets",
        key: "spreadsheets",
        group: FilterGroups.filterType,
        label: "Spreadsheets",
      },
      {
        id: "filter_type-presentations",
        key: "presentations",
        group: FilterGroups.filterType,
        label: "Presentations",
      },
      {
        id: "filter_type-images",
        key: "images",
        group: FilterGroups.filterType,
        label: "Images",
        isLast: true,
      },
    ]),
  initSelectedFilterData: [],
};

DocumentTypes.parameters = {
  docs: {
    description: {
      story:
        "Basic filter with document type options. Shows filter items for different document types. The filter dropdown automatically opens when the story loads.",
    },
  },
};

/**
 * Filter with pre-selected options
 * This story shows a filter with some options already selected
 */
export const WithSelectedFilters = TemplateWithOpenFilter.bind({});
WithSelectedFilters.args = {
  ...DocumentTypes.args,
  getSelectedFilterData: () =>
    Promise.resolve([
      {
        id: "filter_type-documents",
        key: "documents",
        group: FilterGroups.filterType,
        label: "Documents",
        isSelected: true,
      },
    ]),
  getFilterData: () =>
    Promise.resolve([
      {
        key: FilterGroups.filterType,
        group: FilterGroups.filterType,
        label: "Type",
        isHeader: true,
        isLast: true,
        isSelected: false,
      },
      {
        id: "filter_type-documents",
        key: "documents",
        group: FilterGroups.filterType,
        label: "Documents",
        isSelected: true,
      },
      {
        id: "filter_type-spreadsheets",
        key: "spreadsheets",
        group: FilterGroups.filterType,
        label: "Spreadsheets",
        isSelected: false,
      },
      {
        id: "filter_type-presentations",
        key: "presentations",
        group: FilterGroups.filterType,
        label: "Presentations",
        isSelected: false,
      },
      {
        id: "filter_type-images",
        key: "images",
        group: FilterGroups.filterType,
        label: "Images",
        isSelected: false,
      },
    ]),
  initSelectedFilterData: [
    {
      id: "filter_type-documents",
      key: "documents",
      group: FilterGroups.filterType,
      label: "Documents",
      isSelected: true,
    },
  ],
};

WithSelectedFilters.parameters = {
  docs: {
    description: {
      story:
        "Filter with pre-selected options. Shows how the filter looks with some options already selected. The filter dropdown automatically opens when the story loads.",
    },
  },
};

/**
 * Filter with multiple filter groups
 * This story shows a filter with multiple groups of filter options
 */
export const MultipleFilterGroups = TemplateWithOpenFilter.bind({});
MultipleFilterGroups.args = {
  ...DocumentTypes.args,
  getFilterData: () =>
    Promise.resolve([
      {
        key: FilterGroups.filterType,
        group: FilterGroups.filterType,
        label: "Type",
        isHeader: true,
      },
      {
        id: "filter_type-documents",
        key: "documents",
        group: FilterGroups.filterType,
        label: "Documents",
      },
      {
        id: "filter_type-spreadsheets",
        key: "spreadsheets",
        group: FilterGroups.filterType,
        label: "Spreadsheets",
      },
      {
        key: FilterGroups.filterStatus,
        group: FilterGroups.filterStatus,
        label: "Status",
        isHeader: true,
      },
      {
        id: "filter_status-active",
        key: "active",
        group: FilterGroups.filterStatus,
        label: "Active",
      },
      {
        id: "filter_status-archived",
        key: "archived",
        group: FilterGroups.filterStatus,
        label: "Archived",
      },
      {
        key: FilterGroups.filterAuthor,
        group: FilterGroups.filterAuthor,
        label: "Author",
        isHeader: true,
        isLast: true,
      },
      {
        id: "filter_author-me",
        key: "me",
        group: FilterGroups.filterAuthor,
        label: "Me",
      },
      {
        id: "filter_author-shared",
        key: "shared",
        group: FilterGroups.filterAuthor,
        label: "Shared with me",
      },
    ]),
};

MultipleFilterGroups.parameters = {
  docs: {
    description: {
      story:
        "Filter with multiple filter groups. Shows how the filter displays different categories of filter options. The filter dropdown automatically opens when the story loads.",
    },
  },
};

/**
 * Room filter story
 * Shows a filter with room options without using complex selectors
 */
export const RoomsFilter = TemplateWithOpenFilter.bind({});
RoomsFilter.args = {
  ...DocumentTypes.args,
  isRooms: true,
  getFilterData: () =>
    Promise.resolve([
      {
        key: FilterGroups.filterRoom,
        group: FilterGroups.filterRoom,
        label: "Room",
        isHeader: true,
        isLast: true,
      },
      {
        id: "filter_room-all",
        key: FilterKeys.withContent,
        group: FilterGroups.filterRoom,
        label: "All Rooms",
      },
      {
        id: "filter_room-marketing",
        key: "room-1",
        group: FilterGroups.filterRoom,
        label: "Marketing Room",
      },
      {
        id: "filter_room-development",
        key: "room-2",
        group: FilterGroups.filterRoom,
        label: "Development Room",
      },
      {
        id: "filter_room-sales",
        key: "room-3",
        group: FilterGroups.filterRoom,
        label: "Sales Room",
        isLast: true,
      },
    ]),
};

RoomsFilter.parameters = {
  docs: {
    description: {
      story:
        "Filter with room options. Shows room filter items without using complex selectors. The filter dropdown automatically opens when the story loads.",
    },
  },
};

/**
 * Disabled filter
 * Shows the filter component in a completely disabled state
 */
export const DisabledFilter = Template.bind({});
DisabledFilter.args = {
  ...DocumentTypes.args,
  isIndexEditingMode: true,
  isIndexing: true,
  getFilterData: () => Promise.resolve([]),
};

DisabledFilter.parameters = {
  docs: {
    description: {
      story:
        "Filter in completely disabled state. Shows how the filter appears when it's disabled during indexing mode.",
    },
  },
};
