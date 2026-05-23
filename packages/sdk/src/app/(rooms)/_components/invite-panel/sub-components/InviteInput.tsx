"use client";

// (c) Copyright Ascensio System SIA 2009-2026
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

import debounce from "lodash/debounce";
import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import classNames from "classnames";

import AtReactSvgUrl from "PUBLIC_DIR/images/@.react.svg?url";
import ArrowIcon from "PUBLIC_DIR/images/arrow.right.react.svg";
import CrossIcon from "PUBLIC_DIR/images/cross.edit.react.svg";
import EveryoneIconUrl from "PUBLIC_DIR/images/icons/16/departments.react.svg?url";

import { Avatar } from "@docspace/ui-kit/components/avatar";
import { AvatarRole, AvatarSize } from "@docspace/ui-kit/components/avatar/Avatar.enums";
import { Link } from "@docspace/ui-kit/components/link";
import { LinkType } from "@docspace/ui-kit/components/link/Link.enums";
import { Text } from "@docspace/ui-kit/components/text";
import { TextInput } from "@docspace/ui-kit/components/text-input";
import { InputType } from "@docspace/ui-kit/components/text-input/TextInput.enums";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { Heading } from "@docspace/ui-kit/components/heading";
import { DropDown } from "@docspace/ui-kit/components/drop-down";
import { toastr } from "@docspace/ui-kit/components/toast";
import { parseAddresses, getParts } from "@docspace/shared/utils";
import type { TTranslation } from "@docspace/shared/types";
import Filter from "@docspace/shared/api/people/filter";
import { getMembersList } from "@docspace/shared/api/people";
import {
  AccountsSearchArea,
  EmployeeStatus,
  RoomsType,
  ShareAccessRights,
} from "@docspace/shared/enums";
import { checkIfAccessPaid } from "@docspace/shared/utils/filterPaidRoleOptions";
import { getUserType } from "@docspace/shared/utils/common";
import { getBrandName } from "@docspace/shared/constants/brands";
import type { TOption } from "@docspace/ui-kit/components/combobox";

import type { InviteItem } from "../index";
import AccessSelector from "./AccessSelector";
import styles from "../InvitePanel.module.scss";
import {
  fixAccess,
  getTopFreeRole,
  getViewerRole,
  isPaidUserRole,
  makeFreeRole,
  makeViewerRole,
} from "../utils";

export type InviteInputProps = {
  t: TTranslation;
  roomId: number;
  roomType: RoomsType | -1;
  inviteItems: InviteItem[];
  setInviteItems: (items: InviteItem[]) => void;
  defaultAccess: number;
  isOwner: boolean;
  isAdmin: boolean;
  inputsRef: React.RefObject<HTMLDivElement | null>;
  setAddUsersPanelVisible: (v: boolean) => void;
  isMobileView: boolean;
  removeExist: (items: InviteItem[]) => InviteItem[];
  inputValue: string;
  setInputValue: (v: string) => void;
  usersList: InviteItem[];
  setUsersList: (v: InviteItem[]) => void;
  hideSelector?: boolean;
  isPrivateRoom?: boolean;
  allowInvitingGuests: boolean;
};

const minSearchValue = 2;
const filterSeparator = ";";
const emailRegex =
  /^(([^<>()[\]\.,;:\s@"]+(\.[^<>()[\]\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\.,;:\s@"]+\.)+[^<>()[\]\.,;:\s@"]{2,})$/i;

const InviteInput: React.FC<InviteInputProps> = ({
  defaultAccess,
  inviteItems,
  roomId,
  roomType,
  setInviteItems,
  t,
  isOwner,
  isAdmin,
  inputsRef,
  setAddUsersPanelVisible,
  isMobileView,
  removeExist,
  inputValue,
  setInputValue,
  usersList,
  setUsersList,
  hideSelector,
  isPrivateRoom,
  allowInvitingGuests,
}) => {
  const [isAddEmailPanelBlocked, setIsAddEmailPanelBlocked] = useState(true);
  const [selectedAccess, setSelectedAccess] = useState(defaultAccess);
  const [dropDownWidth, setDropDownWidth] = useState(0);
  const [searchRequestRunning, setSearchRequestRunning] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const prevDropDownContent = useRef<React.ReactNode>(null);

  useEffect(() => {
    setTimeout(() => {
      const width = searchRef?.current?.offsetWidth ?? 0;
      if (width !== dropDownWidth) setDropDownWidth(width);
    }, 0);
  });

  const toUserItems = (query: string): InviteItem[] => {
    const addresses = parseAddresses(query);
    const uid = () => Math.random().toString(36).slice(-6);
    const userAccess = selectedAccess;

    if (addresses.length > 1) {
      return addresses.map((address) => ({
        email: address.email,
        id: uid(),
        access: userAccess,
        displayName: address.email,
        errors: address.parseErrors as unknown as InviteItem["errors"],
        isEmailInvite: true,
        userType: userAccess,
      }));
    }

    return [
      {
        email: addresses[0].email,
        id: uid(),
        access: userAccess,
        displayName: addresses[0].email,
        errors: addresses[0].parseErrors as unknown as InviteItem["errors"],
        isEmailInvite: true,
        userType: userAccess,
      },
    ];
  };

  const searchByQuery = async (value: string) => {
    const query = getParts(value.trim()).join(filterSeparator);

    if (!query) {
      setInputValue("");
      setUsersList([]);
      setIsAddEmailPanelBlocked(true);
      setSearchRequestRunning(false);
      return;
    }

    let isBlocked = true;

    if (query.length >= minSearchValue) {
      const filter = Filter.getDefault();

      filter.search = query;
      (filter as unknown as Record<string, unknown>).filterSeparator = filterSeparator;

      const users = await getMembersList(
        isPrivateRoom ? AccountsSearchArea.People : AccountsSearchArea.Any,
        roomId,
        filter,
      );

      setUsersList(users.items as InviteItem[]);

      if (users.total) isBlocked = false;
    }

    const parts = getParts(value);

    parts.forEach((part) => {
      isBlocked = emailRegex.test(part) ? false : isBlocked;
    });

    setIsAddEmailPanelBlocked(isBlocked);
    setSearchRequestRunning(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value: string) => searchByQuery(value), 300),
    [],
  );

  const onChangeInput = (value: string) => {
    const clearValue = value.trim();

    setInputValue(value);

    if (clearValue.length < minSearchValue) {
      setUsersList([]);
      setIsAddEmailPanelBlocked(true);
      return;
    }

    setSearchRequestRunning(true);
    debouncedSearch(clearValue);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChangeInput(value);
  };

  const addUser = (item: InviteItem) => {
    const {
      shared,
      status,
      roomType: itemRoomType,
      access,
      isVisitor,
      isGroup = false,
    } = item;
    const isDisabled = status === EmployeeStatus.Disabled;

    if (isDisabled) {
      toastr.warning(t("UsersCannotBeAdded"));
    } else if (shared) {
      toastr.warning(t("UsersAlreadyAdded"));
    } else {
      let mutableItem = { ...item };

      const guestWrongRoleInAgent =
        isVisitor &&
        itemRoomType === RoomsType.AIRoom &&
        access !== ShareAccessRights.ReadOnly;

      if (isGroup && checkIfAccessPaid(access) && roomType !== -1) {
        mutableItem = fixAccess(mutableItem, t, roomType as RoomsType);
      }

      if (guestWrongRoleInAgent) {
        mutableItem = makeViewerRole(
          mutableItem,
          t,
          getViewerRole(t, roomType as RoomsType),
        );
      }

      if (
        !guestWrongRoleInAgent &&
        isPaidUserRole(access) &&
        (mutableItem.isVisitor || mutableItem.isCollaborator)
      ) {
        const topFreeRole = getTopFreeRole(t, roomType as RoomsType);

        if (
          topFreeRole &&
          access !== (topFreeRole as { access: number }).access
        ) {
          mutableItem = makeFreeRole(mutableItem, t, topFreeRole);
        }
      }
      const items = removeExist([mutableItem, ...inviteItems]);
      setInviteItems(items);
    }

    setInputValue("");
    setUsersList([]);
    setIsAddEmailPanelBlocked(true);
  };

  const getItemContent = (item: InviteItem) => {
    const {
      displayName,
      name: groupName,
      email,
      id,
      shared,
      isGroup = false,
      status,
      isSystem,
    } = item;

    const isDisabled = status === EmployeeStatus.Disabled;

    item.access = selectedAccess;

    const avatarSource = item.avatar
      ? item.avatar
      : isSystem
        ? EveryoneIconUrl
        : undefined;

    return (
      <DropDownItem
        key={id}
        onClick={() => addUser(item)}
        height={48}
        heightTablet={48}
        className={styles.listItem}
      >
        <Avatar
          size={AvatarSize.min}
          role={AvatarRole.user}
          source={avatarSource}
          userName={groupName}
          isGroup={isGroup}
          className={isDisabled ? styles.avatarDisabled : styles.itemAvatar}
        />
        <div className={styles.listItemContent}>
          <div className={styles.listItemContentBox}>
            <Text
              className={classNames(styles.searchItemText, {
                [styles.isPrimary]: true,
                [styles.isDisabled]: shared || isDisabled,
              })}
            >
              {displayName || groupName}
            </Text>
          </div>
          <Text lineHeight="16px">{email}</Text>
        </div>
        {shared ? (
          <Text
            className={classNames(styles.searchItemText, {
              [styles.isInfo]: true,
            })}
          >
            {t("Common:Invited")}
          </Text>
        ) : null}
        {isDisabled ? (
          <Text
            className={classNames(styles.searchItemText, {
              [styles.isInfo]: true,
            })}
          >
            {t("Common:Disabled")}
          </Text>
        ) : null}
      </DropDownItem>
    );
  };

  const addEmail = () => {
    if (!inputValue.trim() || searchRequestRunning) return;

    const existUser = usersList.find((u) => u.email === inputValue);
    if (existUser) {
      addUser(existUser);
      return;
    }

    if (isPrivateRoom) return;

    const items = toUserItems(inputValue);

    const filteredItems = items
      .filter(
        (item) =>
          !usersList.find((value) => value.email === item.email)?.shared,
      )
      .map((item) => {
        let userItem = usersList.find((value) => value.email === item.email);

        if (!userItem) {
          const isRolePaid = isPaidUserRole(item.access);

          const shouldMakeViewerRole =
            roomType === RoomsType.AIRoom &&
            item.isEmailInvite &&
            item.access !== ShareAccessRights.ReadOnly;

          if (shouldMakeViewerRole) {
            return makeViewerRole(
              item,
              t,
              getViewerRole(t, roomType as RoomsType),
            );
          }

          if (isRolePaid && item.isEmailInvite) {
            const topFreeRole = getTopFreeRole(t, roomType as RoomsType);

            if (
              topFreeRole &&
              item.access !== (topFreeRole as { access: number }).access
            ) {
              return makeFreeRole(item, t, topFreeRole);
            }
          }

          return item;
        }

        userItem = {
          ...userItem,
          access: selectedAccess,
          userType: getUserType(
            userItem as Parameters<typeof getUserType>[0],
          ) as number | undefined,
        };

        const shouldMakeFreeRole =
          checkIfAccessPaid(userItem.access) &&
          (userItem.isGroup || userItem.isVisitor || userItem.isCollaborator);

        const shouldMakeViewerRole =
          roomType === RoomsType.AIRoom &&
          userItem.isVisitor &&
          userItem.access !== ShareAccessRights.ReadOnly;

        if (shouldMakeFreeRole || shouldMakeViewerRole) {
          return fixAccess(userItem, t, roomType as RoomsType);
        }

        return userItem;
      });

    if (filteredItems.length !== items.length) {
      toastr.warning(t("UsersAlreadyAdded"));
    }

    if (!filteredItems.length) {
      setInputValue("");
      setIsAddEmailPanelBlocked(true);
      setUsersList([]);
      return;
    }

    const newItems = [...filteredItems, ...inviteItems];
    const filtered = removeExist(newItems);
    setInviteItems(filtered);
    setInputValue("");
    setIsAddEmailPanelBlocked(true);
    setUsersList([]);
  };

  const dropDownMaxHeight = usersList.length > 5 ? { maxHeight: 240 } : {};

  const openUsersPanel = () => {
    setInputValue("");
    setAddUsersPanelVisible(true);
    setIsAddEmailPanelBlocked(true);
  };

  const dropDownContent = useMemo(() => {
    const partsLength = getParts(inputValue).length;

    if (searchRequestRunning && prevDropDownContent.current) {
      return prevDropDownContent.current;
    }

    if (partsLength === 1 && !!usersList.length) {
      prevDropDownContent.current = usersList.map((user) =>
        getItemContent(user),
      );
    } else if (!allowInvitingGuests || isPrivateRoom) {
      prevDropDownContent.current = (
        <DropDownItem disabled className={styles.noUsersList}>
          <Text truncate fontSize="13px" fontWeight={400} lineHeight="20px">
            {t("Common:NotFoundUsers")}
          </Text>
        </DropDownItem>
      );
    } else {
      prevDropDownContent.current = (
        <DropDownItem
          className={styles.listItem}
          style={{ width: "inherit" }}
          textOverflow
          onClick={addEmail}
          height={53}
        >
          <div className={styles.emailListAvatar}>
            <Avatar size={AvatarSize.min} role={AvatarRole.user} source={AtReactSvgUrl} />
            <div className={styles.emailListContainer}>
              <Text truncate fontSize="14px" fontWeight={600}>
                {inputValue}
              </Text>
              <Text
                truncate
                fontSize="12px"
                fontWeight={400}
                className={styles.emailListInviteAsGuest}
              >
                {t("Common:InviteAsGuest")}
              </Text>
            </div>
          </div>
          <div className={styles.emailListAddButton}>
            <ArrowIcon />
          </div>
        </DropDownItem>
      );
    }
    return prevDropDownContent.current;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usersList, inputValue, selectedAccess, isPrivateRoom]);

  const onSelectAccessInternal = (item: TOption & { access?: number }) => {
    if (item.access !== undefined) setSelectedAccess(item.access);
  };
  // Cast hoisted out of JSX to avoid `<TOption>` being misread as a tag.
  const onSelectAccessCast = onSelectAccessInternal as (access: TOption) => void;

  const onKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      addEmail();
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const keyCode = event.code;

    const isAcceptableEvents =
      keyCode === "ArrowUp" || keyCode === "ArrowDown" || keyCode === "Enter";

    if (isAcceptableEvents && inputValue.length > 2) return;

    event.stopPropagation();
  };

  useEffect(() => {
    document.addEventListener("keyup", onKeyPress);
    return () => document.removeEventListener("keyup", onKeyPress);
  });

  return (
    <>
      <Heading className={styles.subHeader}>
        {t("AddManually")}
        {!hideSelector ? (
          <Link
            className={classNames(styles.styledLink, "link-list")}
            fontWeight="600"
            type={LinkType.action}
            isHovered
            onClick={openUsersPanel}
            dataTestId="invite_panel_choose_from_list_link"
          >
            {t("Translations:ChooseFromList")}
          </Link>
        ) : null}
      </Heading>
      <Text
        className={classNames(styles.description, {
          [styles.noAllowInvitingGuests]: !allowInvitingGuests,
        })}
      >
        {!allowInvitingGuests
          ? t("InviteToRoomManuallyInfoMembers", {
              productName: getBrandName("ProductName"),
            })
          : t("InviteToRoomManuallyInfoGuest", {
              productName: getBrandName("ProductName"),
            })}
      </Text>

      <div className={styles.inviteInputContainer} ref={inputsRef}>
        <div
          className={classNames(styles.inviteInput, {
            [styles.isShowCross]: !!inputValue,
          })}
          ref={searchRef}
        >
          <TextInput
            className="invite-input"
            scale
            onChange={onChange}
            placeholder={
              !allowInvitingGuests
                ? t("InviteToRoomAddPlaceholder")
                : t("InviteToRoomSearchPlaceholder")
            }
            value={inputValue}
            onKeyDown={onKeyDown}
            type={InputType.search}
            withBorder={false}
            testId="invite_panel_search_input"
          />

          <div className={styles.append} onClick={() => onChangeInput("")}>
            <CrossIcon className={styles.rowIcons} />
          </div>
        </div>
        {isAddEmailPanelBlocked ? null : (
          <DropDown
            isDefaultMode={false}
            open
            manualX="16px"
            showDisabledItems
            eventTypes="click"
            withBackdrop={false}
            zIndex={399}
            style={
              {
                "--custom-width": `${dropDownWidth}px`,
              } as React.CSSProperties
            }
            className={classNames(
              styles.addManuallyDropdown,
              styles.emailDropdown,
              {
                [styles.isRequestRunning]: searchRequestRunning,
                [styles.customWidth]: !!dropDownWidth,
              },
            )}
            {...dropDownMaxHeight}
          >
            {dropDownContent}
          </DropDown>
        )}

        <AccessSelector
          className="add-manually-access"
          t={t}
          roomType={roomType}
          defaultAccess={selectedAccess}
          onSelectAccess={onSelectAccessCast}
          containerRef={inputsRef}
          isOwner={isOwner}
          isAdmin={isAdmin}
          isMobileView={isMobileView}
          dataTestId="invite_panel_access_selector"
        />
      </div>
    </>
  );
};

export default InviteInput;
