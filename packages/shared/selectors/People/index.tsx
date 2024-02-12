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

const PeopleSelector = ({
  acceptButtonLabel,
  accessRights,
  cancelButtonLabel,
  className,
  emptyScreenDescription,
  emptyScreenHeader,
  headerLabel,
  id,
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
  style,
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
    "PeopleSelector",
    "People",
    "Common",
  ]);

  const theme = useTheme();

  const [itemsList, setItemsList] = useState(items);
  const [searchValue, setSearchValue] = useState("");
  const [total, setTotal] = useState<number>(-1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isNextPageLoading, setIsNextPageLoading] = useState(false);
  const [isLoading, setIsLoading] = useLoadingWithTimeout<boolean>(
    LOADER_TIMEOUT,
    false,
  );

  const moveCurrentUserToTopOfList = useCallback(
    (listUser: TSelectorItem[]) => {
      const currentUserIndex = listUser.findIndex(
        (user) => user.id === currentUserId,
      );

      // return if the current user is already at the top of the list or not found
      if (currentUserIndex < 1) return listUser;

      const [currentUser] = listUser.splice(currentUserIndex, 1);

      listUser.splice(0, 0, currentUser);

      return listUser;
    },
    [currentUserId],
  );

  const removeCurrentUserFromList = useCallback(
    (listUser: TSelectorItem[]) => {
      if (filterUserId) {
        return listUser.filter((user) => user.id !== filterUserId);
      }
      return listUser.filter((user) => user.id !== currentUserId);
    },
    [currentUserId, filterUserId],
  );

  const toListItem = (item: TUser) => {
    const {
      id: userId,
      email,
      avatar,
      displayName,
      hasAvatar,
      isOwner,
      isAdmin,
      isVisitor,
      isCollaborator,
    } = item;

    const role = getUserRole(item);

    const userAvatar = hasAvatar ? avatar : DefaultUserPhoto;

    const i = {
      id: userId,
      email,
      avatar: userAvatar,
      label: displayName || email,
      role: AvatarRole[role],
      isOwner,
      isAdmin,
      isVisitor,
      isCollaborator,
      hasAvatar,
      shared: false,
    } as TSelectorItem;

    return i;
  };

  const loadNextPage = useCallback(
    async (startIndex: number, search = searchValue) => {
      const pageCount = 100;

      setIsNextPageLoading(true);

      if (startIndex === 0) {
        setIsLoading(true);
      }

      const currentFilter =
        typeof filter === "function" ? filter() : filter ?? Filter.getDefault();

      currentFilter.page = startIndex / pageCount;
      currentFilter.pageCount = pageCount;

      if (search.length) {
        currentFilter.search = search;
      }

      const response = await getUserList(currentFilter);

      let newItems = startIndex && itemsList ? itemsList : [];
      let totalDifferent = startIndex ? response.total - total : 0;

      const data = response.items
        .filter((item) => {
          const excludeUser =
            (!!withAbilityCreateRoomUsers &&
              !item.isAdmin &&
              !item.isOwner &&
              !item.isRoomAdmin) ||
            item.status === EmployeeStatus.Disabled;

          if (excludeItems.includes(item.id) || excludeUser) {
            totalDifferent += 1;
            return false;
          }
          return true;
        })
        .map((item) => toListItem(item));

      const tempItems = [...newItems, ...data];

      newItems = withOutCurrentAuthorizedUser
        ? removeCurrentUserFromList(tempItems)
        : moveCurrentUserToTopOfList(tempItems);

      const newTotal = withOutCurrentAuthorizedUser
        ? response.total - totalDifferent - 1
        : response.total - totalDifferent;

      setHasNextPage(newItems.length < newTotal);
      setItemsList(newItems);
      setTotal(newTotal);

      setIsNextPageLoading(false);
      setIsLoading(false);
    },
    [
      excludeItems,
      filter,
      itemsList,
      moveCurrentUserToTopOfList,
      removeCurrentUserFromList,
      searchValue,
      setIsLoading,
      total,
      withAbilityCreateRoomUsers,
      withOutCurrentAuthorizedUser,
    ],
  );

  const onSearch = (value: string) => {
    setSearchValue(value);
    loadNextPage(0, value);
  };

  const onClearSearch = () => {
    setSearchValue("");
    loadNextPage(0, "");
  };

  useEffect(() => {
    loadNextPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emptyScreenImage = theme.isBase
    ? EmptyScreenPersonsSvgUrl
    : EmptyScreenPersonsSvgDarkUrl;

  return (
    <Selector
      id={id}
      className={className}
      style={style}
      headerLabel={headerLabel || t("ListAccounts")}
      onBackClick={onBackClick}
      searchPlaceholder={searchPlaceholder || t("Common:Search")}
      searchValue={searchValue}
      onSearch={onSearch}
      onClearSearch={onClearSearch}
      items={itemsList}
      isMultiSelect={isMultiSelect}
      selectedItems={selectedItems}
      acceptButtonLabel={acceptButtonLabel || t("Common:SelectAction")}
      onAccept={onAccept}
      withSelectAll={withSelectAll}
      selectAllLabel={selectAllLabel || t("AllAccounts")}
      selectAllIcon={selectAllIcon}
      withAccessRights={withAccessRights}
      accessRights={accessRights}
      selectedAccessRight={selectedAccessRight}
      withCancelButton={withCancelButton}
      cancelButtonLabel={cancelButtonLabel || t("Common:CancelButton")}
      onCancel={onCancel}
      emptyScreenImage={emptyScreenImage}
      emptyScreenHeader={emptyScreenHeader || t("EmptyHeader")}
      emptyScreenDescription={emptyScreenDescription || t("EmptyDescription")}
      searchEmptyScreenImage={emptyScreenImage}
      searchEmptyScreenHeader={
        searchEmptyScreenHeader || t("People:NotFoundUsers")
      }
      searchEmptyScreenDescription={
        searchEmptyScreenDescription || t("People:NotFoundUsersDescription")
      }
      hasNextPage={hasNextPage}
      isNextPageLoading={isNextPageLoading}
      loadNextPage={loadNextPage}
      totalItems={total}
      isLoading={isLoading}
      withFooterCheckbox={withFooterCheckbox}
      footerCheckboxLabel={footerCheckboxLabel}
      isChecked={isChecked}
      setIsChecked={setIsChecked}
      searchLoader={<SearchLoader />}
      isSearchLoading={isLoading}
      rowLoader={<RowLoader isUser isContainer={isLoading} />}
    />
  );
};

export default PeopleSelector;
