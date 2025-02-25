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

import React from "react";
import { TFunction } from "i18next";

import { DropDownItem } from "@docspace/shared/components/drop-down-item";

import {
  getContactsCheckboxItemLabel,
  getContactsMenuItemId,
  TContactsSelected,
} from "SRC_DIR/helpers/contacts";
import HeaderMenuStore from "SRC_DIR/store/contacts/HeaderMenuStore";
import UsersStore from "SRC_DIR/store/contacts/UsersStore";
import GroupsStore from "SRC_DIR/store/contacts/GroupsStore";

type UseContactsHeaderProps = {
  t: TFunction;
  cbContactsMenuItems: HeaderMenuStore["cbContactsMenuItems"];

  setUsersSelected: UsersStore["setSelected"];
  setGroupsSelected: GroupsStore["setSelected"];

  isContactsGroupsPage: boolean;
};

export const useContactsHeader = ({
  t,

  cbContactsMenuItems,

  setUsersSelected,
  setGroupsSelected,

  isContactsGroupsPage,
}: UseContactsHeaderProps) => {
  const getContactsMenuItems = React.useCallback(() => {
    if (isContactsGroupsPage) return null;

    const onSelect = (
      e: React.MouseEvent | React.ChangeEvent<HTMLInputElement>,
    ) => {
      const key = (e.currentTarget as HTMLElement).dataset
        .key as TContactsSelected;

      setUsersSelected(key);
    };

    return (
      <>
        {cbContactsMenuItems.map((key) => {
          const label = getContactsCheckboxItemLabel(t, key);
          const id = getContactsMenuItemId(key);
          return (
            <DropDownItem
              id={id}
              key={key}
              label={label}
              data-key={key}
              onClick={onSelect}
            />
          );
        })}
      </>
    );
  }, [cbContactsMenuItems, isContactsGroupsPage, setUsersSelected, t]);

  const onContactsChange = React.useCallback(
    (checked: boolean) => {
      if (!isContactsGroupsPage) {
        setUsersSelected(checked ? "all" : "none");
      } else {
        setGroupsSelected(checked ? "all" : "none");
      }
    },
    [isContactsGroupsPage, setGroupsSelected, setUsersSelected],
  );

  return { getContactsMenuItems, onContactsChange };
};
