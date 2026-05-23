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

import { useState } from "react";
import classNames from "classnames";
import type { TTranslation } from "@docspace/shared/types";
import { RoomsType } from "@docspace/shared/enums";

import type { InviteItem } from "../index";
import Item from "./Item";
import styles from "../InvitePanel.module.scss";

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
}) => {
  const [, setIsOpenItemAccess] = useState(false);

  return (
    <div
      className={classNames(styles.scrollList)}
      data-testid="invite_panel_items_scroll_list"
    >
      {inviteItems.map((item, index) => (
        <Item
          key={item.id}
          t={t}
          item={item}
          index={index}
          inviteItems={inviteItems}
          setInviteItems={setInviteItems}
          changeInviteItem={changeInviteItem}
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
      ))}
    </div>
  );
};

export default ItemsList;
