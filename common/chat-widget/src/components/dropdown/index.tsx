import React from "react";
import { VirtualList } from "./VirtualList";

export const DropDown = ({
  children,
  maxHeight = 200,
  itemHeight = 50,
  dropdownWidth,
}: {
  children: any; // TODO: types
  maxHeight: number;
  itemHeight: number;
  dropdownWidth: number;
}) => {
  const itemsCount = children ? React.Children.toArray(children).length : 0;
  const fullHeight = itemsCount * itemHeight;
  const listHeight = fullHeight < maxHeight ? fullHeight : maxHeight;

  return (
    <div className="chat-panel-footer_input-dropdown-items">
      <VirtualList
        width={dropdownWidth}
        itemCount={itemsCount}
        maxHeight={maxHeight}
        cleanChildren={children}
        listHeight={listHeight}
        getItemSize={() => itemHeight}
        enableKeyboardEvents
      >
        {children}
      </VirtualList>
    </div>
  );
};
