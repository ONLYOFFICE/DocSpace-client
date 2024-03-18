// (c) Copyright Ascensio System SIA 2010-2024
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

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "styled-components";
import { useTranslation } from "react-i18next";

import DefaultUserPhoto from "PUBLIC_DIR/images/default_user_photo_size_82-82.png";
import EmptyScreenPersonsSvgUrl from "PUBLIC_DIR/images/empty_screen_persons.svg?url";
import CatalogAccountsReactSvgUrl from "PUBLIC_DIR/images/catalog.accounts.react.svg?url";
import EmptyScreenPersonsSvgDarkUrl from "PUBLIC_DIR/images/empty_screen_persons_dark.svg?url";

import { Selector } from "../../components/selector";
import { TSelectorItem } from "../../components/selector/Selector.types";
import { EmployeeStatus } from "../../enums";
import { TTranslation } from "../../types";
import { LOADER_TIMEOUT } from "../../constants";
import { getUserRole } from "../../utils/common";
import Filter from "../../api/people/filter";
import { getUserList } from "../../api/people";
import { TUser } from "../../api/people/types";
import useLoadingWithTimeout from "../../hooks/useLoadingWithTimeout";
import { RowLoader, SearchLoader } from "../../skeletons/selector";
import { AvatarRole } from "../../components/avatar";

import { PeopleSelectorProps } from "./PeopleSelector.types";

const GroupMembersSelector = ({
  acceptButtonLabel,
  accessRights,
  cancelButtonLabel,
  emptyScreenDescription,
  emptyScreenHeader,
  headerLabel,
  isMultiSelect,
  items,
  onAccept,

  onBackClick,
  onCancel,

  searchEmptyScreenDescription,
  searchEmptyScreenHeader,
  searchPlaceholder,
  selectAllIcon = CatalogAccountsReactSvgUrl,
  selectAllLabel,
  selectedAccessRight,
  selectedItems,
  withAccessRights,
  withCancelButton,
  withSelectAll,
  filter,
  excludeItems = [],
  currentUserId,

  withOutCurrentAuthorizedUser,
  withAbilityCreateRoomUsers,
  withFooterCheckbox,
  footerCheckboxLabel,
  isChecked,
  setIsChecked,
  filterUserId,
}: PeopleSelectorProps) => {
  const { t }: { t: TTranslation } = useTranslation([
    "PeopleTranslations",
    "People",
    "Common",
  ]);

  const theme = useTheme();

  const [total, setTotal] = useState<number>(-1);
  const [searchValue, setSearchValue] = useState<string>("");
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isNextPageLoading, setIsNextPageLoading] = useState(false);
  const [isLoading, setIsLoading] = useLoadingWithTimeout<boolean>(
    LOADER_TIMEOUT,
    false,
  );

  console.log(items);
  const itemList = items.map((user) => ({
    id: user.id,
    email: user.email,
    avatar: user.hasAvatar ? user.avatar : DefaultUserPhoto,
    label: user.displayName || user.email,
    role: AvatarRole[getUserRole(user)],
    isOwner: user.isOwner,
    isAdmin: user.isAdmin,
    isVisitor: user.isVisitor,
    isCollaborator: user.isCollaborator,
    hasAvatar: user.hasAvatar,
    shared: false,
  }));

  const onSearch = (value: string) => {
    setSearchValue(value);
  };

  const onClearSearch = () => {
    setSearchValue("");
  };

  const emptyScreenImage = theme.isBase
    ? EmptyScreenPersonsSvgUrl
    : EmptyScreenPersonsSvgDarkUrl;

  return (
    <Selector
      id="group-members-selector"
      headerLabel="group.name"
      onBackClick={onBackClick}
      searchPlaceholder="Search by group members"
      searchValue={searchValue}
      onSearch={onSearch}
      onClearSearch={onClearSearch}
      items={itemList}
      selectedItems={[]}
      acceptButtonLabel={t("Common:SelectAction")}
      onAccept={() => {}}
      searchEmptyScreenImage={emptyScreenImage}
      searchEmptyScreenHeader={t("People:NotFoundUsers")}
      searchEmptyScreenDescription={t("People:NotFoundUsersDescription")}
      totalItems={items.length}
      isLoading={isLoading}
      searchLoader={<SearchLoader />}
      isSearchLoading={isLoading}
      rowLoader={<RowLoader isUser isContainer={isLoading} />}
    />
  );
};

export default GroupMembersSelector;
