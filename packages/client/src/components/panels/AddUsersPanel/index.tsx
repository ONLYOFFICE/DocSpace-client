import { useTheme } from "styled-components";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useCallback, useRef } from "react";
import { capitalize } from "lodash";

import DefaultUserPhoto from "PUBLIC_DIR/images/default_user_photo_size_82-82.png";
import EmptyScreenPersonsSvgUrl from "PUBLIC_DIR/images/empty_screen_persons.svg?url";
import CatalogAccountsReactSvgUrl from "PUBLIC_DIR/images/catalog.accounts.react.svg?url";
import EmptyScreenPersonsSvgDarkUrl from "PUBLIC_DIR/images/empty_screen_persons_dark.svg?url";

import { Aside } from "@docspace/shared/components/aside";
import { Backdrop } from "@docspace/shared/components/backdrop";
import { Selector, TSelectorItem } from "@docspace/shared/components/selector";
import {
  TAccessRight,
  TSelectorAccessRights,
  TSelectorCancelButton,
  TSelectorSelectAll,
} from "@docspace/shared/components/selector/Selector.types";
import { toastr } from "@docspace/shared/components/toast";
import { Text } from "@docspace/shared/components/text";
import useLoadingWithTimeout from "@docspace/shared/hooks/useLoadingWithTimeout";
import { getUserRole } from "@docspace/shared/utils/common";
import Filter from "@docspace/shared/api/people/filter";
import { getMembersList } from "@docspace/shared/api/people";
import { ShareAccessRights } from "@docspace/shared/enums";
import { RowLoader, SearchLoader } from "@docspace/shared/skeletons/selector";
import { TUser } from "@docspace/shared/api/people/types";

const toListItem = (item: TUser) => {
  const {
    id,
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

  return {
    id,
    email,
    avatar: userAvatar,

    label: displayName || email,
    role,
    isOwner,
    isAdmin,
    isVisitor,
    isCollaborator,
  } as TSelectorItem;
};

type AddUsersPanelProps = {
  isEncrypted: boolean;
  defaultAccess: ShareAccessRights;
  onClose: () => void;
  onParentPanelClose: () => void;

  setDataItems: (items: TSelectorItem[]) => void;

  visible: boolean;

  accessOptions: TAccessRight[];
  isMultiSelect: boolean;

  withoutBackground: boolean;
  withBlur: boolean;
  roomId: string | number;
};

const AddUsersPanel = ({
  isEncrypted,
  defaultAccess,
  onClose,
  onParentPanelClose,

  setDataItems,

  visible,

  accessOptions,
  isMultiSelect,

  withoutBackground,
  withBlur,
  roomId,
}: AddUsersPanelProps) => {
  const theme = useTheme();
  const { t } = useTranslation([
    "SharingPanel",
    "PeopleTranslations",
    "Common",
  ]);

  const isFirstLoad = useRef(true);
  const [isInit, setIsInit] = useState(true);
  const [isLoading, setIsLoading] = useLoadingWithTimeout<boolean>(0, true);

  const accessRight =
    defaultAccess ||
    (isEncrypted ? ShareAccessRights.FullAccess : ShareAccessRights.ReadOnly);

  const onBackClick = () => onClose();
  const getFilterWithOutDisabledUser = useCallback(
    () => Filter.getFilterWithOutDisabledUser(),
    [],
  );

  const onKeyPress = (e: KeyboardEvent) => {
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

  const onUsersSelect = (
    users: TSelectorItem[],
    access: TAccessRight | null,
  ) => {
    const items: TSelectorItem[] = [];

    users.forEach((user) => {
      const currentAccess =
        user.isOwner || user.isAdmin
          ? ShareAccessRights.RoomManager
          : access?.access;

      const newItem = {
        access: currentAccess,
        email: user.email,
        id: user.id,
        hasAvatar: user.hasAvatar || false,
        displayName: user.label,
        avatar: user.avatar,
        isOwner: user.isOwner,
        isAdmin: user.isAdmin,
        isVisitor: user.isVisitor,
        isCollaborator: user.isCollaborator,
      } as TSelectorItem;

      items.push(newItem);
    });

    if (users.length > items.length)
      toastr.warning("Some users are already in room");

    setDataItems(items);
    onClose();
  };

  const selectedAccess = accessOptions.filter(
    (access) => access.access === accessRight,
  )[0];

  const [itemsList, setItemsList] = useState<TSelectorItem[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isNextPageLoading, setIsNextPageLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const totalRef = useRef(0);

  const onSearch = useCallback(
    (value: string, callback?: Function) => {
      isFirstLoad.current = true;
      setIsLoading(true);
      setSearchValue(() => {
        return value;
      });
      callback?.();
    },
    [setIsLoading],
  );

  const onClearSearch = useCallback(
    (callback?: Function) => {
      isFirstLoad.current = true;
      setIsLoading(true);
      setSearchValue(() => {
        return "";
      });
      callback?.();
    },
    [setIsLoading],
  );

  const loadNextPage = useCallback(
    async (startIndex: number) => {
      const pageCount = 100;

      setIsNextPageLoading(true);

      const currentFilter = getFilterWithOutDisabledUser();

      currentFilter.page = startIndex / pageCount;
      currentFilter.pageCount = pageCount;
      // @ts-expect-error think its ok
      currentFilter.excludeShared = true;
      currentFilter.search = searchValue || "";

      const response = await getMembersList(roomId, currentFilter);

      const totalDifferent = startIndex ? response.total - totalRef.current : 0;

      const items = response.items.map((item) => toListItem(item));

      const newTotal = response.total - totalDifferent;

      if (isFirstLoad.current) {
        setItemsList([...items]);
        setHasNextPage(items.length < newTotal);
      } else {
        setItemsList((list) => {
          const newItems = [...list, ...items];
          setHasNextPage(newItems.length < newTotal);

          return newItems;
        });
      }
      setTotal(newTotal);
      totalRef.current = newTotal;

      setIsNextPageLoading(false);
      setIsLoading(false);
      setIsInit(false);
      isFirstLoad.current = false;
    },
    [getFilterWithOutDisabledUser, roomId, searchValue, setIsLoading],
  );

  const emptyScreenImage = theme.isBase
    ? EmptyScreenPersonsSvgUrl
    : EmptyScreenPersonsSvgDarkUrl;

  const renderCustomItem = (
    label: string,
    userType?: string,
    email?: string,
  ) => {
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
            {`${capitalize(userType)} | ${email}`}
          </Text>
        </div>
      </div>
    );
  };

  const withSelectAllProps: TSelectorSelectAll = isMultiSelect
    ? {
        withSelectAll: isMultiSelect,
        selectAllLabel: t("PeopleSelector:AllAccounts"),
        selectAllIcon: CatalogAccountsReactSvgUrl,
        onSelectAll: () => {},
      }
    : {};

  const withAccessRightsProps: TSelectorAccessRights = isMultiSelect
    ? {
        withAccessRights: isMultiSelect,
        accessRights: accessOptions,
        selectedAccessRight: selectedAccess || null,
        onAccessRightsChange: () => {},
      }
    : {};

  const withCancelButtonProps: TSelectorCancelButton = !isMultiSelect
    ? {
        withCancelButton: !isMultiSelect,
        cancelButtonLabel: t("Common:CancelButton"),
        onCancel: onClosePanels,
      }
    : {};

  return (
    <>
      <Backdrop
        onClick={onClosePanels}
        visible={visible}
        zIndex={310}
        isAside
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
          withHeader
          headerProps={{
            headerLabel: t("PeopleSelector:ListAccounts"),
            withoutBackButton: false,
            onBackClick,
          }}
          renderCustomItem={renderCustomItem}
          withSearch
          searchPlaceholder={t("Common:Search")}
          searchValue={searchValue}
          onSearch={onSearch}
          onClearSearch={onClearSearch}
          items={itemsList}
          isMultiSelect={isMultiSelect}
          submitButtonLabel={t("Common:AddButton")}
          onSubmit={onUsersSelect}
          disableSubmitButton={false}
          {...withSelectAllProps}
          {...withAccessRightsProps}
          {...withCancelButtonProps}
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
          isSearchLoading={isInit}
          rowLoader={
            <RowLoader
              isUser
              count={15}
              isContainer={isLoading}
              isMultiSelect={isMultiSelect}
              withAllSelect={!isLoading}
            />
          }
        />
      </Aside>
    </>
  );
};

export default AddUsersPanel;
