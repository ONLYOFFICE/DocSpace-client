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
import Item from "./Item";

import { StyledRow, ScrollList } from "../StyledInvitePanel";
import { useTheme } from "styled-components";

const USER_ITEM_HEIGHT = 48;

const Row = memo(({ data, index, style }) => {
  const { inviteItems, setInviteItems, t, isDisabled } = data;

  if (inviteItems === undefined) return;

  const item = inviteItems[index];

  return (
    <StyledRow
      key={item.id}
      style={style}
      className="row-item"
      hasWarning={!!item.warning}
    >
      <Item
        t={t}
        item={item}
        setInviteItems={setInviteItems}
        inviteItems={inviteItems}
        isDisabled={isDisabled}
      />
    </StyledRow>
  );
});

const ItemsList = ({
  t,
  setInviteItems,
  inviteItems,
  scrollAllPanelContent,
  isDisabled,
}) => {
  const [bodyHeight, setBodyHeight] = useState(0);
  const [offsetTop, setOffsetTop] = useState(0);
  const [isTotalListHeight, setIsTotalListHeight] = useState(false);
  const bodyRef = useRef();
  const { height } = useResizeObserver({ ref: bodyRef });
  const { interfaceDirection } = useTheme();

  const onBodyResize = useCallback(() => {
    const scrollHeight = bodyRef?.current?.firstChild.scrollHeight;
    const heightList = height ? height : bodyRef.current.offsetHeight;
    const totalHeightItems = inviteItems.length * USER_ITEM_HEIGHT;
    const listAreaHeight = heightList;

    const calculatedHeight = scrollAllPanelContent
      ? Math.max(totalHeightItems, listAreaHeight)
      : heightList;

    const finalHeight = scrollAllPanelContent
      ? totalHeightItems
      : calculatedHeight;

    setBodyHeight(finalHeight);
    setOffsetTop(bodyRef.current.offsetTop);

    if (scrollAllPanelContent && totalHeightItems && listAreaHeight)
      setIsTotalListHeight(
        totalHeightItems >= listAreaHeight && totalHeightItems >= scrollHeight,
      );
  }, [
    height,
    bodyRef?.current?.offsetHeight,
    inviteItems.length,
    scrollAllPanelContent,
  ]);

  useEffect(() => {
    onBodyResize();
  }, [bodyRef.current, height, inviteItems.length, scrollAllPanelContent]);

  const overflowStyle = scrollAllPanelContent ? "hidden" : "scroll";

  return (
    <ScrollList
      offsetTop={offsetTop}
      ref={bodyRef}
      scrollAllPanelContent={scrollAllPanelContent}
      isTotalListHeight={isTotalListHeight}
    >
      <List
        style={{ overflow: overflowStyle, willChange: "transform" }}
        direction={interfaceDirection}
        height={bodyHeight}
        width="auto"
        itemCount={inviteItems.length}
        itemSize={USER_ITEM_HEIGHT}
        itemData={{
          t,
          inviteItems,
          setInviteItems,
          isDisabled,
        }}
        outerElementType={!scrollAllPanelContent && CustomScrollbarsVirtualList}
      >
        {Row}
      </List>
    </ScrollList>
  );
};

export default ItemsList;
