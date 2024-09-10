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
  TSelectorInfo,
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
import { Text } from "../../components/text";
import { Box } from "../../components/box";

import { PeopleSelectorProps } from "./PeopleSelector.types";
import { StyledSendClockIcon } from "./PeopleSelector.styled";
import { globalColors } from "../../themes";

const toListItem = (
  item: TUser,
  t: TTranslation,
  disableDisabledUsers?: boolean,
  disableInvitedUsers?: string[],
) => {
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
  } = item;

  const role = getUserRole(item);

  const userAvatar = hasAvatar ? avatar : DefaultUserPhoto;

  const isInvited = disableInvitedUsers?.includes(userId);
  const isDisabled = disableDisabledUsers && status === EmployeeStatus.Disabled;

  const disabledText = isInvited
    ? t("Common:Invited")
    : isDisabled
      ? t("Common:Disabled")
      : "";

  const i: TSelectorItem = {
    id: userId,
    email,
    avatar: userAvatar,
    label: displayName || email,
    role: AvatarRole[role],
    isOwner,
    isAdmin,
    isVisitor,
    isCollaborator,
    isRoomAdmin,
    hasAvatar,
    isDisabled: isInvited || isDisabled,
    disabledText,
    status,
  };

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

  filterUserId,

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
}: PeopleSelectorProps) => {
  const { t }: { t: TTranslation } = useTranslation(["Common"]);

  const theme = useTheme();

  const [itemsList, setItemsList] = useState<TSelectorItem[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [total, setTotal] = useState<number>(-1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isNextPageLoading, setIsNextPageLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TSelectorItem | null>(null);
  const isFirstLoadRef = useRef(true);
  const afterSearch = useRef(false);
  const totalRef = useRef(0);

  const onSelect = (
    item: TSelectorItem,
    isDoubleClick: boolean,
    doubleClickCallback: () => void,
  ) => {
    setSelectedItem((el) => {
      if (el?.id === item.id) return null;

      return item;
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
          if (excludeItems && excludeItems.includes(item.id)) {
            totalDifferent += 1;
            return false;
          }
          return true;
        })
        .map((item) =>
          toListItem(item, t, disableDisabledUsers, disableInvitedUsers),
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
      isFirstLoadRef.current = false;
    },
    [
      disableDisabledUsers,
      disableInvitedUsers,
      excludeItems,
      filter,
      moveCurrentUserToTopOfList,
      removeCurrentUserFromList,
      searchValue,
      t,
      withOutCurrentAuthorizedUser,
    ],
  );

  const onSearch = useCallback((value: string, callback?: Function) => {
    isFirstLoadRef.current = true;
    afterSearch.current = true;
    setSearchValue(() => {
      return value;
    });
    callback?.();
  }, []);

  const onClearSearch = useCallback((callback?: Function) => {
    isFirstLoadRef.current = true;
    afterSearch.current = true;
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
      <div style={{ width: "100%" }}>
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
              color={globalColors.gray}
              dir="auto"
            >
              {`${userType} | ${email}`}
            </Text>
          </div>
        )}
      </div>
    );
  };

  return (
    <Selector
      id={id}
      alwaysShowFooter={itemsList.length !== 0 || Boolean(searchValue)}
      className={className}
      style={style}
      renderCustomItem={renderCustomItem}
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
      emptyScreenHeader={emptyScreenHeader ?? t("Common:EmptyHeader")}
      emptyScreenDescription={
        emptyScreenDescription ??
        t("Common:EmptyDescription", { productName: t("Common:ProductName") })
      }
      searchEmptyScreenImage={emptyScreenImage}
      searchEmptyScreenHeader={t("Common:NotFoundUsers")}
      searchEmptyScreenDescription={t("Common:NotFoundUsersDescription")}
      hasNextPage={hasNextPage}
      isNextPageLoading={isNextPageLoading}
      loadNextPage={loadNextPage}
      isMultiSelect={isMultiSelect ?? false}
      totalItems={total}
      isLoading={isFirstLoadRef.current}
      searchLoader={<SearchLoader />}
      rowLoader={<RowLoader isUser isContainer={isFirstLoadRef.current} />}
      onSelect={onSelect}
      {...infoProps}
    />
  );
};

export default PeopleSelector;
