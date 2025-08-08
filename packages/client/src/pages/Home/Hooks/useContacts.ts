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
import { useParams, useLocation } from "react-router";
import { useTranslation } from "react-i18next";

import Filter from "@docspace/shared/api/people/filter";
import GroupsFilter from "@docspace/shared/api/groups/filter";

import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import { TContactsTab } from "SRC_DIR/helpers/contacts";
import TreeFoldersStore from "SRC_DIR/store/TreeFoldersStore";
import FilesStore from "SRC_DIR/store/FilesStore";
import UsersStore from "SRC_DIR/store/contacts/UsersStore";
import GroupsStore from "SRC_DIR/store/contacts/GroupsStore";

type UseContactsProps = {
  isContactsPage: boolean;
  contactsView: TContactsTab;

  setContactsTab: UsersStore["setContactsTab"];

  setIsLoading: (
    param: boolean,
    withoutTimer?: boolean,
    withHeaderLoader?: boolean,
  ) => void;
  scrollToTop: FilesStore["scrollToTop"];
  setSelectedNode: TreeFoldersStore["setSelectedNode"];

  getUsersList: UsersStore["getUsersList"];
  getGroups: GroupsStore["getGroups"];
  updateCurrentGroup: GroupsStore["updateCurrentGroup"];
};

const useContacts = ({
  isContactsPage,
  contactsView,

  setContactsTab,

  setIsLoading,
  scrollToTop,
  setSelectedNode,

  getUsersList,
  getGroups,
  updateCurrentGroup,
}: UseContactsProps) => {
  const { groupId } = useParams();
  const location = useLocation();
  const { t } = useTranslation(["Common"]);

  React.useEffect(() => {
    if (!isContactsPage) return setContactsTab(false);

    setIsLoading(true);
    setContactsTab(contactsView);

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
      } else {
        const newFilter = Filter.getFilter(location)!;

        newFilter.area = isGuests ? "guests" : "people";

        if (groupId) newFilter.group = groupId;

        if (isGuests) {
          newFilter.group = null;
        }

        await Promise.all([
          getUsersList(newFilter, true, true),
          groupId && isInsideGroup ? updateCurrentGroup(groupId) : null,
        ]);
      }

      scrollToTop();
      setIsLoading(false);
    };

    getList();
  }, [
    contactsView,
    isContactsPage,
    setContactsTab,
    groupId,
    location,
    getGroups,
    getUsersList,
    updateCurrentGroup,
    scrollToTop,
    setIsLoading,
    setSelectedNode,
    t,
  ]);
};

export default useContacts;
