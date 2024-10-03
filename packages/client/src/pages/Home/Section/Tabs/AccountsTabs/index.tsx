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

import { inject, observer } from "mobx-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { SectionSubmenuSkeleton } from "@docspace/shared/skeletons/sections";
import { Tabs } from "@docspace/shared/components/tabs";

import ClientLoadingStore from "SRC_DIR/store/ClientLoadingStore";
import PeopleStore from "SRC_DIR/store/contacts/PeopleStore";
import UsersStore from "SRC_DIR/store/contacts/UsersStore";
import GroupsStore from "SRC_DIR/store/contacts/GroupsStore";

type AccountsTabsProps = {
  showBodyLoader: ClientLoadingStore["showBodyLoader"];
  setUsersSelection: UsersStore["setSelection"];
  setUsersBufferSelection: UsersStore["setBufferSelection"];
  setGroupsSelection: GroupsStore["setSelection"];
  setGroupsBufferSelection: GroupsStore["setBufferSelection"];
};

const AccountsTabs = ({
  showBodyLoader,
  setUsersSelection,
  setGroupsSelection,
  setUsersBufferSelection,
  setGroupsBufferSelection,
}: AccountsTabsProps) => {
  const { t } = useTranslation(["Common"]);

  const location = useLocation();
  const navigate = useNavigate();

  const { groupId } = useParams();

  const isPeople = location.pathname.includes("/accounts/people");

  const onPeople = () => {
    setGroupsSelection([]);
    setGroupsBufferSelection(null);
    navigate("/accounts/people/filter");
  };

  const onGroups = () => {
    setUsersSelection([]);
    setUsersBufferSelection(null);
    navigate("/accounts/groups/filter");
  };

  const onGuests = () => {
    setUsersSelection([]);
    setUsersBufferSelection(null);
    setGroupsSelection([]);
    setGroupsBufferSelection(null);
    navigate("/accounts/guests/filter");
  };

  if (groupId !== undefined) return null;

  if (showBodyLoader) return <SectionSubmenuSkeleton />;

  return (
    <Tabs
      className="accounts-tabs"
      selectedItemId={isPeople ? "people" : "groups"}
      items={[
        {
          id: "people",
          name: t("Common:People"),
          onClick: onPeople,
          content: null,
        },
        {
          id: "groups",
          name: t("Common:Groups"),
          onClick: onGroups,
          content: null,
        },
        {
          id: "guests",
          name: t("Common:Guests"),
          onClick: onGuests,
          content: null,
        },
      ]}
    />
  );
};

export default inject(
  ({
    peopleStore,
    clientLoadingStore,
  }: {
    peopleStore: PeopleStore;
    clientLoadingStore: ClientLoadingStore;
  }) => {
    const { showBodyLoader } = clientLoadingStore;
    const { usersStore, groupsStore } = peopleStore;

    const {
      setSelection: setUserSelection,
      setBufferSelection: setUserBufferSelection,
    } = usersStore;
    const {
      setSelection: setGroupsSelection,
      setBufferSelection: setGroupsBufferSelection,
    } = groupsStore;

    return {
      showBodyLoader,
      setUserSelection,
      setUserBufferSelection,
      setGroupsSelection,
      setGroupsBufferSelection,
    };
  },
)(observer(AccountsTabs));
