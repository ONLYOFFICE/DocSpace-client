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

import { useTheme } from "styled-components";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useRef, useState } from "react";

import DefaultUserPhoto from "PUBLIC_DIR/images/default_user_photo_size_82-82.png";
import EmptyScreenPersonsSvgUrl from "PUBLIC_DIR/images/empty_screen_persons.svg?url";
import EmptyScreenPersonsSvgDarkUrl from "PUBLIC_DIR/images/empty_screen_persons_dark.svg?url";

import { Aside } from "@docspace/shared/components/aside";
import { Backdrop } from "@docspace/shared/components/backdrop";
import {
  Selector,
  SelectorAccessRightsMode,
  TSelectorItem,
} from "@docspace/shared/components/selector";
import {
  TAccessRight,
  TSelectorAccessRights,
  TSelectorCancelButton,
  TSelectorTabs,
} from "@docspace/shared/components/selector/Selector.types";
import { toastr } from "@docspace/shared/components/toast";
import { Text } from "@docspace/shared/components/text";
import useLoadingWithTimeout from "@docspace/shared/hooks/useLoadingWithTimeout";
import { getUserType } from "@docspace/shared/utils/common";
import Filter from "@docspace/shared/api/people/filter";
import { getMembersList, getUserList } from "@docspace/shared/api/people";
import {
  AccountsSearchArea,
  EmployeeStatus,
  ShareAccessRights,
} from "@docspace/shared/enums";
import { RowLoader, SearchLoader } from "@docspace/shared/skeletons/selector";
import { TUser } from "@docspace/shared/api/people/types";
import { TGroup } from "@docspace/shared/api/groups/types";
import { MIN_LOADER_TIMER } from "@docspace/shared/selectors/Files/FilesSelector.constants";
import { TTranslation } from "@docspace/shared/types";
import { Box } from "@docspace/shared/components/box";

import { StyledSendClockIcon } from "SRC_DIR/components/Icons";

const PEOPLE_TAB_ID = "0";
const GROUP_TAB_ID = "1";

const toListItem = (
  item: TUser | TGroup,
  t: TTranslation,
  invitedUsers?: string[],
  disableDisabledUsers?: boolean,
  isRoom?: boolean,
  checkIfUserInvited?: (user: TUser) => void,
) => {
  if ("displayName" in item) {
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
      isRoomAdmin,
      status,
      shared,
      groups,
    } = item;

    const role = getUserType(item);

    const userAvatar = hasAvatar ? avatar : DefaultUserPhoto;

    const isInvited = checkIfUserInvited
      ? checkIfUserInvited(item)
      : invitedUsers?.includes(id) || (isRoom && shared);

    const isDisabled =
      disableDisabledUsers && status === EmployeeStatus.Disabled;

    const disabledText = isInvited
      ? t("Common:Invited")
      : isDisabled
        ? t("Common:Disabled")
        : "";

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
      isRoomAdmin,
      isDisabled: isInvited || isDisabled,
      status,
      disabledText,
      groups,
    } as TSelectorItem;
  }

  const {
    id,

    isGroup,
    name: groupName,
    shared,
  } = item;

  const isInvited = invitedUsers?.includes(id) || (isRoom && shared);
  const disabledText = isInvited ? t("Common:Invited") : "";
  const userAvatar = "";

  return {
    id,
    name: groupName,
    avatar: userAvatar,
    isGroup,
    label: groupName,
    disabledText,
    isDisabled: isInvited,
  } as TSelectorItem;
};

type AddUsersPanelProps = {
  isEncrypted: boolean;
  defaultAccess: ShareAccessRights;
  onClose: () => void;
  onParentPanelClose: () => void;

  setDataItems: (items: TSelectorItem[]) => void;

  visible: boolean;

  withAccessRights?: boolean;
  accessOptions: TAccessRight[];
  isMultiSelect: boolean;

  withoutBackground: boolean;
  withBlur: boolean;

  invitedUsers?: string[];
  disableDisabledUsers?: boolean;
  checkIfUserInvited?: (user: TUser) => boolean;

  roomId?: string | number;
  withGroups?: boolean;
  useAside?: boolean;
};

const AddUsersPanel = ({
  isEncrypted,
  defaultAccess,
  onClose,
  onParentPanelClose,

  setDataItems,

  visible,

  withAccessRights,
  accessOptions,
  isMultiSelect,

  withoutBackground,
  withBlur,
  roomId,

  withGroups,

  invitedUsers,
  disableDisabledUsers,
  checkIfUserInvited,
  useAside = true,
}: AddUsersPanelProps) => {
  const theme = useTheme();
  const { t } = useTranslation([
    "SharingPanel",
    "PeopleTranslations",
    "Common",
    "InviteDialog",
    "People",
  ]);

  const isFirstLoad = useRef(true);
  const [isInit, setIsInit] = useState(true);
  const [isLoading, setIsLoading] = useLoadingWithTimeout<boolean>(0, true);
  const [activeTabId, setActiveTabId] = useState<string>(PEOPLE_TAB_ID);
  const [selectedItems, setSelectedItems] = useState<TSelectorItem[]>([]);

  const [itemsList, setItemsList] = useState<TSelectorItem[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isNextPageLoading, setIsNextPageLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const totalRef = useRef(0);

  const onSelect = (
    item: TSelectorItem,
    isDoubleClick: boolean,
    doubleClickCallback: () => void,
  ) => {
    setSelectedItems((items) => {
      const includeFile = items.find((el) => el.id === item.id);

      if (includeFile)
        return isMultiSelect
          ? items.filter((el) => el.id !== includeFile.id)
          : [];

      return isMultiSelect ? [...items, item] : [item];
    });
    if (isDoubleClick && !isMultiSelect) {
      doubleClickCallback();
    }
  };

  const accessRight =
    defaultAccess ||
    (isEncrypted ? ShareAccessRights.FullAccess : ShareAccessRights.ReadOnly);

  const onBackClick = () => onClose();

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
      const currentAccess = access?.access;

      const newItem = {
        access: currentAccess,
        email: user.email,
        id: user.id,
        hasAvatar: user.hasAvatar || false,

        avatar: user.avatar,
      } as TSelectorItem;

      if (user.isGroup) {
        newItem.isGroup = user.isGroup;
        newItem.name = user.label;
      } else {
        newItem.displayName = user.label;
        newItem.isOwner = user.isOwner;
        newItem.isAdmin = user.isAdmin;
        newItem.isVisitor = user.isVisitor;
        newItem.isCollaborator = user.isCollaborator;
        newItem.isRoomAdmin = user.isRoomAdmin;
        newItem.email = user.email;
        newItem.groups = user.groups;
        newItem.status = user.status;
      }

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

  const changeActiveTab = useCallback((tab: number | string) => {
    setActiveTabId(`${tab}`);
    isFirstLoad.current = true;
  }, []);

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
      setSearchValue((prevValue: string) => {
        if (prevValue !== "") {
          setIsLoading(true);
        }

        return "";
      });
      callback?.();
    },
    [setIsLoading],
  );

  const loadNextPage = useCallback(
    async (startIndex: number) => {
      const pageCount = 100;

      const startLoadingTime = new Date();

      let searchArea = AccountsSearchArea.People;

      if (withGroups) {
        searchArea =
          activeTabId === PEOPLE_TAB_ID
            ? AccountsSearchArea.People
            : AccountsSearchArea.Groups;
      }

      setIsNextPageLoading(true);

      const currentFilter = Filter.getDefault();

      currentFilter.page = startIndex / pageCount;
      currentFilter.pageCount = pageCount;

      // show all users, but disabled invited
      // currentFilter.excludeShared = true;
      currentFilter.search = searchValue || "";

      const response = !roomId
        ? await getUserList(currentFilter)
        : await getMembersList(searchArea, roomId, currentFilter);

      const totalDifferent = startIndex ? response.total - totalRef.current : 0;

      const items = response.items.map((item) =>
        toListItem(
          item,
          t,
          invitedUsers,
          disableDisabledUsers,
          !!roomId,
          checkIfUserInvited,
        ),
      );
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

      const nowDate = new Date();
      const diff = Math.abs(nowDate.getTime() - startLoadingTime.getTime());

      if (diff < MIN_LOADER_TIMER) {
        setTimeout(() => {
          setIsLoading(false);
        }, MIN_LOADER_TIMER - diff);
      } else {
        setIsLoading(false);
      }

      setIsInit(false);
      isFirstLoad.current = false;
    },
    [
      activeTabId,
      disableDisabledUsers,
      invitedUsers,
      roomId,
      searchValue,
      setIsLoading,
      t,
      withGroups,
    ],
  );

  const emptyScreenImage = theme.isBase
    ? EmptyScreenPersonsSvgUrl
    : EmptyScreenPersonsSvgDarkUrl;

  const renderCustomItem = (
    label: string,
    userType?: string,
    email?: string,
    isGroup?: boolean,
    status?: EmployeeStatus,
  ) => {
    return (
      <div
        style={{
          width: "100%",
          overflow: "hidden",
          marginInlineEnd: "16px",
        }}
      >
        <Box displayProp="flex" alignItems="center" gapProp="8px">
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
          {status === EmployeeStatus.Pending && <StyledSendClockIcon />}
        </Box>
        {!isGroup && (
          <div style={{ display: "flex" }}>
            <Text
              className="label"
              fontWeight={400}
              fontSize="12px"
              noSelect
              truncate
              color={theme.filesPanels.addUsers.textColor}
              dir="auto"
            >
              {`${userType} | ${email}`}
            </Text>
          </div>
        )}
      </div>
    );
  };

  const withAccessRightsProps: TSelectorAccessRights =
    withAccessRights && isMultiSelect
      ? {
          withAccessRights: isMultiSelect,
          accessRights: accessOptions,
          selectedAccessRight: selectedAccess,
          onAccessRightsChange: () => {},
          accessRightsMode: SelectorAccessRightsMode.Detailed,
        }
      : {};

  const withCancelButtonProps: TSelectorCancelButton = !isMultiSelect
    ? {
        withCancelButton: !isMultiSelect,
        cancelButtonLabel: t("Common:CancelButton"),
        onCancel: onClosePanels,
      }
    : {};

  const withTabsProps: TSelectorTabs = withGroups
    ? {
        withTabs: true,
        tabsData: [
          {
            id: PEOPLE_TAB_ID,
            name: t("Common:People"),
            onClick: () => changeActiveTab(PEOPLE_TAB_ID),
            content: null,
          },
          {
            id: GROUP_TAB_ID,
            name: t("Common:Groups"),
            onClick: () => changeActiveTab(GROUP_TAB_ID),
            content: null,
          },
        ],
        activeTabId,
      }
    : {};

  const selectorComponent = (
    <Selector
      withHeader
      alwaysShowFooter={itemsList.length !== 0 || Boolean(searchValue)}
      headerProps={{
        // Todo: Update groups empty screen texts when they are ready
        headerLabel: t("Common:ListAccounts"),
        withoutBackButton: false,
        withoutBorder: true,
        onBackClick,
        onCloseClick: onClosePanels,
      }}
      onSelect={onSelect}
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
      disableSubmitButton={selectedItems.length === 0}
      {...withAccessRightsProps}
      {...withCancelButtonProps}
      emptyScreenImage={emptyScreenImage}
      emptyScreenHeader={
        // Todo: Update groups empty screen texts when they are ready
        activeTabId === PEOPLE_TAB_ID
          ? t("Common:EmptyHeader")
          : t("Common:NotFoundGroups")
      }
      emptyScreenDescription={
        activeTabId === PEOPLE_TAB_ID
          ? t("Common:EmptyDescription", {
              productName: t("Common:ProductName"),
            })
          : t("Common:GroupsNotFoundDescription")
      }
      searchEmptyScreenImage={emptyScreenImage}
      searchEmptyScreenHeader={
        activeTabId === PEOPLE_TAB_ID
          ? t("Common:NotFoundUsers")
          : t("Common:NotFoundGroups")
      }
      searchEmptyScreenDescription={
        activeTabId === PEOPLE_TAB_ID
          ? t("Common:NotFoundUsersDescription")
          : t("Common:GroupsNotFoundDescription")
      }
      hasNextPage={hasNextPage}
      isNextPageLoading={isNextPageLoading}
      loadNextPage={loadNextPage}
      totalItems={total}
      isLoading={isLoading}
      searchLoader={<SearchLoader />}
      isSearchLoading={isInit}
      rowLoader={
        <RowLoader
          style={{ paddingInlineEnd: 0 }}
          isUser
          count={15}
          isContainer={isLoading}
          isMultiSelect={isMultiSelect}
          withAllSelect={!isLoading}
        />
      }
      {...withTabsProps}
    />
  );

  return useAside ? (
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
        withoutHeader
      >
        {selectorComponent}
      </Aside>
    </>
  ) : (
    selectorComponent
  );
};

export default AddUsersPanel;
