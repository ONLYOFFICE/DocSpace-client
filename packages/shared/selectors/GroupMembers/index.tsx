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
