import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import React, { useState, useEffect, useCallback } from "react";

import { Aside } from "@docspace/shared/components/aside";
import { Backdrop } from "@docspace/shared/components/backdrop";
import { Selector } from "@docspace/shared/components/selector";
import { toastr } from "@docspace/shared/components/toast";

import { getUserRole } from "@docspace/common/utils";
import Filter from "@docspace/shared/api/people/filter";
import Loaders from "@docspace/common/components/Loaders";
import { getMembersList } from "@docspace/shared/api/people";
import useLoadingWithTimeout from "SRC_DIR/Hooks/useLoadingWithTimeout";
import { ShareAccessRights, LOADER_TIMEOUT } from "@docspace/shared/constants";
import withLoader from "../../../HOCs/withLoader";
import DefaultUserPhoto from "PUBLIC_DIR/images/default_user_photo_size_82-82.png";

import EmptyScreenPersonsSvgUrl from "PUBLIC_DIR/images/empty_screen_persons.svg?url";
import CatalogAccountsReactSvgUrl from "PUBLIC_DIR/images/catalog.accounts.react.svg?url";
import EmptyScreenPersonsSvgDarkUrl from "PUBLIC_DIR/images/empty_screen_persons_dark.svg?url";
import { getAccessOptions } from "../InvitePanel/utils";
import { AccountsSearchArea } from "@docspace/shared/enums";

interface AddGroupManagerPanelProps {
  t: any;
  theme: any;
  visible: boolean;
  onClosePanels: () => void;
  onBackClick: () => void;
}

const AddGroupManagerPanel = ({
  t,
  theme,
  visible,
  onClosePanels,
  onBackClick,
}: AddGroupManagerPanelProps) => {
  const [total, setTotal] = useState(0);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);

  const [searchValue, setSearchValue] = useState<string>("");

  const [isLoading, setIsLoading] = useLoadingWithTimeout(
    LOADER_TIMEOUT,
    false,
  );
  const [isLoadingSearch, setIsLoadingSearch] = useLoadingWithTimeout(
    LOADER_TIMEOUT,
    false,
  );
  const [isLoadingNextPage, setIsLoadingNextPage] = useState<boolean>(false);

  const accessOptions = getAccessOptions(t);
  const selectedAccess = accessOptions.filter(
    (access) => access.access === ShareAccessRights.FullAccess,
  )[0];

  const onSearch = (value: string, callback) => {
    if (value === searchValue) return;

    setIsLoadingSearch(true);
    setSearchValue(value);
    onLoadNextPage(0, value, callback);
  };

  const onClearSearch = (callback) => onSearch("", callback);

  const onLoadNextPage = (
    startIndex: number,
    search = searchValue,
    callback,
  ) => {
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

    getMembersList(AccountsSearchArea.People, roomId, currentFilter)
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

  useEffect(() => {
    onLoadNextPage(0);
  }, []);

  const onAccept = () => {};

  return (
    <>
      <Backdrop
        onClick={onClosePanels}
        visible={visible}
        zIndex={310}
        isAside={true}
        withoutBackground={true}
        withoutBlur={true}
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
          searchPlaceholder={t("Common:Search")}
          searchValue={searchValue}
          onSearch={onSearch}
          onClearSearch={onClearSearch}
          items={itemsList}
          isMultiSelect={false}
          acceptButtonLabel={t("Common:AddButton")}
          onAccept={onAccept}
          withSelectAll={false}
          selectAllLabel={t("PeopleSelector:AllAccounts")}
          selectAllIcon={CatalogAccountsReactSvgUrl}
          withAccessRights={false}
          accessRights={accessOptions}
          selectedAccessRight={selectedAccess}
          withCancelButton={true}
          cancelButtonLabel={t("Common:CancelButton")}
          onCancel={onClosePanels}
          emptyScreenImage={
            theme.isBase
              ? EmptyScreenPersonsSvgUrl
              : EmptyScreenPersonsSvgDarkUrl
          }
          emptyScreenHeader={t("PeopleSelector:EmptyHeader")}
          emptyScreenDescription={t("PeopleSelector:EmptyDescription")}
          searchEmptyScreenImage={
            theme.isBase
              ? EmptyScreenPersonsSvgUrl
              : EmptyScreenPersonsSvgDarkUrl
          }
          searchEmptyScreenHeader={t("People:NotFoundUsers")}
          searchEmptyScreenDescription={t("People:NotFoundUsersDescription")}
          hasNextPage={hasNextPage}
          isNextPageLoading={isLoadingNextPage}
          loadNextPage={onLoadNextPage}
          totalItems={total}
          isLoading={isLoading}
          searchLoader={<Loaders.SelectorSearchLoader />}
          isSearchLoading={isLoading && !isLoadingSearch}
          rowLoader={
            <Loaders.SelectorRowLoader
              isUser
              count={15}
              isContainer={isLoading}
              isMultiSelect={false}
              withAllSelect={!isLoadingSearch}
            />
          }
        />
      </Aside>
    </>
  );
};

export default inject(({ auth }) => ({
  theme: auth.settingsStore.theme,
}))(
  observer(
    withTranslation(["SharingPanel", "PeopleTranslations", "Common"])(
      withLoader(AddGroupManagerPanel)(<Loaders.DialogAsideLoader isPanel />),
    ),
  ),
);
