import i18n from "./i18n";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import React, { useState, useEffect } from "react";
import { I18nextProvider, withTranslation } from "react-i18next";

import { Selector } from "@docspace/shared/components/selector";

import { getUserRole } from "@docspace/shared/utils/common";
import Filter from "@docspace/shared/api/people/filter";
import { getUserList } from "@docspace/shared/api/people";
import Loaders from "@docspace/common/components/Loaders";
import { EmployeeStatus } from "@docspace/shared/enums";
import { LOADER_TIMEOUT } from "@docspace/shared/constants";

import useLoadingWithTimeout from "SRC_DIR/Hooks/useLoadingWithTimeout";

import DefaultUserPhoto from "PUBLIC_DIR/images/default_user_photo_size_82-82.png";

import EmptyScreenPersonsSvgUrl from "PUBLIC_DIR/images/empty_screen_persons.svg?url";
import CatalogAccountsReactSvgUrl from "PUBLIC_DIR/images/catalog.accounts.react.svg?url";
import EmptyScreenPersonsSvgDarkUrl from "PUBLIC_DIR/images/empty_screen_persons_dark.svg?url";

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
  onAccessRightsChange,
  onBackClick,
  onCancel,
  onSelect,
  onSelectAll,
  searchEmptyScreenDescription,
  searchEmptyScreenHeader,
  searchPlaceholder,
  selectAllIcon,
  selectAllLabel,
  selectedAccessRight,
  selectedItems,
  style,
  t,
  withAccessRights,
  withCancelButton,
  withSelectAll,
  filter,
  excludeItems,
  currentUserId,
  theme,
  withOutCurrentAuthorizedUser,
  withAbilityCreateRoomUsers,
  withFooterCheckbox,
  footerCheckboxLabel,
  isChecked,
  setIsChecked,
  filterUserId,
}) => {
  const [itemsList, setItemsList] = useState(items);
  const [searchValue, setSearchValue] = useState("");
  const [total, setTotal] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isNextPageLoading, setIsNextPageLoading] = useState(false);
  const [isLoading, setIsLoading] = useLoadingWithTimeout(
    LOADER_TIMEOUT,
    false
  );

  useEffect(() => {
    loadNextPage(0);
  }, []);

  const toListItem = (item) => {
    const {
      id,
      email,
      avatar,
      icon,
      displayName,
      hasAvatar,
      isOwner,
      isAdmin,
      isVisitor,
      isCollaborator,
    } = item;

    const role = getUserRole(item);

    const userAvatar = hasAvatar ? avatar : DefaultUserPhoto;

    return {
      id,
      email,
      avatar: userAvatar,
      icon,
      label: displayName || email,
      role,
      isOwner,
      isAdmin,
      isVisitor,
      isCollaborator,
      hasAvatar,
    };
  };

  const moveCurrentUserToTopOfList = (listUser) => {
    const currentUserIndex = listUser.findIndex(
      (user) => user.id === currentUserId
    );

    // return if the current user is already at the top of the list or not found
    if (currentUserIndex < 1) return listUser;

    const [currentUser] = listUser.splice(currentUserIndex, 1);

    listUser.splice(0, 0, currentUser);

    return listUser;
  };

  const removeCurrentUserFromList = (listUser) => {
    if (filterUserId) {
      return listUser.filter((user) => user.id !== filterUserId);
    }
    return listUser.filter((user) => user.id !== currentUserId);
  };

  const loadNextPage = (startIndex, search = searchValue) => {
    const pageCount = 100;

    setIsNextPageLoading(true);

    if (startIndex === 0) {
      setIsLoading(true);
    }

    const currentFilter =
      typeof filter === "function" ? filter() : filter ?? Filter.getDefault();

    currentFilter.page = startIndex / pageCount;
    currentFilter.pageCount = pageCount;

    if (!!search.length) {
      currentFilter.search = search;
    }

    getUserList(currentFilter)
      .then((response) => {
        let newItems = startIndex ? itemsList : [];
        let totalDifferent = startIndex ? response.total - total : 0;

        const items = response.items
          .filter((item) => {
            const excludeUser =
              withAbilityCreateRoomUsers &&
              ((!item.isAdmin && !item.isOwner && !item.isRoomAdmin) ||
                item.status === EmployeeStatus.Disabled);

            if (excludeItems.includes(item.id) || excludeUser) {
              totalDifferent++;
              return false;
            } else {
              return true;
            }
          })
          .map((item) => toListItem(item));

        const tempItems = [...newItems, ...items];

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
      })
      .catch((error) => console.log(error));
  };

  const onSearch = (value) => {
    setSearchValue(value);
    loadNextPage(0, value);
  };

  const onClearSearch = () => {
    setSearchValue("");
    loadNextPage(0, "");
  };

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
      searchLoader={<Loaders.SelectorSearchLoader />}
      isSearchLoading={isLoading}
      rowLoader={<Loaders.SelectorRowLoader isUser isContainer={isLoading} />}
    />
  );
};

PeopleSelector.propTypes = { excludeItems: PropTypes.array };

PeopleSelector.defaultProps = {
  excludeItems: [],
  selectAllIcon: CatalogAccountsReactSvgUrl,
};

const ExtendedPeopleSelector = inject(({ auth }) => {
  return {
    theme: auth.settingsStore.theme,
    currentUserId: auth.userStore.user.id,
  };
})(
  observer(
    withTranslation([
      "PeopleSelector",
      "PeopleTranslations",
      "People",
      "Common",
    ])(PeopleSelector)
  )
);

export default (props) => (
  <I18nextProvider i18n={i18n}>
    <ExtendedPeopleSelector {...props} />
  </I18nextProvider>
);
