import React from "react";
import {
  CustomScrollbarsVirtualList,
  ScrollbarType,
} from "@docspace/shared/components/scrollbar";

import BookmarksProps from "./Bookmarks.props";
import { Item, List, Text } from "./Bookmarks.styled";

export const Bookmarks = ({ bookmarks, navigate }: BookmarksProps) => {
  return (
    <CustomScrollbarsVirtualList stype={ScrollbarType.mediumBlack}>
      <List>
        {bookmarks.map((item, index) => {
          return (
            <Item key={item.page}>
              <Text onClick={() => navigate(index)}>{item.description}</Text>
            </Item>
          );
        })}
      </List>
    </CustomScrollbarsVirtualList>
  );
};
