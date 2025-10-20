import React, { useState, useEffect, ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { IndexRange } from "react-virtualized";

import { InfiniteLoaderComponent } from "./InfiniteLoader";
import { Scrollbar } from "../scrollbar/Scrollbar";
import { TViewAs } from "../../types";

const generateItems = (
  count: number,
  startIndex: number = 0,
): React.ReactNode[] =>
  Array(count)
    .fill(null)
    .map((_, index) => (
      <div
        key={`item-${startIndex + index}`}
        style={{
          padding: "8px",
          border: "1px solid #eee",
          margin: "4px",
          borderRadius: "4px",
        }}
      >
        Item {startIndex + index + 1}
      </div>
    ));

const ScrollStructureWrapper = ({ children }: { children: ReactNode }) => (
  <div style={{ height: "300px", position: "relative" }} id="sectionScroll">
    <Scrollbar>
      <div id="tileContainer" style={{ width: "100%" }}>
        {children}
      </div>
    </Scrollbar>
  </div>
);

const InfiniteLoaderDemo = () => {
  const [items, setItems] = useState<React.ReactNode[]>(generateItems(20, 0));
  const [itemCount] = useState(100);
  const [loadedCount, setLoadedCount] = useState(20);
  const [isInitialized, setIsInitialized] = useState(false);

  const loadMoreItems = async ({
    startIndex,
    stopIndex,
  }: IndexRange): Promise<void> => {
    action("loadMoreItems")({ startIndex, stopIndex });

    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });

    const newItemsCount = stopIndex - startIndex + 1;
    const newItems = generateItems(newItemsCount, loadedCount);

    setItems((prev) => [...prev, ...newItems]);
    setLoadedCount((prev) => prev + newItemsCount);
  };

  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);

      const scrollElement = document.querySelector(
        "#sectionScroll .scroll-wrapper > .scroller",
      ) as HTMLElement | null;

      if (scrollElement) {
        const scrollEvent = new Event("scroll", { bubbles: true });
        scrollElement.dispatchEvent(scrollEvent);
      }
    }
  }, [isInitialized]);

  return (
    <InfiniteLoaderComponent
      viewAs={"tile" as TViewAs}
      itemCount={itemCount}
      filesLength={loadedCount}
      hasMoreFiles={loadedCount < itemCount}
      loadMoreItems={loadMoreItems}
      itemSize={20}
      countTilesInRow={4}
      isLoading={false}
    >
      {items}
    </InfiniteLoaderComponent>
  );
};

// Storybook metadata
const meta = {
  title: "Components/InfiniteLoader",
  component: InfiniteLoaderComponent,
  parameters: {
    docs: {
      description: {
        component:
          "InfiniteLoader component for handling large lists of items with virtualization support",
      },
    },
  },
  decorators: [
    (Story) => (
      <ScrollStructureWrapper>
        <Story />
      </ScrollStructureWrapper>
    ),
  ],
} satisfies Meta<typeof InfiniteLoaderComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default = {
  args: {},
  render: () => <InfiniteLoaderDemo />,
} as unknown as Story;
