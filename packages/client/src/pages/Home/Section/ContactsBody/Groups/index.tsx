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

import { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useLocation } from "react-router";

import { Consumer } from "@docspace/ui-kit/utils/context";
import { RowsSkeleton, TableSkeleton } from "@docspace/shared/skeletons";

import PeopleStore from "SRC_DIR/store/contacts/PeopleStore";
import UsersStore from "SRC_DIR/store/contacts/UsersStore";

import TableView from "./TableView";
import RowView from "./RowView";

type GroupsProps = {
  viewAs?: PeopleStore["viewAs"];
  isGroupsLoaded?: boolean;
  setUsersSelection?: UsersStore["setSelection"];
  setUsersBufferSelection?: UsersStore["setBufferSelection"];
};

const Groups = ({
  viewAs,
  isGroupsLoaded,
  setUsersSelection,
  setUsersBufferSelection,
}: GroupsProps) => {
  const location = useLocation();

  useEffect(() => {
    setUsersSelection!([]);

    setUsersBufferSelection!(null);
  }, [location, setUsersBufferSelection, setUsersSelection]);

  if (!isGroupsLoaded) {
    if (viewAs === "table") return <TableSkeleton />;
    return <RowsSkeleton />;
  }

  return (
    <Consumer>
      {(context) =>
        viewAs === "table" ? (
          <TableView sectionWidth={context.sectionWidth} />
        ) : (
          <RowView sectionWidth={context.sectionWidth} />
        )
      }
    </Consumer>
  );
};

export default inject(({ peopleStore }: TStore) => ({
  viewAs: peopleStore.viewAs,
  isGroupsLoaded: peopleStore.groupsStore!.groups !== undefined,
  setUsersSelection: peopleStore.usersStore.setSelection,
  setUsersBufferSelection: peopleStore.usersStore.setBufferSelection,
}))(observer(Groups));
