import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { SelectionArea } from "./SelectionArea";
import { SelectionAreaProps } from "./SelectionArea.types";
import styles from "./SelectionArea.stories.module.scss";

export default {
  title: "Layout components/SelectionArea",
  component: SelectionArea,
  tags: ["!autodocs"],
  parameters: {
    docs: {
      disable: true,
    },
  },
  decorators: [
    (S) => (
      <div id="sectionScroll" className={styles.container}>
        <S />
      </div>
    ),
  ],
} as Meta;

const Template: StoryFn<SelectionAreaProps> = (args) => {
  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);

  const handleMove = ({
    added,
    removed,
  }: {
    added: Element[];
    removed: Element[];
  }) => {
    setSelectedItems((prev) => {
      const newItems = [...prev];
      added.forEach((element) => {
        const id = element.getAttribute("data-id");
        if (id && !newItems.includes(id)) {
          newItems.push(id);
        }
      });
      removed.forEach((element) => {
        const id = element.getAttribute("data-id");
        if (id) {
          const index = newItems.indexOf(id);
          if (index > -1) {
            newItems.splice(index, 1);
          }
        }
      });
      return newItems;
    });
  };

  return (
    <div className={`${styles.itemsContainer} items-container`}>
      {Array.from({ length: 12 }).map((_, index) => (
        <div
          key={`${index}test`}
          data-id={`item-${index}`}
          className={`${styles.item} selectable-item ${selectedItems.includes(`item-${index}`) ? "selected" : ""}`}
        >
          Item {index + 1}
        </div>
      ))}
      <SelectionArea
        {...args}
        onMove={handleMove}
        containerClass="selection-container"
        itemsContainerClass="items-container"
        selectableClass="selectable-item"
        scrollClass="scroll-container"
      />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  viewAs: "tile",
  folderHeaderHeight: 0,
  defaultHeaderHeight: 0,
  countTilesInRow: 4,
  arrayTypes: [
    {
      type: "default",
      itemHeight: 150,
      rowGap: 16,
    },
  ],
  isRooms: false,
};
