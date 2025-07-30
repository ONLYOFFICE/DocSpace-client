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

import axios from "axios";
import React, { useState, useCallback, useRef, useEffect } from "react";
import { useTheme } from "styled-components";
import { useTranslation } from "react-i18next";

import DefaultUserPhoto from "PUBLIC_DIR/images/default_user_photo_size_82-82.png";
import EmptyScreenPersonsSvgUrl from "PUBLIC_DIR/images/empty_screen_persons.svg?url";
import EmptyScreenPersonsSvgDarkUrl from "PUBLIC_DIR/images/empty_screen_persons_dark.svg?url";

import { Selector, SelectorAccessRightsMode } from "../../components/selector";
import {
  TSelectorAccessRights,
  TSelectorCancelButton,
  TSelectorCheckbox,
  TSelectorHeader,
  TSelectorInfo,
  TSelectorItem,
  TSelectorSearch,
  TSelectorTabs,
  TSelectorWithAside,
} from "../../components/selector/Selector.types";
import { AccountsSearchArea, EmployeeStatus } from "../../enums";
import { TTranslation } from "../../types";
import { getUserAvatarRoleByType, getUserType } from "../../utils/common";
import Filter from "../../api/people/filter";
import { getMembersList, getUserList } from "../../api/people";
import { TUser } from "../../api/people/types";
import { TGroup } from "../../api/groups/types";
import { RowLoader, SearchLoader } from "../../skeletons/selector";
import { Text } from "../../components/text";
import { globalColors } from "../../themes";
import { isNextImage } from "../../utils/typeGuards";
import { toastr } from "../../components/toast";

import { PeopleSelectorProps } from "./PeopleSelector.types";
import StyledSendClockIcon from "./components/SendClockIcon";

const PEOPLE_TAB_ID = "0";
const GROUP_TAB_ID = "1";
const GUESTS_TAB_ID = "2";

const toListItem = (
  item: TUser | TGroup,
  t: TTranslation,
  disableDisabledUsers?: boolean,
  disableInvitedUsers?: string[],
  isRoom?: boolean,
  checkIfUserInvited?: (user: TUser) => void,
): TSelectorItem => {
  if ("displayName" in item) {
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
      isRoomAdmin,
      status,
      shared,
      groups,
      access,
    } = item;

    const role = getUserType(item);

    const defaultUserPhotoURL = isNextImage(DefaultUserPhoto)
      ? DefaultUserPhoto.src
      : DefaultUserPhoto;

    const userAvatar = hasAvatar ? avatar : defaultUserPhotoURL;

    const isInvited = checkIfUserInvited
      ? checkIfUserInvited(item)
      : disableInvitedUsers?.includes(userId) || (isRoom && shared);

    const isDisabled =
      disableDisabledUsers && status === EmployeeStatus.Disabled;

    const disabledText = isInvited
      ? t("Common:Invited")
      : isDisabled
        ? t("Common:Disabled")
        : "";

    const avatarRole = getUserAvatarRoleByType(role);

    const i: TSelectorItem = {
      id: userId,
      email,
      avatar: userAvatar,
      label: displayName || email,
      displayName: displayName || email,
      role: avatarRole,
      userType: role,
      isOwner,
      isAdmin,
      isVisitor,
      isCollaborator,
      isRoomAdmin,
      hasAvatar,
      isDisabled: isInvited || isDisabled,
      disabledText,
      status,
      groups,
      access,
    };

    return i;
  }

  const {
    id,

    name: groupName,
    shared,
  } = item;

  const isInvited = disableInvitedUsers?.includes(id) || (isRoom && shared);
  const disabledText = isInvited ? t("Common:Invited") : "";

  return {
    id,
    name: groupName,
    isGroup: true,
    label: groupName,
    disabledText,
    isDisabled: isInvited,
  };
};

const PeopleSelector = ({
  submitButtonLabel,
  submitButtonId,
  disableSubmitButton,
  onSubmit,

  id,
  className,
  style,

  withCancelButton,
  cancelButtonLabel,
  onCancel,

  filter,

  excludeItems,

  filterUserId,
  currentUserId,

  // Accessibility attributes
  "aria-label": ariaLabel,
  "data-selector-type": dataSelectorType,
  "data-test-id": dataTestId,
  withOutCurrentAuthorizedUser,

  withFooterCheckbox,
  footerCheckboxLabel,
  isChecked,

  withHeader,
  headerProps,

  disableDisabledUsers,
  disableInvitedUsers,
  isMultiSelect,

  withInfo,
  infoText,

  emptyScreenHeader,
  emptyScreenDescription,

  roomId,

  checkIfUserInvited,

  withGroups,
  isGroupsOnly,

  withGuests,
  isGuestsOnly,

  withAccessRights,
  accessRights,
  selectedAccessRight,
  onAccessRightsChange,
  accessRightsMode,

  useAside,
  onClose,
  withoutBackground,
  withBlur,
  setActiveTab,
  injectedElement,
  alwaysShowFooter = false,
  onlyRoomMembers,
}: PeopleSelectorProps) => {
  const { t }: { t: TTranslation } = useTranslation(["Common"]);

  const theme = useTheme();

  const [activeTabId, setActiveTabId] = useState<string>(
    isGuestsOnly ? GUESTS_TAB_ID : isGroupsOnly ? GROUP_TAB_ID : PEOPLE_TAB_ID,
  );

  const [itemsList, setItemsList] = useState<TSelectorItem[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [total, setTotal] = useState<number>(-1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isNextPageLoading, setIsNextPageLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<TSelectorItem[]>([]);
  const isFirstLoadRef = useRef(true);
  const afterSearch = useRef(false);
  const totalRef = useRef(0);
  const searchTab = useRef(PEOPLE_TAB_ID);
  const abortControllerRef = useRef(new AbortController());

  useEffect(() => () => abortControllerRef.current.abort(), []);

  const onSelect = (
    item: TSelectorItem,
    isDoubleClick: boolean,
    doubleClickCallback: () => void,
  ) => {
    setSelectedItems((prevItems) => {
      if (!isMultiSelect) {
        return item.isSelected ? [] : [item];
      }

      return item.isSelected
        ? prevItems.filter((p) => p.id !== item.id)
        : [...prevItems, item];
    });
    if (isDoubleClick) {
      doubleClickCallback();
    }
  };

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
      try {
        if (searchTab.current !== activeTabId && searchValue) {
          setSearchValue("");
          searchTab.current = activeTabId;
          return;
        }
        const pageCount = 100;

        setIsNextPageLoading(true);

        let searchArea = AccountsSearchArea.People;

        if (withGroups || withGuests) {
          searchArea =
            activeTabId !== GROUP_TAB_ID
              ? AccountsSearchArea.People
              : AccountsSearchArea.Groups;
        }

        const currentFilter: Filter =
          typeof filter === "function"
            ? filter()
            : (filter ?? Filter.getDefault());

        currentFilter.page = startIndex / pageCount;
        currentFilter.pageCount = pageCount;

        currentFilter.search = searchValue || "";

        if (activeTabId === GUESTS_TAB_ID) {
          currentFilter.area = "guests";
        } else if (activeTabId === PEOPLE_TAB_ID) {
          currentFilter.area = "people";
        }

        if (onlyRoomMembers) {
          currentFilter.includeShared = true;
        }

        abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();

        const response = !roomId
          ? await getUserList(currentFilter, abortControllerRef.current?.signal)
          : await getMembersList(
              searchArea,
              roomId,
              currentFilter,
              abortControllerRef.current?.signal,
            );

        let totalDifferent = startIndex ? response.total - totalRef.current : 0;

        const data = response.items
          .filter((item) => {
            if (excludeItems && excludeItems.includes(item.id)) {
              totalDifferent += 1;
              return false;
            }
            return true;
          })
          .map((item) =>
            toListItem(
              item,
              t,
              disableDisabledUsers,
              disableInvitedUsers,
              !!roomId,
              checkIfUserInvited,
            ),
          );

        const newTotal = withOutCurrentAuthorizedUser
          ? response.total - totalDifferent - 1
          : response.total - totalDifferent;

        if (isFirstLoadRef.current) {
          const newItems = withOutCurrentAuthorizedUser
            ? removeCurrentUserFromList(data)
            : moveCurrentUserToTopOfList(data);

          setHasNextPage(newItems.length < newTotal);
          setItemsList(newItems);
        } else {
          setItemsList((i) => {
            const tempItems = [...i, ...data];

            const ids = new Set();
            const filteredTempItems = tempItems.filter(
              (item) => !ids.has(item.id) && ids.add(item.id),
            );

            const newItems = withOutCurrentAuthorizedUser
              ? removeCurrentUserFromList(filteredTempItems)
              : moveCurrentUserToTopOfList(filteredTempItems);

            setHasNextPage(newItems.length < newTotal);

            return newItems;
          });
        }

        setTotal(newTotal);
        totalRef.current = newTotal;

        setIsNextPageLoading(false);
        isFirstLoadRef.current = false;
      } catch (error) {
        if (axios.isCancel(error)) return;

        console.error(error);
        toastr.error(error as Error);
      }
    },
    [
      activeTabId,
      checkIfUserInvited,
      disableDisabledUsers,
      disableInvitedUsers,
      excludeItems,
      filter,
      moveCurrentUserToTopOfList,
      removeCurrentUserFromList,
      roomId,
      searchValue,
      t,
      withGroups,
      withGuests,
      withOutCurrentAuthorizedUser,
      onlyRoomMembers,
    ],
  );

  const resetSelectorList = useCallback(() => {
    setItemsList([]);
    setHasNextPage(true);
    setTotal(-1);
    totalRef.current = 0;
    isFirstLoadRef.current = true;
  }, []);

  const onSearch = useCallback(
    (value: string, callback?: VoidFunction) => {
      afterSearch.current = true;
      searchTab.current = activeTabId;
      resetSelectorList();

      setSearchValue(() => {
        return value;
      });
      callback?.();
    },
    [activeTabId, resetSelectorList],
  );

  const onClearSearch = useCallback(
    (callback?: VoidFunction) => {
      afterSearch.current = true;
      resetSelectorList();
      setSearchValue(() => {
        return "";
      });
      callback?.();
    },
    [resetSelectorList],
  );

  const emptyScreenImage = theme.isBase
    ? EmptyScreenPersonsSvgUrl
    : EmptyScreenPersonsSvgDarkUrl;

  const headerSelectorProps: TSelectorHeader = withHeader
    ? {
        withHeader,
        headerProps: {
          ...headerProps,
          headerLabel: headerProps.headerLabel || t("Common:Contacts"),
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
    isSearchLoading:
      isFirstLoadRef.current && !searchValue && !afterSearch.current,
  };

  const infoProps: TSelectorInfo = withInfo
    ? {
        withInfo,
        infoText,
      }
    : {};

  const checkboxSelectorProps: TSelectorCheckbox = withFooterCheckbox
    ? {
        withFooterCheckbox,
        footerCheckboxLabel,
        isChecked,
      }
    : {};

  const renderCustomItem = (
    label: string,
    userType?: string,
    email?: string,
    isGroup?: boolean,
    status?: EmployeeStatus,
  ) => {
    return (
      <div
        style={{ width: "100%", overflow: "hidden", marginInlineEnd: "16px" }}
        aria-label={`${isGroup ? "Group" : "User"}: ${label}${email ? `, ${email}` : ""}`}
      >
        <div
          style={{
            display: "flex",
            boxSizing: "border-box",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Text
            className="selector-item_label"
            fontWeight={600}
            fontSize="14px"
            noSelect
            truncate
            title={label}
            aria-label={label}
            dir="auto"
          >
            {label}
          </Text>
          {status === EmployeeStatus.Pending ? <StyledSendClockIcon /> : null}
        </div>
        {!isGroup ? (
          <div style={{ display: "flex" }}>
            <Text
              className="selector-item_label"
              fontWeight={400}
              fontSize="12px"
              noSelect
              truncate
              color={globalColors.gray}
              dir="auto"
            >
              {`${userType} | ${email}`}
            </Text>
          </div>
        ) : null}
      </div>
    );
  };

  const changeActiveTab = useCallback(
    (tab: number | string) => {
      if (setActiveTab) setActiveTab(`${tab}`);
      setActiveTabId(`${tab}`);
      onSearch("");
      resetSelectorList();
    },
    [onSearch, resetSelectorList, setActiveTab],
  );

  const withTabsProps: TSelectorTabs =
    (withGroups || withGuests) && !isGroupsOnly && !isGuestsOnly
      ? {
          withTabs: true,
          tabsData: [
            {
              id: PEOPLE_TAB_ID,
              name: t("Common:Members"),
              onClick: () => changeActiveTab(PEOPLE_TAB_ID),
              content: null,
            },
            ...[
              withGroups && {
                id: GROUP_TAB_ID,
                name: t("Common:Groups"),
                onClick: () => changeActiveTab(GROUP_TAB_ID),
                content: null,
              },
            ],
            ...[
              withGuests && {
                id: GUESTS_TAB_ID,
                name: t("Common:Guests"),
                onClick: () => changeActiveTab(GUESTS_TAB_ID),
                content: null,
              },
            ],
          ].filter((i) => !!i),
          activeTabId,
        }
      : {};

  const withAccessRightsProps: TSelectorAccessRights =
    withAccessRights && isMultiSelect
      ? {
          withAccessRights: true,
          accessRights,
          selectedAccessRight,
          onAccessRightsChange,
          accessRightsMode:
            accessRightsMode ?? SelectorAccessRightsMode.Detailed,
        }
      : {};

  const withAside: TSelectorWithAside = useAside
    ? { useAside, onClose, withBlur, withoutBackground }
    : {};

  return (
    <Selector
      {...headerSelectorProps}
      {...searchSelectorProps}
      {...checkboxSelectorProps}
      {...cancelButtonSelectorProps}
      {...infoProps}
      {...withTabsProps}
      {...withAccessRightsProps}
      {...withAside}
      id={id}
      injectedElement={injectedElement}
      alwaysShowFooter={
        itemsList.length !== 0 || Boolean(searchValue) || alwaysShowFooter
      }
      className={className}
      style={style}
      renderCustomItem={renderCustomItem}
      aria-label={ariaLabel || "People Selector"}
      data-selector-type={dataSelectorType || "people"}
      dataTestId={dataTestId || "people-selector"}
      items={itemsList}
      submitButtonLabel={submitButtonLabel || t("Common:SelectAction")}
      onSubmit={onSubmit}
      disableSubmitButton={disableSubmitButton || !selectedItems.length}
      selectedItem={isMultiSelect ? null : selectedItems[0]}
      submitButtonId={submitButtonId}
      emptyScreenImage={emptyScreenImage}
      emptyScreenHeader={
        emptyScreenHeader ??
        (activeTabId === GUESTS_TAB_ID
          ? t("Common:NotFoundGuests")
          : activeTabId === PEOPLE_TAB_ID
            ? t("Common:EmptyHeader")
            : t("Common:NotFoundGroups"))
      }
      emptyScreenDescription={
        emptyScreenDescription ??
        (activeTabId === GUESTS_TAB_ID
          ? t("Common:NotFoundGuestsDescription")
          : activeTabId === PEOPLE_TAB_ID
            ? t("Common:EmptyDescription", {
                productName: t("Common:ProductName"),
              })
            : t("Common:GroupsNotFoundDescription"))
      }
      searchEmptyScreenImage={emptyScreenImage}
      searchEmptyScreenHeader={
        activeTabId === GUESTS_TAB_ID
          ? t("Common:NotFoundGuestsFilter")
          : activeTabId === PEOPLE_TAB_ID
            ? t("Common:NotFoundMembers")
            : t("Common:NotFoundGroups")
      }
      searchEmptyScreenDescription={
        activeTabId === GUESTS_TAB_ID
          ? t("Common:NotFoundFilterGuestsDescription")
          : activeTabId === PEOPLE_TAB_ID
            ? t("Common:NotFoundUsersDescription")
            : t("Common:GroupsNotFoundDescription")
      }
      hasNextPage={hasNextPage}
      isNextPageLoading={isNextPageLoading}
      loadNextPage={loadNextPage}
      isMultiSelect={isMultiSelect ?? false}
      totalItems={total}
      isLoading={isFirstLoadRef.current}
      rowLoader={
        <RowLoader
          isUser
          isContainer={isFirstLoadRef.current}
          isMultiSelect={isMultiSelect}
        />
      }
      onSelect={onSelect}
    />
  );
};

export default PeopleSelector;
