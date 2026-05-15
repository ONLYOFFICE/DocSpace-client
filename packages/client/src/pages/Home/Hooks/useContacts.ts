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

import React from "react";
import { useParams, useLocation } from "react-router";
import { useTranslation } from "react-i18next";

import Filter from "@docspace/shared/api/people/filter";
import GroupsFilter from "@docspace/shared/api/groups/filter";

import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import TreeFoldersStore from "SRC_DIR/store/TreeFoldersStore";
import FilesStore from "SRC_DIR/store/FilesStore";
import UsersStore from "SRC_DIR/store/contacts/UsersStore";
import GroupsStore from "SRC_DIR/store/contacts/GroupsStore";
import { getContactsView } from "SRC_DIR/helpers/contacts";

export type UseContactsProps = {
  isContactsPage: boolean;

  setContactsTab: UsersStore["setContactsTab"];

  scrollToTop: FilesStore["scrollToTop"];
  setSelectedNode: TreeFoldersStore["setSelectedNode"];

  getUsersList: UsersStore["getUsersList"];
  getGroups: GroupsStore["getGroups"];
  updateCurrentGroup: GroupsStore["updateCurrentGroup"];
};

const useContacts = ({
  isContactsPage,

  setContactsTab,

  scrollToTop,
  setSelectedNode,

  getUsersList,
  getGroups,
  updateCurrentGroup,
}: UseContactsProps) => {
  const { groupId } = useParams();
  const location = useLocation();
  const { t } = useTranslation(["Common"]);

  const fetchContacts = React.useCallback(async () => {
    if (!isContactsPage) return;

    const contactsView = getContactsView(location);

    const isInsideGroup = contactsView === "inside_group";
    const isGuests = contactsView === "guests";
    const isGroups = contactsView === "groups";

    const node = isInsideGroup || isGuests ? "people" : contactsView;
    setSelectedNode(["accounts", node, "filter"]);

    setDocumentTitle(t("Common:Contacts"));

    const getList = async () => {
      if (isGroups) {
        const newFilter = GroupsFilter.getFilter(location)!;

        await getGroups(newFilter, true, true);

        return "groups";
      }

      const newFilter = Filter.getFilter(location)!;

      newFilter.area = isGuests ? "guests" : "people";

      if (groupId) newFilter.group = groupId;

      if (isGuests) {
        newFilter.group = null;
      }

      await Promise.all([
        getUsersList(newFilter, true, true, contactsView),
        groupId && isInsideGroup ? updateCurrentGroup(groupId) : null,
      ]);

      return "users";
    };

    setContactsTab(contactsView);

    const view = await getList();

    scrollToTop();

    return view;
  }, [
    isContactsPage,
    setContactsTab,
    groupId,
    location,
    getGroups,
    getUsersList,
    updateCurrentGroup,
    scrollToTop,
    setSelectedNode,
    t,
  ]);

  return { fetchContacts };
};

export default useContacts;
