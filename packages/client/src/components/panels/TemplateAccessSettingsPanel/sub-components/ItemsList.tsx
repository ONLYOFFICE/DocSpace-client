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

import { useState, useEffect, useRef, memo, useCallback } from "react";
import { FixedSizeList as List } from "react-window";
import { CustomScrollbarsVirtualList } from "@docspace/shared/components/scrollbar";
import useResizeObserver from "use-resize-observer";
import { useTheme } from "styled-components";
import { TTranslation } from "@docspace/shared/types";
import { TSelectorItem } from "@docspace/shared/components/selector";
import { ShareAccessRights } from "@docspace/shared/enums";
import Item from "./Item";
import { StyledRow, ScrollList } from "../StyledInvitePanel";

const USER_ITEM_HEIGHT = 48;

type ItemsListProps = {
  t: TTranslation;
  setInviteItems: (items: TSelectorItem[]) => void;
  inviteItems: TSelectorItem[];
  scrollAllPanelContent: boolean;
  isDisabled: boolean;
};

type RowData = {
  t: TTranslation;
  inviteItems: TSelectorItem[];
  listItems: TSelectorItem[];
  setInviteItems: (items: TSelectorItem[]) => void;
  isDisabled: boolean;
};

type RowProps = {
  data: RowData;
  index: number;
  style: React.CSSProperties;
};

const Row = memo(({ data, index, style }: RowProps) => {
  const { t, inviteItems, setInviteItems, isDisabled, listItems } = data;

  if (listItems === undefined) return;

  const item = listItems[index];

  return (
    <StyledRow
      key={item.id}
      style={style}
      className="row-item"
      data-testid={`template_access_settings_row_${index}`}
    >
      <Item
        t={t}
        item={item}
        setInviteItems={setInviteItems}
        inviteItems={inviteItems}
        isDisabled={isDisabled}
        index={index}
      />
    </StyledRow>
  );
});

Row.displayName = "Row";

const ItemsList = ({
  t,
  setInviteItems,
  inviteItems,
  scrollAllPanelContent,
  isDisabled,
}: ItemsListProps) => {
  const [bodyHeight, setBodyHeight] = useState(0);
  const [offsetTop, setOffsetTop] = useState(0);
  const [isTotalListHeight, setIsTotalListHeight] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const { height } = useResizeObserver({
    ref: bodyRef as React.RefObject<HTMLDivElement>,
  });
  const { interfaceDirection } = useTheme();

  const listItems = [...inviteItems].filter(
    (l) => l.templateAccess !== ShareAccessRights.None,
  );

  const onBodyResize = useCallback(() => {
    const bodyElem = bodyRef?.current?.firstChild as HTMLDivElement;
    const scrollHeight = bodyElem?.scrollHeight;
    const heightList = height ?? bodyRef?.current?.offsetHeight;
    const totalHeightItems = listItems.length * USER_ITEM_HEIGHT;
    const listAreaHeight = heightList ?? 0;

    const calculatedHeight = scrollAllPanelContent
      ? Math.max(totalHeightItems, listAreaHeight)
      : heightList;

    const finalHeight = scrollAllPanelContent
      ? totalHeightItems
      : calculatedHeight;

    const bodyRefOffsetTop = bodyRef?.current?.offsetTop ?? 0;

    setBodyHeight(finalHeight ?? 0);
    setOffsetTop(bodyRefOffsetTop);

    if (scrollAllPanelContent && totalHeightItems && listAreaHeight)
      setIsTotalListHeight(
        totalHeightItems >= listAreaHeight && totalHeightItems >= scrollHeight,
      );
  }, [height, listItems.length, scrollAllPanelContent]);

  useEffect(() => {
    onBodyResize();
  }, [height, listItems.length, scrollAllPanelContent, onBodyResize]);

  const overflowStyle = scrollAllPanelContent ? "hidden" : "scroll";

  return (
    <ScrollList
      offsetTop={offsetTop}
      ref={bodyRef}
      scrollAllPanelContent={scrollAllPanelContent}
      isTotalListHeight={isTotalListHeight}
      data-testid="template_access_settings_scroll_list"
    >
      <List
        style={{ overflow: overflowStyle, willChange: "transform" }}
        direction={interfaceDirection}
        height={bodyHeight}
        width="auto"
        itemCount={listItems.length}
        itemSize={USER_ITEM_HEIGHT}
        itemData={{
          t,
          inviteItems,
          setInviteItems,
          isDisabled,
          listItems,
        }}
        outerElementType={
          !scrollAllPanelContent ? CustomScrollbarsVirtualList : undefined
        }
        data-testid="template_access_settings_list"
      >
        {Row}
      </List>
    </ScrollList>
  );
};

export default ItemsList;
