import React, { useState, useEffect, ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { action } from "@storybook/addon-actions";

import { InfiniteLoaderComponent } from "./InfiniteLoader";
import { Scrollbar } from "../scrollbar/Scrollbar";

const generateItems = (count: number, startIndex: number = 0) =>
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

interface ScrollStructureWrapperProps {
  children: ReactNode;
}

const ScrollStructureWrapper = ({ children }: ScrollStructureWrapperProps) => {
  return (
    <div style={{ height: "300px", position: "relative" }} id="sectionScroll">
      <Scrollbar>
        <div id="tileContainer" style={{ width: "100%" }}>
          {children}
        </div>
      </Scrollbar>
    </div>
  );
};

const withScrollStructure = (Story) => {
  return (
    <ScrollStructureWrapper>
      <Story />
    </ScrollStructureWrapper>
  );
};

const InfiniteLoaderWrapper = (props) => {
  const [items, setItems] = useState(generateItems(20, 0));
  const [itemCount] = useState(100);
  const [loadedCount, setLoadedCount] = useState(20);
  const [isInitialized, setIsInitialized] = useState(false);

  const loadMoreItems = async ({ startIndex, stopIndex }) => {
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
      );
      if (scrollElement) {
        const scrollEvent = new Event("scroll", { bubbles: true });
        scrollElement.dispatchEvent(scrollEvent);
      }
    }
  }, [isInitialized]);

  return (
    <InfiniteLoaderComponent
      {...props}
      itemCount={itemCount}
      filesLength={loadedCount}
      hasMoreFiles={loadedCount < itemCount}
      loadMoreItems={loadMoreItems}
      isItemLoaded={(index) => index < loadedCount}
    >
      {items}
    </InfiniteLoaderComponent>
  );
};

const meta: Meta<typeof InfiniteLoaderComponent> = {
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
  argTypes: {
    viewAs: {
      control: { type: "select", options: ["tile"] },
      description: "Display mode for the items",
    },
    isLoading: {
      control: "boolean",
      description: "Loading state of the component",
    },
    itemSize: {
      control: "number",
      description: "Height of each item in pixels",
    },
    countTilesInRow: {
      control: "number",
      description: "Number of tiles in a row",
    },
  },
  decorators: [withScrollStructure],
};

export default meta;
type Story = StoryObj<typeof InfiniteLoaderComponent>;

const Template: Story = {
  render: (args) => <InfiniteLoaderWrapper {...args} />,
  args: {
    viewAs: "tile",
    itemSize: 20,
    countTilesInRow: 4,
    isLoading: false,
  },
};

export const Default = {
  ...Template,
  args: {
    ...Template.args,
    viewAs: "tile",
  },
};
