// (c) Copyright Ascensio System SIA 2009-2025
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

import React, { useCallback, useEffect, useState } from "react";
import {
  ListRowProps,
  Index,
  IndexRange,
  InfiniteLoader,
  List,
  WindowScroller,
} from "react-virtualized";

import { TUser } from "@docspace/shared/api/people/types";
import { RowLoader } from "@docspace/shared/skeletons/selector";

import GroupMember from "./GroupMember";

const ROW_HEIGHT = 50;

type GroupMembersListProps = {
  members: TUser[];
  hasNextPage: boolean;
  total: number;

  loadNextPage: (startIndex: number) => Promise<void>;
};

export const GroupMembersList = ({
  members,
  loadNextPage,
  hasNextPage,
  total,
}: GroupMembersListProps) => {
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(
    null,
  );
  const [isNextPageLoading, setIsNextPageLoading] = useState(false);

  const itemsCount = hasNextPage ? members.length + 1 : members.length;

  const isItemLoaded = useCallback(
    ({ index }: Index) => {
      return !hasNextPage || index < itemsCount;
    },
    [hasNextPage, itemsCount],
  );

  const loadMoreItems = useCallback(
    async ({ startIndex }: IndexRange) => {
      setIsNextPageLoading(true);
      if (!isNextPageLoading) {
        await loadNextPage(startIndex - 1);
      }
      setIsNextPageLoading(false);
    },
    [isNextPageLoading, loadNextPage],
  );

  const renderRow = ({ key, index, style }: ListRowProps) => {
    const item = members[index];

    return (
      <div key={key} style={style}>
        {item ? (
          <GroupMember groupMember={item} isManager={false} />
        ) : (
          <RowLoader
            className="group-member-row-loader"
            isMultiSelect={false}
            isUser
            count={1}
          />
        )}
      </div>
    );
  };

  useEffect(() => {
    const scrollEl = document.querySelector(".info-panel-scroll");

    if (scrollEl) {
      setScrollElement(scrollEl as HTMLDivElement);
    }
  }, []);

  if (!scrollElement) {
    return null;
  }

  return (
    <InfiniteLoader
      loadMoreRows={loadMoreItems}
      isRowLoaded={isItemLoaded}
      rowCount={total}
    >
      {({ onRowsRendered, registerChild }) => (
        <WindowScroller scrollElement={scrollElement}>
          {({ height, isScrolling, scrollTop }) => {
            const scrollRect = scrollElement.getBoundingClientRect();

            return (
              <List
                autoHeight
                height={height || scrollRect.height}
                onRowsRendered={onRowsRendered}
                ref={registerChild}
                rowCount={itemsCount}
                rowHeight={ROW_HEIGHT}
                rowRenderer={renderRow}
                width={scrollRect.width - 40}
                isScrolling={isScrolling}
                overscanRowCount={3}
                scrollTop={scrollTop}
                // React virtualized sets "LTR" by default.
                style={{ direction: "inherit" }}
                tabIndex={null}
              />
            );
          }}
        </WindowScroller>
      )}
    </InfiniteLoader>
  );
};
