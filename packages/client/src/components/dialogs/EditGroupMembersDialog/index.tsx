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

import { inject, observer } from "mobx-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { getGroupMembersInRoom } from "@docspace/shared/api/groups";
import { InputSize } from "@docspace/shared/components/text-input";
import { SearchInput } from "@docspace/shared/components/search-input";
import {
  TGroup,
  TGroupMemberInvitedInRoom,
} from "@docspace/shared/api/groups/types";
import { MIN_LOADER_TIMER } from "@docspace/shared/selectors/utils/constants";

import EmptyContainer from "./EmptyContainer";
import GroupMembersList from "./sub-components/GroupMembersList/GroupMembersList";
import {
  StyledBodyContent,
  StyledHeaderText,
} from "./EditGroupMembersDialog.styled";
import { ModalBodyLoader } from "./sub-components/ModalBodyLoader/ModalBodyLoader";

interface EditGroupMembersProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  group: TGroup;
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
  const [total, setTotal] = useState(0);
  const [groupMembers, setGroupMembers] = useState<
    TGroupMemberInvitedInRoom[] | null
  >(null);
  const [isSearchResultLoading, setIsSearchResultLoading] = useState(false);
  const [isNextPageLoading, setIsNextPageLoading] = useState(false);

  const onChangeSearchValue = (value: string) => {
    setIsSearchResultLoading(true);
    setSearchValue(value.trim());
  };

  const onClearSearch = () => onChangeSearchValue("");

  const onClose = () => setVisible(false);

  const loadNextPage = async (startIndex: number) => {
    const startLoadingTime = new Date();

    try {
      setIsNextPageLoading(true);
      const filter = { startIndex, count: 100, filterValue: searchValue };

      const data = await getGroupMembersInRoom(
        infoPanelSelection.id,
        group.id,
        filter,
      );

      setTotal(data.total);
      if (startIndex === 0 || !groupMembers) {
        setGroupMembers(data.items);
      } else {
        setGroupMembers([...groupMembers, ...data.items]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      const nowDate = new Date();
      const diff = Math.abs(nowDate.getTime() - startLoadingTime.getTime());

      if (diff < MIN_LOADER_TIMER) {
        setTimeout(() => {
          setIsSearchResultLoading(false);
        }, MIN_LOADER_TIMER - diff);
      } else {
        setIsSearchResultLoading(false);
      }
      setIsNextPageLoading(false);
      // setIsSearchResultLoading(false);
    }
  };

  useEffect(() => {
    loadNextPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  if (!infoPanelSelection?.isRoom) {
    onClose();
    return;
  }

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.aside}
      withoutPadding
    >
      <ModalDialog.Header>
        <StyledHeaderText
          fontSize="21px"
          fontWeight={700}
          dir="auto"
          truncate
          noSelect
        >
          {group.name}
        </StyledHeaderText>
      </ModalDialog.Header>

      <ModalDialog.Body>
        <StyledBodyContent>
          {!groupMembers ? (
            <ModalBodyLoader withSearch />
          ) : (
            <>
              <SearchInput
                className="search-input"
                placeholder={t("PeopleTranslations:SearchByGroupMembers")}
                value={searchValue}
                onChange={onChangeSearchValue}
                onClearSearch={onClearSearch}
                size={InputSize.base}
              />

              {isSearchResultLoading ? (
                <ModalBodyLoader withSearch={false} />
              ) : !groupMembers.length ? (
                <EmptyContainer />
              ) : (
                <GroupMembersList
                  members={groupMembers}
                  loadNextPage={loadNextPage}
                  hasNextPage={groupMembers.length < total}
                  total={total}
                  isNextPageLoading={isNextPageLoading}
                />
              )}
            </>
          )}
        </StyledBodyContent>
      </ModalDialog.Body>
    </ModalDialog>
  );
};

export default inject(({ infoPanelStore, userStore, dialogsStore }: any) => ({
  infoPanelSelection: infoPanelStore.infoPanelSelection,
  selfId: userStore.user.id,
  group: dialogsStore.editMembersGroup,
  visible: dialogsStore.editGroupMembersDialogVisible,
  setVisible: dialogsStore.setEditGroupMembersDialogVisible,
}))(observer(EditGroupMembers));
