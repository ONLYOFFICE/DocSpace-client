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

import React, { memo, useCallback } from "react";
import { useInterfaceDirection } from "@docspace/ui-kit/context/InterfaceDirectionContext";
import AutoSizer from "react-virtualized-auto-sizer";
import InfiniteLoader from "react-window-infinite-loader";
import { areEqual, FixedSizeList as List } from "react-window";

import { RowLoader } from "../../../../skeletons/selector";
import { ASIDE_PADDING_AFTER_LAST_ITEM } from "../../../../constants";
import { TGroupMemberInvitedInRoom } from "../../../../api/groups/types";
import {
  Scrollbar,
  ScrollbarProps,
} from "@docspace/ui-kit/components/scrollbar";

import GroupMember from "../GroupMember";

const ROW_HEIGHT = 48;
const SEARCH_WITH_PADDING_HEIGHT = 60;

const VirtualScroll = (props: ScrollbarProps) => (
  <Scrollbar {...props} paddingAfterLastItem={ASIDE_PADDING_AFTER_LAST_ITEM} />
);

const Row = memo(
  ({
    data,
    index,
    style,
  }: {
    data: TGroupMemberInvitedInRoom[];
    index: number;
    style: React.CSSProperties;
  }) => {
    const member = data[index];

    return (
      <div style={style}>
        {member ? (
          <GroupMember member={member} />
        ) : (
          <RowLoader isMultiSelect={false} isContainer isUser />
        )}
      </div>
    );
  },
  areEqual,
);

Row.displayName = "Row";

interface GroupMembersListProps {
  members: TGroupMemberInvitedInRoom[];
  loadNextPage: (startIndex: number) => void;
  hasNextPage: boolean;
  total: number;
  isNextPageLoading: boolean;
}

const GroupMembersList = ({
  members,
  loadNextPage,
  hasNextPage,
  total,
  isNextPageLoading,
}: GroupMembersListProps) => {
  const { interfaceDirection } = useInterfaceDirection();

  const itemCount = hasNextPage ? members.length + 1 : members.length;

  const isItemLoaded = useCallback(
    (index: number) => {
      return !hasNextPage || index < itemCount - 1;
    },
    [hasNextPage, itemCount],
  );

  const loadMoreItems = isNextPageLoading ? () => {} : loadNextPage;

  return (
    <AutoSizer>
      {({ height, width }) => (
        <InfiniteLoader
          isItemLoaded={isItemLoaded}
          itemCount={total}
          loadMoreItems={loadMoreItems}
        >
          {({ onItemsRendered, ref }) => (
            <List
              className="list-scroll"
              ref={ref}
              direction={interfaceDirection as "ltr" | "rtl"}
              height={height - SEARCH_WITH_PADDING_HEIGHT}
              width={width}
              itemCount={itemCount}
              itemSize={ROW_HEIGHT}
              itemData={members}
              outerElementType={VirtualScroll}
              onItemsRendered={onItemsRendered}
            >
              {Row}
            </List>
          )}
        </InfiniteLoader>
      )}
    </AutoSizer>
  );
};

export default GroupMembersList;
