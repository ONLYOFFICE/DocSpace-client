/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

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
      <div
        key={key}
        style={style}
        data-testid={`info_panel_contacts_group_member_item_${index}`}
      >
        {item ? (
          <GroupMember groupMember={item} isManager={false} />
        ) : (
          <RowLoader
            className="group-member-row-loader"
            isMultiSelect={false}
            isUser
            count={1}
            data-testid={`info_panel_contacts_group_member_loader_${index}`}
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
