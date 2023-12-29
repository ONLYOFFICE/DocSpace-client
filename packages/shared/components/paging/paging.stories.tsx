import React, { useState, useEffect } from "react";

import { Meta, StoryObj } from "@storybook/react";

import { Paging } from "./Paging";
import { PagingProps } from "./Paging.types";

// const disable = {
//   table: {
//     disable: true,
//   },
// };

const meta = {
  title: "Components/Paging",
  component: Paging,
  parameters: {
    docs: {
      description: {
        component: "Paging is used to navigate med content pages",
      },
    },
  },
  argTypes: {
    onSelectPage: { action: "onSelectPage" },
    onSelectCount: { action: "onSelectCount" },
    previousAction: { action: "onPrevious" },
    // nextAction: { action: "onNext" },
    // selectedCount: disable,
    // pageCount: disable,
    // displayItems: disable,
    // displayCount: disable,
  },
} satisfies Meta<typeof Paging>;
type Story = StoryObj<typeof Paging>;

export default meta;

const createPageItems = (count: number) => {
  const pageItems = [];
  for (let i = 1; i <= count; i += 1) {
    pageItems.push({
      key: i,
      label: `${i} of ${count}`,
    });
  }
  return pageItems;
};

const countItems = [
  {
    key: 25,
    label: "25 per page",
  },
  {
    key: 50,
    label: "50 per page",
  },
  {
    key: 100,
    label: "100 per page",
  },
];

const selectedCountPageHandler = (count: number) => {
  return countItems.filter((item) => {
    if (item.key === count) {
      return true;
    }
    return false;
  });
};

const Template = ({
  // pageCount,
  // displayItems,
  // displayCount,
  nextAction,
  previousAction,
  onSelectPage,
  onSelectCount,
  // selectedCount,
  ...args
}: PagingProps) => {
  const pageItems = createPageItems(200);
  const [selectedPageItem, setSelectedPageItems] = useState(pageItems[0]);

  useEffect(() => {
    setSelectedPageItems(pageItems[0]);
  }, [pageItems]);

  const onSelectPageNextHandler = () => {
    const currentPage = pageItems.filter(
      (item) => item.key === selectedPageItem.key + 1,
    );
    if (currentPage[0]) setSelectedPageItems(currentPage[0]);
  };

  const onSelectPagePrevHandler = () => {
    const currentPage = pageItems.filter(
      (item) => item.key === selectedPageItem.key - 1,
    );
    if (currentPage[0]) setSelectedPageItems(currentPage[0]);
  };

  return (
    <div style={{ height: "100px" }}>
      <Paging
        {...args}
        pageItems={pageItems}
        style={{ justifyContent: "center", alignItems: "center" }}
        countItems={countItems}
        previousAction={async () => {
          previousAction();
          onSelectPagePrevHandler();
        }}
        nextAction={async () => {
          onSelectPageNextHandler();
          nextAction();
        }}
        onSelectPage={(a) => onSelectPage(a)}
        onSelectCount={(a) => onSelectCount(a)}
        selectedPageItem={selectedPageItem}
        selectedCountItem={selectedCountPageHandler(25)[0]}
      />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    previousLabel: "Previous",
    nextLabel: "Next",

    disablePrevious: false,
    disableNext: false,
    openDirection: "bottom",

    selectedCountItem: {
      key: 100,
      label: "100 per page",
    },
    selectedPageItem: { key: 1, label: "1 of 10" },
  },
};
