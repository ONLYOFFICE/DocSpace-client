import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import React, { useState, useEffect, useCallback } from "react";

import { Aside } from "@docspace/shared/components/aside";
import { Backdrop } from "@docspace/shared/components/backdrop";
import { Selector } from "@docspace/shared/components/selector";
import { toastr } from "@docspace/shared/components/toast";
import { Text } from "@docspace/shared/components/text";

import {
  firstLetterToUppercase,
  getUserRole,
} from "@docspace/shared/utils/common";
import Filter from "@docspace/shared/api/people/filter";
import Loaders from "@docspace/common/components/Loaders";
import { getMembersList } from "@docspace/shared/api/people";
import useLoadingWithTimeout from "@docspace/shared/hooks/useLoadingWithTimeout";
import { ShareAccessRights } from "@docspace/shared/enums";
import { LOADER_TIMEOUT } from "@docspace/shared/constants";

import withLoader from "../../../HOCs/withLoader";

import DefaultUserPhoto from "PUBLIC_DIR/images/default_user_photo_size_82-82.png";

import EmptyScreenPersonsSvgUrl from "PUBLIC_DIR/images/empty_screen_persons.svg?url";
import CatalogAccountsReactSvgUrl from "PUBLIC_DIR/images/catalog.accounts.react.svg?url";
import EmptyScreenPersonsSvgDarkUrl from "PUBLIC_DIR/images/empty_screen_persons_dark.svg?url";
import { RowLoader, SearchLoader } from "@docspace/shared/skeletons/selector";

const AddUsersPanel = ({
  isEncrypted,
  defaultAccess,
  onClose,
  onParentPanelClose,
  tempDataItems,
  setDataItems,
  t,
  visible,
  groupsCaption,
  accessOptions,
  isMultiSelect,
  theme,
  withoutBackground,
  withBlur,
  roomId,
}) => {
  const accessRight = defaultAccess
    ? defaultAccess
    : isEncrypted
      ? ShareAccessRights.FullAccess
      : ShareAccessRights.ReadOnly;

  const onBackClick = () => onClose();
  const getFilterWithOutDisabledUser = useCallback(
    () => Filter.getFilterWithOutDisabledUser(),
    []
  );

  const onKeyPress = (e) => {
    if (e.key === "Esc" || e.key === "Escape") onClose();
  };

  useEffect(() => {
    window.addEventListener("keyup", onKeyPress);

    return () => window.removeEventListener("keyup", onKeyPress);
  });

  const onClosePanels = () => {
    onClose();
    onParentPanelClose();
  };

  const onUsersSelect = (users, access) => {
    const items = [];

    for (let item of users) {
      const currentAccess =
        item.isOwner || item.isAdmin
          ? ShareAccessRights.RoomManager
          : access.access;

      const newItem = {
        access: currentAccess,
        email: item.email,
        id: item.id,
        displayName: item.label,
        avatar: item.avatar,
        isOwner: item.isOwner,
        isAdmin: item.isAdmin,
      };
      items.push(newItem);
    }

    if (users.length > items.length)
      toastr.warning("Some users are already in room");

    setDataItems(items);
    onClose();
  };

  const selectedAccess = accessOptions.filter(
    (access) => access.access === accessRight
  )[0];

  const [itemsList, setItemsList] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isNextPageLoading, setIsNextPageLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useLoadingWithTimeout(
    LOADER_TIMEOUT,
    false
  );
  const [isLoadingSearch, setIsLoadingSearch] = useLoadingWithTimeout(
    LOADER_TIMEOUT,
    false
  );

  useEffect(() => {
    loadNextPage(0);
  }, []);

  const onSearch = (value, callback) => {
    if (value === searchValue) return;

    setIsLoadingSearch(true);
    setSearchValue(value);
    loadNextPage(0, value, callback);
  };

  const onClearSearch = (callback) => {
    onSearch("", callback);
  };

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
    };
  };

  const loadNextPage = (startIndex, search = searchValue, callback) => {
    const pageCount = 100;

    setIsNextPageLoading(true);

    if (startIndex === 0) {
      setIsLoading(true);
    }

    const currentFilter = getFilterWithOutDisabledUser();

    currentFilter.page = startIndex / pageCount;
    currentFilter.pageCount = pageCount;
    currentFilter.excludeShared = true;

    if (!!search.length) {
      currentFilter.search = search;
    }

    getMembersList(roomId, currentFilter)
      .then((response) => {
        let newItems = startIndex ? itemsList : [];
        let totalDifferent = startIndex ? response.total - total : 0;

        const items = response.items.map((item) => toListItem(item));

        newItems = [...newItems, ...items];

        const newTotal = response.total - totalDifferent;

        setHasNextPage(newItems.length < newTotal);
        setItemsList(newItems);
        setTotal(newTotal);

        setIsNextPageLoading(false);
      })
      .catch((error) => console.log(error))
      .finally(() => {
        callback?.();
        setIsLoading(false);
        setIsLoadingSearch(false);
      });
  };

  const emptyScreenImage = theme.isBase
    ? EmptyScreenPersonsSvgUrl
    : EmptyScreenPersonsSvgDarkUrl;

  const renderCustomItem = (label, userType, email) => {
    return (
      <div style={{ width: "100%" }}>
        <Text
          className="label"
          fontWeight={600}
          fontSize="14px"
          noSelect
          truncate
          dir="auto"
        >
          {label}
        </Text>
        <div style={{ display: "flex" }}>
          <Text
            className="label"
            fontWeight={400}
            fontSize="12px"
            noSelect
            truncate
            color="#A3A9AE"
            dir="auto"
          >
            {`${firstLetterToUppercase(userType)} | ${email}`}
          </Text>
        </div>
      </div>
    );
  };

  return (
    <>
      <Backdrop
        onClick={onClosePanels}
        visible={visible}
        zIndex={310}
        isAside={true}
        withoutBackground={withoutBackground}
        withoutBlur={!withBlur}
      />
      <Aside
        className="header_aside-panel"
        visible={visible}
        onClose={onClosePanels}
        withoutBodyScroll
      >
        <Selector
          headerLabel={t("PeopleSelector:ListAccounts")}
          onBackClick={onBackClick}
          renderCustomItem={renderCustomItem}
          searchPlaceholder={t("Common:Search")}
          searchValue={searchValue}
          onSearch={onSearch}
          onClearSearch={onClearSearch}
          items={itemsList}
          isMultiSelect={isMultiSelect}
          acceptButtonLabel={t("Common:AddButton")}
          onAccept={onUsersSelect}
          withSelectAll={isMultiSelect}
          selectAllLabel={t("PeopleSelector:AllAccounts")}
          selectAllIcon={CatalogAccountsReactSvgUrl}
          withAccessRights={isMultiSelect}
          accessRights={accessOptions}
          selectedAccessRight={selectedAccess}
          withCancelButton={!isMultiSelect}
          cancelButtonLabel={t("Common:CancelButton")}
          onCancel={onClosePanels}
          emptyScreenImage={emptyScreenImage}
          emptyScreenHeader={t("PeopleSelector:EmptyHeader")}
          emptyScreenDescription={t("PeopleSelector:EmptyDescription")}
          searchEmptyScreenImage={emptyScreenImage}
          searchEmptyScreenHeader={t("People:NotFoundUsers")}
          searchEmptyScreenDescription={t("People:NotFoundUsersDescription")}
          hasNextPage={hasNextPage}
          isNextPageLoading={isNextPageLoading}
          loadNextPage={loadNextPage}
          totalItems={total}
          isLoading={isLoading}
          searchLoader={<SearchLoader />}
          isSearchLoading={isLoading && !isLoadingSearch}
          rowLoader={
            <RowLoader
              isUser
              count={15}
              isContainer={isLoading}
              isMultiSelect={isMultiSelect}
              withAllSelect={!isLoadingSearch}
            />
          }
        />
      </Aside>
    </>
  );
};

AddUsersPanel.propTypes = {
  visible: PropTypes.bool,
  onParentPanelClose: PropTypes.func,
  onClose: PropTypes.func,
};

export default inject(({ auth }) => {
  return {
    theme: auth.settingsStore.theme,
  };
})(
  observer(
    withTranslation(["SharingPanel", "PeopleTranslations", "Common"])(
      withLoader(AddUsersPanel)(<Loaders.DialogAsideLoader isPanel />)
    )
  )
);
