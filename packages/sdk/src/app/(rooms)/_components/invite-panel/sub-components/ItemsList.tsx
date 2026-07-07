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

"use client";

// (c) Copyright Ascensio System SIA 2009-2026
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

import React, {
  useState,
  useEffect,
  useRef,
  memo,
  useCallback,
} from "react";
import { FixedSizeList as List } from "react-window";
import { Scrollbar } from "@docspace/ui-kit/components/scrollbar";
import type { ScrollbarProps } from "@docspace/ui-kit/components/scrollbar";
import useResizeObserver from "use-resize-observer";
import { useInterfaceDirection } from "@docspace/ui-kit/context/InterfaceDirectionContext";
import { ASIDE_PADDING_AFTER_LAST_ITEM } from "@docspace/shared/constants";
import classNames from "classnames";
import type { TTranslation } from "@docspace/shared/types";
import { RoomsType } from "@docspace/shared/enums";

import type { InviteItem } from "../index";
import Item from "./Item";
import styles from "../InvitePanel.module.scss";

const USER_ITEM_HEIGHT = 48;

type RowItemData = {
  inviteItems: InviteItem[];
  setInviteItems: (items: InviteItem[]) => void;
  changeInviteItem: (
    update: Partial<InviteItem> & { id: string | number },
    addExisting?: boolean,
    oldId?: string | number | null,
  ) => Promise<void>;
  t: TTranslation;
  setHasErrors: (v: boolean) => void;
  roomType: RoomsType | -1;
  roomId: number;
  isOwner: boolean;
  isAdmin: boolean;
  inputsRef: React.RefObject<HTMLDivElement | null>;
  setIsOpenItemAccess: (v: boolean) => void;
  isMobileView: boolean;
  allowInvitingGuests: boolean;
};

type RowProps = {
  data: RowItemData;
  index: number;
  style: React.CSSProperties;
};

const VirtualScroll = (props: ScrollbarProps) => (
  <Scrollbar {...props} paddingAfterLastItem={ASIDE_PADDING_AFTER_LAST_ITEM} />
);

VirtualScroll.displayName = "VirtualScroll";

const Row = memo(({ data, index, style }: RowProps) => {
  const {
    inviteItems,
    setInviteItems,
    changeInviteItem,
    t,
    setHasErrors,
    roomType,
    roomId,
    isOwner,
    isAdmin,
    inputsRef,
    setIsOpenItemAccess,
    isMobileView,
    allowInvitingGuests,
  } = data;

  if (inviteItems === undefined) return null;

  const item = inviteItems[index];

  return (
    <Item
      t={t}
      item={item}
      index={index}
      key={item.id}
      style={style}
      setInviteItems={setInviteItems}
      changeInviteItem={changeInviteItem}
      inviteItems={inviteItems}
      setHasErrors={setHasErrors}
      roomType={roomType}
      roomId={roomId}
      isOwner={isOwner}
      isAdmin={isAdmin}
      inputsRef={inputsRef}
      setIsOpenItemAccess={setIsOpenItemAccess}
      isMobileView={isMobileView}
      allowInvitingGuests={allowInvitingGuests}
    />
  );
});

Row.displayName = "Row";

export type ItemsListProps = {
  t: TTranslation;
  inviteItems: InviteItem[];
  setInviteItems: (items: InviteItem[]) => void;
  changeInviteItem: (
    update: Partial<InviteItem> & { id: string | number },
    addExisting?: boolean,
    oldId?: string | number | null,
  ) => Promise<void>;
  setHasErrors: (v: boolean) => void;
  roomType: RoomsType | -1;
  roomId: number;
  isOwner: boolean;
  isAdmin: boolean;
  inputsRef: React.RefObject<HTMLDivElement | null>;
  isMobileView: boolean;
  allowInvitingGuests: boolean;
  externalLinksVisible?: boolean;
  scrollAllPanelContent?: boolean;
  invitePanelBodyRef?: React.RefObject<HTMLDivElement | null>;
};

const ItemsList: React.FC<ItemsListProps> = ({
  t,
  inviteItems,
  setInviteItems,
  changeInviteItem,
  setHasErrors,
  roomType,
  roomId,
  isOwner,
  isAdmin,
  inputsRef,
  isMobileView,
  allowInvitingGuests,
  externalLinksVisible = false,
  scrollAllPanelContent = false,
  invitePanelBodyRef,
}) => {
  const [bodyHeight, setBodyHeight] = useState(0);
  const [offsetTop, setOffsetTop] = useState(0);
  const [isTotalListHeight, setIsTotalListHeight] = useState(false);
  const [isOpenItemAccess, setIsOpenItemAccess] = useState(false);

  const bodyRef = useRef<HTMLDivElement>(null);
  const { height } = useResizeObserver({ ref: bodyRef as React.RefObject<HTMLDivElement> });
  const { interfaceDirection } = useInterfaceDirection();

  const onBodyResize = useCallback(() => {
    if (!bodyRef.current) return;

    const firstChild = bodyRef.current.firstChild as HTMLElement | null;
    const scrollHeight = firstChild?.scrollHeight ?? 0;
    const heightList = height ?? bodyRef.current.offsetHeight;
    const totalHeightItems = inviteItems.length * USER_ITEM_HEIGHT;
    const listAreaHeight = heightList;
    const heightBody = invitePanelBodyRef?.current?.clientHeight ?? 0;
    const fullHeightList = heightBody - bodyRef.current.offsetTop;
    const heightWithOpenItemAccess = Math.max(scrollHeight, fullHeightList);

    const calculatedHeight = scrollAllPanelContent
      ? Math.max(
          totalHeightItems,
          listAreaHeight,
          isOpenItemAccess ? heightWithOpenItemAccess : 0,
        )
      : heightList;

    const finalHeight = scrollAllPanelContent
      ? isOpenItemAccess
        ? calculatedHeight
        : totalHeightItems
      : calculatedHeight;

    setBodyHeight(finalHeight);
    setOffsetTop(bodyRef.current.offsetTop);

    if (scrollAllPanelContent && totalHeightItems && listAreaHeight)
      setIsTotalListHeight(
        totalHeightItems >= listAreaHeight && totalHeightItems >= scrollHeight,
      );
  }, [
    height,
    inviteItems.length,
    scrollAllPanelContent,
    isOpenItemAccess,
    invitePanelBodyRef,
  ]);

  useEffect(() => {
    onBodyResize();
  }, [
    bodyRef.current,
    externalLinksVisible,
    height,
    inviteItems.length,
    scrollAllPanelContent,
    isOpenItemAccess,
  ]);

  const overflowStyle = scrollAllPanelContent ? "hidden" : "unset";
  const willChangeStyle =
    isMobileView && isOpenItemAccess ? "auto" : "transform";

  const itemData: RowItemData = {
    inviteItems,
    setInviteItems,
    changeInviteItem,
    setHasErrors,
    roomType,
    roomId,
    isOwner,
    isAdmin,
    inputsRef,
    setIsOpenItemAccess,
    isMobileView,
    t,
    allowInvitingGuests,
  };

  return (
    <div
      className={classNames(styles.scrollList, {
        [styles.isAutoHeight]: scrollAllPanelContent && isTotalListHeight,
        [styles.withOffset]: !!offsetTop,
      })}
      ref={bodyRef}
      data-testid="invite_panel_items_scroll_list"
      style={{ "--offset-top": `${offsetTop}px` } as React.CSSProperties}
    >
      <List
        style={{ overflow: overflowStyle, willChange: willChangeStyle }}
        direction={interfaceDirection}
        height={bodyHeight}
        width="auto"
        itemCount={inviteItems.length}
        itemSize={USER_ITEM_HEIGHT}
        itemData={itemData}
        outerElementType={!scrollAllPanelContent ? VirtualScroll : undefined}
        data-testid="invite_panel_items_list"
      >
        {Row}
      </List>
    </div>
  );
};

export default ItemsList;
