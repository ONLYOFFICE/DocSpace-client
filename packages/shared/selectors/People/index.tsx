import { useState, useCallback, useRef } from "react";
import { useTheme } from "styled-components";
import { useTranslation } from "react-i18next";

import DefaultUserPhoto from "PUBLIC_DIR/images/default_user_photo_size_82-82.png";
import EmptyScreenPersonsSvgUrl from "PUBLIC_DIR/images/empty_screen_persons.svg?url";
import EmptyScreenPersonsSvgDarkUrl from "PUBLIC_DIR/images/empty_screen_persons_dark.svg?url";

import { Selector } from "../../components/selector";
import {
  TSelectorCancelButton,
  TSelectorCheckbox,
  TSelectorHeader,
  TSelectorItem,
  TSelectorSearch,
} from "../../components/selector/Selector.types";
import { EmployeeStatus } from "../../enums";
import { TTranslation } from "../../types";
import { getUserRole } from "../../utils/common";
import Filter from "../../api/people/filter";
import { getUserList } from "../../api/people";
import { TUser } from "../../api/people/types";
import { RowLoader, SearchLoader } from "../../skeletons/selector";
import { AvatarRole } from "../../components/avatar";

import { PeopleSelectorProps } from "./PeopleSelector.types";

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
  } as TSelectorItem;

  return i;
};

const PeopleSelector = ({
  submitButtonLabel,
  submitButtonId,
  onSubmit,
  disableSubmitButton,

  id,
  className,
  style,

  cancelButtonLabel,
  onCancel,
  withCancelButton,

  filter,
  excludeItems,
  currentUserId,
  withOutCurrentAuthorizedUser,
  withAbilityCreateRoomUsers,
  filterUserId,

  withFooterCheckbox,
  footerCheckboxLabel,
  isChecked,
  setIsChecked,

  withHeader,
  headerProps,
}: PeopleSelectorProps) => {
  const { t }: { t: TTranslation } = useTranslation(["Common"]);

  const theme = useTheme();

  const [itemsList, setItemsList] = useState<TSelectorItem[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [total, setTotal] = useState<number>(-1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isNextPageLoading, setIsNextPageLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TSelectorItem | null>(null);
  const isFirstLoad = useRef(true);
  const totalRef = useRef(0);

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

  const loadNextPage = useCallback(
    async (startIndex: number) => {
      const pageCount = 100;

      setIsNextPageLoading(true);

      const currentFilter =
        typeof filter === "function" ? filter() : filter ?? Filter.getDefault();

      currentFilter.page = startIndex / pageCount;
      currentFilter.pageCount = pageCount;

      currentFilter.search = searchValue || null;

      const response = await getUserList(currentFilter);

      let totalDifferent = startIndex ? response.total - totalRef.current : 0;

      const data = response.items
        .filter((item) => {
          const excludeUser =
            (!!withAbilityCreateRoomUsers &&
              !item.isAdmin &&
              !item.isOwner &&
              !item.isRoomAdmin) ||
            item.status === EmployeeStatus.Disabled;

          if ((excludeItems && excludeItems.includes(item.id)) || excludeUser) {
            totalDifferent += 1;
            return false;
          }
          return true;
        })
        .map((item) => toListItem(item));

      const newTotal = withOutCurrentAuthorizedUser
        ? response.total - totalDifferent - 1
        : response.total - totalDifferent;

      if (isFirstLoad) {
        const newItems = withOutCurrentAuthorizedUser
          ? removeCurrentUserFromList(data)
          : moveCurrentUserToTopOfList(data);

        setHasNextPage(newItems.length < newTotal);
        setItemsList(newItems);
      } else {
        setItemsList((i) => {
          const tempItems = [...i, ...data];

          const newItems = withOutCurrentAuthorizedUser
            ? removeCurrentUserFromList(tempItems)
            : moveCurrentUserToTopOfList(tempItems);

          setHasNextPage(newItems.length < newTotal);

          return newItems;
        });
      }

      setTotal(newTotal);
      totalRef.current = newTotal;

      setIsNextPageLoading(false);
      isFirstLoad.current = false;
    },
    [
      excludeItems,
      filter,
      moveCurrentUserToTopOfList,
      removeCurrentUserFromList,
      searchValue,
      withAbilityCreateRoomUsers,
      withOutCurrentAuthorizedUser,
    ],
  );

  const onSearch = useCallback((value: string, callback?: Function) => {
    isFirstLoad.current = true;
    setSearchValue(() => {
      return value;
    });
    callback?.();
  }, []);

  const onClearSearch = useCallback((callback?: Function) => {
    isFirstLoad.current = true;
    setSearchValue(() => {
      return "";
    });
    callback?.();
  }, []);

  const emptyScreenImage = theme.isBase
    ? EmptyScreenPersonsSvgUrl
    : EmptyScreenPersonsSvgDarkUrl;

  const headerSelectorProps: TSelectorHeader = withHeader
    ? {
        withHeader,
        headerProps: {
          ...headerProps,
          headerLabel: headerProps.headerLabel || t("Common:ListAccounts"),
        },
      }
    : ({} as TSelectorHeader);

  const cancelButtonSelectorProps: TSelectorCancelButton = withCancelButton
    ? {
        withCancelButton,
        cancelButtonLabel: cancelButtonLabel || t("Common:CancelButton"),
        onCancel,
      }
    : ({} as TSelectorCancelButton);

  const searchSelectorProps: TSelectorSearch = {
    withSearch: true,
    searchPlaceholder: t("Common:Search"),
    searchValue,
    onSearch,
    onClearSearch,
    searchLoader: <SearchLoader />,
    isSearchLoading: isFirstLoad.current,
  };

  const checkboxSelectorProps: TSelectorCheckbox = withFooterCheckbox
    ? {
        withFooterCheckbox,
        footerCheckboxLabel,
        isChecked,
        setIsChecked,
      }
    : {};

  return (
    <Selector
      id={id}
      className={className}
      style={style}
      {...headerSelectorProps}
      {...searchSelectorProps}
      {...checkboxSelectorProps}
      {...cancelButtonSelectorProps}
      items={itemsList}
      submitButtonLabel={submitButtonLabel || t("Common:SelectAction")}
      onSubmit={onSubmit}
      disableSubmitButton={disableSubmitButton || !selectedItem}
      submitButtonId={submitButtonId}
      emptyScreenImage={emptyScreenImage}
      emptyScreenHeader={t("Common:EmptyHeader")}
      emptyScreenDescription={t("Common:EmptyDescription")}
      searchEmptyScreenImage={emptyScreenImage}
      searchEmptyScreenHeader={t("Common:NotFoundUsers")}
      searchEmptyScreenDescription={t("Common:NotFoundUsersDescription")}
      hasNextPage={hasNextPage}
      isNextPageLoading={isNextPageLoading}
      loadNextPage={loadNextPage}
      isMultiSelect={false}
      totalItems={total}
      isLoading={isFirstLoad.current}
      searchLoader={<SearchLoader />}
      rowLoader={<RowLoader isUser isContainer={isFirstLoad.current} />}
      onSelect={(item) => setSelectedItem(item)}
    />
  );
};

export default PeopleSelector;
