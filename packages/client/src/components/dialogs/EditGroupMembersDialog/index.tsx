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

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { observer, inject } from "mobx-react";
import { useState, useEffect, useTransition } from "react";
import { getGroupMembersInRoom } from "@docspace/shared/api/groups";
import { useTranslation } from "react-i18next";
import { InputSize } from "@docspace/shared/components/text-input";
import { SearchInput } from "@docspace/shared/components/search-input";
import GroupMember from "./GroupMember";
import EmptyContainer from "./EmptyContainer";

interface EditGroupMembersProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  group: any;
  infoPanelSelection: any;
}

const EditGroupMembers = ({
  infoPanelSelection,
  group,
  visible,
  setVisible,
}: EditGroupMembersProps) => {
  const { t } = useTranslation(["Common"]);

  const [searchValue, setSearchValue] = useState<string>("");
  const onChangeSearchValue = (newValue: string) => {
    setSearchValue(newValue);
  };
  const onClearSearch = () => onChangeSearchValue("");

  const [groupMembers, setGroupMembers] = useState<any[] | null>(null);
  const filteredGroupMembers = groupMembers?.filter((groupMember) =>
    groupMember.user.displayName.includes(searchValue),
  );
  const [, startTransition] = useTransition();

  const onClose = () => setVisible(false);

  const isSearchListEmpty =
    filteredGroupMembers && !filteredGroupMembers.length;
  const hasMembers = filteredGroupMembers && filteredGroupMembers.length !== 0;

  useEffect(() => {
    const fetchGroup = async () => {
      if (!group) return;

      getGroupMembersInRoom(infoPanelSelection.id, group.id)!
        .then((data: any) => startTransition(() => setGroupMembers(data.items)))
        .catch((err: any) => console.error(err));
    };
    fetchGroup();
  }, [group, infoPanelSelection.id]);

  if (!infoPanelSelection?.isRoom) {
    onClose();
    return;
  }

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.aside}
    >
      <ModalDialog.Header>{group.name}</ModalDialog.Header>

      <ModalDialog.Body>
        <SearchInput
          className="search-input"
          placeholder={t("PeopleTranslations:SearchByGroupMembers")}
          value={searchValue}
          onChange={onChangeSearchValue}
          onClearSearch={onClearSearch}
          size={InputSize.base}
        />

        <div style={{ height: "12px", width: "100%" }} />

        {isSearchListEmpty && <EmptyContainer />}

        {hasMembers &&
          filteredGroupMembers.map(({ user, ...rest }) => (
            <GroupMember t={t} key={user.id} user={{ ...user, ...rest }} />
          ))}
      </ModalDialog.Body>
    </ModalDialog>
  );
};

export default inject(({ infoPanelStore, userStore, dialogsStore }) => ({
  infoPanelSelection: infoPanelStore.infoPanelSelection,
  selfId: userStore.user.id,
  group: dialogsStore.editMembersGroup,
  visible: dialogsStore.editGroupMembersDialogVisible,
  setVisible: dialogsStore.setEditGroupMembersDialogVisible,
}))(observer(EditGroupMembers));
