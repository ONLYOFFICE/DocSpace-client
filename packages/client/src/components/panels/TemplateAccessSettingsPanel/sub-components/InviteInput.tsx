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

import debounce from "lodash/debounce";
import { withTranslation } from "react-i18next";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";

import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/shared/components/avatar";
import { InputType, TextInput } from "@docspace/shared/components/text-input";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { toastr } from "@docspace/shared/components/toast";
import { LinkType } from "@docspace/shared/components/link";
import { TSelectorItem } from "@docspace/shared/components/selector";
import { Box } from "@docspace/shared/components/box";
import { Text } from "@docspace/shared/components/text";
import { getParts, parseAddresses } from "@docspace/shared/utils";
import Filter from "@docspace/shared/api/people/filter";
import { getMembersList } from "@docspace/shared/api/people";
import {
  AccountsSearchArea,
  EmployeeType,
  RoomsType,
} from "@docspace/shared/enums";
import { getUserType } from "@docspace/shared/utils/common";
import { TTranslation } from "@docspace/shared/types";
import AtReactSvgUrl from "PUBLIC_DIR/images/@.react.svg?url";
import ArrowIcon from "PUBLIC_DIR/images/arrow.right.react.svg";
import { TUser } from "@docspace/shared/api/people/types";
import { TGroup } from "@docspace/shared/api/groups/types";

import {
  StyledSubHeader,
  StyledLink,
  StyledInviteInput,
  StyledInviteInputContainer,
  StyledDropDown,
  SearchItemText,
  StyledDescription,
  StyledCrossIcon,
} from "../StyledInvitePanel";

const MIN_SEARCH_VALUE = 2;
const ITEM_HEIGHT = 48;
const FILTER_SEPARATOR = ";";

type InviteInputProps = {
  t: TTranslation;
  roomId: string | number;

  roomType: RoomsType;
  inviteItems: TSelectorItem[];
  setInviteItems: (items: TSelectorItem[]) => void;
  setAddUsersPanelVisible: (visible: boolean) => void;
  isDisabled: boolean;
  removeExist: (items: TSelectorItem[]) => void;
};

const InviteInput = ({
  t,
  roomId,
  roomType,
  inviteItems,
  setInviteItems,
  setAddUsersPanelVisible,
  isDisabled,
  removeExist,
}: InviteInputProps) => {
  const [inputValue, setInputValue] = useState("");

  const [usersList, setUsersList] = useState<(TUser | TGroup)[]>([]);
  const [isAddEmailPanelBlocked, setIsAddEmailPanelBlocked] = useState(true);
  const [dropDownWidth, setDropDownWidth] = useState(0);
  const [searchRequestRunning, setSearchRequestRunning] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const prevDropDownContent = useRef<React.ReactNode | null>(null);

  const isPublicRoomType = roomType === RoomsType.PublicRoom;

  const dropDownMaxHeight = usersList.length > 5 ? { maxHeight: 240 } : {};

  useEffect(() => {
    setTimeout(() => {
      const width = searchRef?.current?.offsetWidth ?? 0;
      if (width !== dropDownWidth) setDropDownWidth(width);
    }, 0);
  });

  const searchByQuery = useCallback(
    async (value: string) => {
      const query = getParts(value.trim()).join(FILTER_SEPARATOR);

      if (!query) {
        setInputValue("");
        setUsersList([]);
        setIsAddEmailPanelBlocked(true);
        setSearchRequestRunning(false);

        return;
      }

      let isBlocked = true;

      if (query.length >= MIN_SEARCH_VALUE) {
        const filter = Filter.getDefault();

        const searchArea = isPublicRoomType
          ? AccountsSearchArea.People
          : AccountsSearchArea.Any;

        // filter.role = [EmployeeType.Admin, EmployeeType.User]; // TODO: Templates
        filter.search = query;
        filter.filterSeparator = FILTER_SEPARATOR;

        const users = await getMembersList(searchArea, roomId, filter);

        setUsersList(users.items);

        if (users.total) {
          isBlocked = false;
        }
      }

      setIsAddEmailPanelBlocked(isBlocked);

      setSearchRequestRunning(false);
    },
    [isPublicRoomType, roomId],
  );

  const debouncedSearch = useCallback(
    debounce((value) => searchByQuery(value), 300),
    [searchByQuery],
  );

  const onChangeInput = (value: string) => {
    const clearValue = value.trim();

    setInputValue(value);

    if (clearValue.length < MIN_SEARCH_VALUE) {
      setUsersList([]);
      setIsAddEmailPanelBlocked(true);
      return;
    }

    setSearchRequestRunning(true);
    debouncedSearch(clearValue);
  };

  const toUserItems = (query: string) => {
    const addresses = parseAddresses(query);
    const uid = () => Math.random().toString(36).slice(-6);

    if (addresses.length > 1) {
      const itemsArray = addresses.map((address) => {
        return {
          email: address.email,
          id: uid(),
          displayName: address.email,
          errors: address.parseErrors,
          isEmailInvite: true,
          userType: EmployeeType.Guest,
        };
      });

      return itemsArray;
    }

    return [
      {
        email: addresses[0].email,
        id: uid(),
        displayName: addresses[0].email,
        errors: addresses[0].parseErrors,
        isEmailInvite: true,
        userType: EmployeeType.Guest,
      },
    ];
  };

  const addEmail = useCallback(() => {
    if (!inputValue.trim() || searchRequestRunning) return;

    const items = toUserItems(inputValue);

    const filteredItems = items
      .filter((item) => {
        const userItem = usersList.find((value) => value.email === item.email);

        if (!userItem || userItem?.shared) return false;
        return true;
      })
      .map((item) => {
        const userItem = usersList.find((value) => value.email === item.email);

        if (userItem) userItem.userType = getUserType(item);

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
  }, [
    t,
    inputValue,
    inviteItems,
    removeExist,
    searchRequestRunning,
    setInviteItems,
    usersList,
  ]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChangeInput(value);
  };

  const getItemContent = useCallback(
    (item) => {
      const {
        avatar,
        displayName,
        name: groupName,
        email,
        id,
        shared,
        isGroup = false,
      } = item;

      const addUser = () => {
        if (shared) {
          toastr.warning(t("UsersAlreadyAdded"));
        } else {
          const items = removeExist([item, ...inviteItems]);
          setInviteItems(items);
        }

        setInputValue("");
        setUsersList([]);
        setIsAddEmailPanelBlocked(true);
      };

      return (
        <DropDownItem
          key={id}
          onClick={addUser}
          height={ITEM_HEIGHT}
          heightTablet={ITEM_HEIGHT}
          className="list-item"
        >
          <Avatar
            size={AvatarSize.min}
            role={AvatarRole.user}
            source={avatar}
            userName={groupName}
            isGroup={isGroup}
          />

          <div className="list-item_content">
            <Box displayProp="flex" alignItems="center" gapProp="8px">
              <SearchItemText primary disabled={shared}>
                {displayName || groupName}
              </SearchItemText>
            </Box>
            <SearchItemText>{email}</SearchItemText>
          </div>
          {shared && (
            <SearchItemText info>{t("Common:Invited")}</SearchItemText>
          )}
        </DropDownItem>
      );
    },
    [t, inviteItems, removeExist, setInviteItems],
  );

  const openUsersPanel = () => {
    setInputValue("");
    setAddUsersPanelVisible(true);
    setIsAddEmailPanelBlocked(true);
  };

  const onClearInput = () => onChangeInput("");

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

  const dropDownContent = useMemo(() => {
    const partsLength = getParts(inputValue).length;

    if (searchRequestRunning && prevDropDownContent.current) {
      return prevDropDownContent.current;
    }

    if (partsLength === 1 && !!usersList.length) {
      prevDropDownContent.current = usersList.map((user) =>
        getItemContent(user),
      );
    } else {
      prevDropDownContent.current = (
        <DropDownItem
          className="list-item"
          style={{
            width: "inherit",
          }}
          textOverflow
          onClick={addEmail}
          height={53}
        >
          <div className="email-list_avatar">
            <Avatar
              size={AvatarSize.min}
              role={AvatarRole.user}
              source={AtReactSvgUrl}
            />
            <div className="email-list_email-container">
              <Text truncate fontSize="14px" fontWeight={600}>
                {inputValue}
              </Text>
            </div>
          </div>
          <div className="email-list_add-button">
            <ArrowIcon />
          </div>
        </DropDownItem>
      );
    }
    return prevDropDownContent.current;
  }, [usersList, inputValue, addEmail, getItemContent, searchRequestRunning]);

  return (
    <>
      <StyledSubHeader className="invite-input-text">
        {t("Files:AddUsersOrGroups")}

        <StyledLink
          className="link-list invite-input-text"
          fontWeight="600"
          type={LinkType.action}
          isHovered
          onClick={openUsersPanel}
        >
          {t("Translations:ChooseFromList")}
        </StyledLink>
      </StyledSubHeader>
      <StyledDescription>
        {t("Files:AddUsersOrGroupsDescription")}
      </StyledDescription>

      <StyledInviteInputContainer>
        <StyledInviteInput ref={searchRef} isShowCross={!!inputValue}>
          <TextInput
            className="invite-input"
            scale
            onChange={onChange}
            placeholder={t("Files:AddAdminByNameOrEmail")}
            value={inputValue}
            isAutoFocussed
            type={InputType.search}
            withBorder={false}
            isDisabled={isDisabled}
            onKeyDown={onKeyDown}
          />

          <div className="append" onClick={onClearInput}>
            <StyledCrossIcon />
          </div>
        </StyledInviteInput>

        {!isAddEmailPanelBlocked && (
          <StyledDropDown
            width={dropDownWidth}
            isDefaultMode={false}
            open
            showDisabledItems
            eventTypes="click"
            withBackdrop={false}
            zIndex={399}
            className="add-manually-dropdown"
            {...dropDownMaxHeight}
            isRequestRunning={searchRequestRunning}
          >
            {dropDownContent}
          </StyledDropDown>
        )}
      </StyledInviteInputContainer>
    </>
  );
};

export default withTranslation(["InviteDialog", "Common", "Translations"])(
  InviteInput,
);
