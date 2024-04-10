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

import * as Styled from "./index.styled";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { inject, observer } from "mobx-react";
import { SectionSubmenuSkeleton } from "@docspace/shared/skeletons/sections";
import { useTranslation } from "react-i18next";

const AccountsSubmenu = ({
  showBodyLoader,
  setPeopleSelection,
  setGroupsSelection,
  setPeopleBufferSelection,
  setGroupsBufferSelection,
}) => {
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
    setPeopleSelection([]);
    setPeopleBufferSelection(null);
    navigate("/accounts/groups/filter");
  };

  if (groupId !== undefined) return null;

  if (showBodyLoader) return <SectionSubmenuSkeleton />;

  return (
    <Styled.AccountsSubmenu
      className="accounts-tabs"
      forsedActiveItemId={isPeople ? "people" : "groups"}
      data={[
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
      ]}
    />
  );
};

export default inject(({ peopleStore, clientLoadingStore }) => ({
  showBodyLoader: clientLoadingStore.showBodyLoader,
  setPeopleSelection: peopleStore.selectionStore.setSelection,
  setPeopleBufferSelection: peopleStore.selectionStore.setBufferSelection,
  setGroupsSelection: peopleStore.groupsStore.setSelection,
  setGroupsBufferSelection: peopleStore.groupsStore.setBufferSelection,
}))(observer(AccountsSubmenu));
