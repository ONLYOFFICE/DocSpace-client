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

import debounce from "lodash.debounce";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { useMemo, useState, useCallback, useEffect, useRef } from "react";

import { Avatar } from "@docspace/shared/components/avatar";
import { Text } from "@docspace/shared/components/text";
import { TextInput } from "@docspace/shared/components/text-input";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { toastr } from "@docspace/shared/components/toast";
import {
  parseAddresses,
  getParts,
  isBetaLanguage,
} from "@docspace/shared/utils";
import { ComboBox } from "@docspace/shared/components/combobox";

import Filter from "@docspace/shared/api/people/filter";
import { getMembersList, getUserList } from "@docspace/shared/api/people";
import {
  AccountsSearchArea,
  EmployeeStatus,
  EmployeeType,
  RoomsType,
} from "@docspace/shared/enums";
import withCultureNames from "SRC_DIR/HOCs/withCultureNames";
import { checkIfAccessPaid } from "SRC_DIR/helpers";

import AtReactSvgUrl from "PUBLIC_DIR/images/@.react.svg?url";
import ArrowIcon from "PUBLIC_DIR/images/arrow.right.react.svg";
import BackupIcon from "PUBLIC_DIR/images/icons/16/backup.svg?url";
import EveryoneIconUrl from "PUBLIC_DIR/images/icons/16/departments.react.svg?url";
import PaidQuotaLimitError from "SRC_DIR/components/PaidQuotaLimitError";
import { StyledSendClockIcon } from "SRC_DIR/components/Icons";
import { getUserType } from "@docspace/shared/utils/common";
import { IconButton } from "@docspace/shared/components/icon-button";
import { zIndex } from "@docspace/shared/themes";
import {
  StyledSubHeader,
  StyledLink,
  StyledInviteInput,
  StyledInviteInputContainer,
  StyledDropDown,
  SearchItemText,
  StyledDescription,
  StyledInviteLanguage,
  StyledCrossIcon,
} from "../StyledInvitePanel";
import AccessSelector from "../../../AccessSelector";
import {
  fixAccess,
  getTopFreeRole,
  isPaidUserRole,
  makeFreeRole,
} from "../utils";

const minSearchValue = 2;
const filterSeparator = ";";
const regex =
  /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

const InviteInput = ({
  defaultAccess,
  setInviteLanguage,
  hideSelector,
  inviteItems,
  roomId,
  roomType,
  setInviteItems,
  t,
  culture,
  language,
  isOwner,
  isAdmin,
  inputsRef,
  setAddUsersPanelVisible,
  isMobileView,
  cultureNames,
  setCultureKey,
  isPaidUserAccess,
  isUserTariffLimit,
  removeExist,
  inputValue,
  setInputValue,
  usersList,
  setUsersList,
  allowInvitingGuests,
}) => {
  const isPublicRoomType = roomType === RoomsType.PublicRoom;

  const [isChangeLangMail, setIsChangeLangMail] = useState(false);
  const [isAddEmailPanelBlocked, setIsAddEmailPanelBlocked] = useState(true);

  const [selectedAccess, setSelectedAccess] = useState(defaultAccess);
  const [dropDownWidth, setDropDownWidth] = useState(0);
  const [searchRequestRunning, setSearchRequestRunning] = useState(false);

  const searchRef = useRef();
  const prevDropDownContent = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      const width = searchRef?.current?.offsetWidth ?? 0;
      if (width !== dropDownWidth) setDropDownWidth(width);
    }, 0);
  });

  const selectedLanguage = useMemo(
    () =>
      cultureNames.find((item) => item.key === language) || {
        key: language,
        label: "",
        isBeta: isBetaLanguage(language),
      },
    [cultureNames, language],
  );

  const cultureNamesNew = useMemo(
    () =>
      cultureNames.map((item) => ({
        label: item.label,
        key: item.key,
      })),
    [cultureNames],
  );

  useEffect(() => {
    if (!culture.key) {
      setInviteLanguage({
        key: language,
        label: selectedLanguage.label,
        isBeta: isBetaLanguage(language),
      });
    }
  }, []);

  const onLanguageSelect = (newLanguage) => {
    setInviteLanguage(newLanguage);
    setCultureKey(newLanguage.key);
    if (newLanguage.key !== selectedLanguage.key) setIsChangeLangMail(true);
    else setIsChangeLangMail(false);
  };

  const onResetLangMail = () => {
    setInviteLanguage({
      key: selectedLanguage.key,
      label: selectedLanguage.label,
      isBeta: selectedLanguage.isBeta,
    });
    setIsChangeLangMail(false);
  };

  const toUserItems = (query) => {
    const addresses = parseAddresses(query);
    const uid = () => Math.random().toString(36).slice(-6);
    let userAccess = selectedAccess;

    const isContacts = roomId === -1;

    const isPaidAccess = isContacts
      ? isPaidUserAccess(userAccess)
      : isPaidUserRole(userAccess);

    if (addresses.length > 1) {
      let isShowErrorToast = false;

      const itemsArray = addresses.map((address) => {
        if (isPaidAccess) {
          if (isUserTariffLimit) {
            const FreeUser = isContacts
              ? EmployeeType.User
              : getTopFreeRole(t, roomType)?.access;

            if (FreeUser) {
              userAccess = FreeUser;
              isShowErrorToast = true;
            }
          }
        }

        return {
          email: address.email,
          id: uid(),
          access: userAccess,
          displayName: address.email,
          errors: address.parseErrors,
          isEmailInvite: true,
          userType: roomId === -1 ? selectedAccess : EmployeeType.Guest,
        };
      });

      if (isShowErrorToast) toastr.error(<PaidQuotaLimitError />);

      return itemsArray;
    }

    if (isPaidAccess) {
      if (isUserTariffLimit) {
        const FreeUser = isContacts
          ? EmployeeType.User
          : getTopFreeRole(t, roomType)?.access;

        if (FreeUser) {
          userAccess = FreeUser;
          toastr.error(<PaidQuotaLimitError />);
        }
      }
    }

    return [
      {
        email: addresses[0].email,
        id: uid(),
        access: userAccess,
        displayName: addresses[0].email,
        errors: addresses[0].parseErrors,
        isEmailInvite: true,
        userType: roomId === -1 ? selectedAccess : EmployeeType.Guest,
      },
    ];
  };

  const searchByQuery = async (value) => {
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

      const searchArea = isPublicRoomType
        ? AccountsSearchArea.People
        : AccountsSearchArea.Any;

      filter.search = query;
      filter.filterSeparator = filterSeparator;

      const users =
        roomId === -1
          ? await getUserList(filter)
          : await getMembersList(searchArea, roomId, filter);

      setUsersList(
        roomId === -1
          ? users.items.map((u) => ({ ...u, shared: true }))
          : users.items,
      );

      if (users.total) isBlocked = false;
    }

    const parts = getParts(value);

    parts.forEach((part) => {
      isBlocked = regex.test(part) ? false : isBlocked;
    });

    setIsAddEmailPanelBlocked(isBlocked);

    setSearchRequestRunning(false);
  };

  const debouncedSearch = useCallback(
    debounce((value) => searchByQuery(value), 300),
    [],
  );

  const onChangeInput = (value) => {
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

  const onChange = (e) => {
    const value = e.target.value;
    onChangeInput(value);
  };

  const getItemContent = (item) => {
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

    const avatar = item.avatar
      ? item.avatar
      : isSystem
        ? EveryoneIconUrl
        : null;

    const addUser = () => {
      if (isDisabled) {
        toastr.warning(t("UsersCannotBeAdded"));
      } else if (shared) {
        toastr.warning(t("UsersAlreadyAdded"));
      } else {
        if (isGroup && checkIfAccessPaid(item.access)) {
          item = fixAccess(item, t, roomType);
        }

        if (
          isPaidUserRole(item.access) &&
          (item.isVisitor || item.isCollaborator)
        ) {
          const topFreeRole = getTopFreeRole(t, roomType);

          if (item.access !== topFreeRole.access) {
            item = makeFreeRole(item, t, topFreeRole);

            if (isUserTariffLimit) {
              toastr.error(<PaidQuotaLimitError />);
            }
          }
        }
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
        height={48}
        heightTablet={48}
        className="list-item"
      >
        <Avatar
          size="min"
          role="user"
          source={avatar}
          userName={groupName}
          isGroup={isGroup}
          className={isDisabled ? "avatar-disabled" : "item-avatar"}
        />
        <div className="list-item_content">
          <div className="list-item_content-box">
            <SearchItemText $primary disabled={shared || isDisabled}>
              {displayName || groupName}
            </SearchItemText>
            {status === EmployeeStatus.Pending ? <StyledSendClockIcon /> : null}
          </div>
          <SearchItemText>{email}</SearchItemText>
        </div>
        {shared ? (
          <SearchItemText $info>{t("Common:Invited")}</SearchItemText>
        ) : null}
        {isDisabled ? (
          <SearchItemText info>{t("Common:Disabled")}</SearchItemText>
        ) : null}
      </DropDownItem>
    );
  };

  const addEmail = () => {
    if (!inputValue.trim() || searchRequestRunning) return;

    const items = toUserItems(inputValue);

    const filteredItems = items
      .filter(
        (item) =>
          !usersList.find((value) => value.email === item.email)?.shared,
      )
      .map((item) => {
        let userItem = usersList.find((value) => value.email === item.email);

        if (!userItem) {
          const isRolePaid =
            roomId === -1
              ? isPaidUserAccess(item.access)
              : isPaidUserRole(item.access);

          if (isRolePaid && item.isEmailInvite) {
            const topFreeRole =
              roomId === -1 ? EmployeeType.User : getTopFreeRole(t, roomType);

            if (roomId !== -1 && item.access !== topFreeRole.access) {
              item = makeFreeRole(item, t, topFreeRole);
            }
          }

          return item;
        }

        userItem.access = selectedAccess;
        userItem.userType = getUserType(item);

        const isAccessPaid = checkIfAccessPaid(userItem.access);

        if (
          isAccessPaid &&
          (userItem.isGroup || userItem.isVisitor || userItem.isCollaborator)
        ) {
          userItem = fixAccess(userItem, t, roomType);

          if (isUserTariffLimit) {
            toastr.error(<PaidQuotaLimitError />);
          }
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
    } else if (roomId !== -1 && !allowInvitingGuests)
      prevDropDownContent.current = (
        <DropDownItem disabled className="no-users-list">
          <Text truncate fontSize="13px" fontWeight={400} lineHeight="20px">
            {t("Common:NotFoundUsers")}
          </Text>
        </DropDownItem>
      );
    else {
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
            <Avatar size="min" role="user" source={AtReactSvgUrl} />
            {roomId == -1 ? (
              <Text truncate fontSize="14px" fontWeight={600}>
                {inputValue}
              </Text>
            ) : (
              <div className="email-list_email-container">
                <Text truncate fontSize="14px" fontWeight={600}>
                  {inputValue}
                </Text>
                <Text
                  truncate
                  fontSize="12px"
                  fontWeight={400}
                  className="email-list_invite-as-guest"
                >
                  {t("Common:InviteAsGuest")}
                </Text>
              </div>
            )}
          </div>{" "}
          <div className="email-list_add-button">
            <ArrowIcon />
          </div>
        </DropDownItem>
      );
    }
    return prevDropDownContent.current;
  }, [usersList, inputValue, selectedAccess]);

  const onSelectAccess = (item) => {
    setSelectedAccess(item.access);
  };

  const onKeyPress = (e) => {
    if (e.key === "Enter") {
      addEmail();
    }
  };

  const onKeyDown = (event) => {
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
      <StyledSubHeader>
        {t("AddManually")}
        {!hideSelector ? (
          <StyledLink
            className="link-list"
            fontWeight="600"
            type="action"
            isHovered
            onClick={openUsersPanel}
          >
            {t("Translations:ChooseFromList")}
          </StyledLink>
        ) : null}
      </StyledSubHeader>
      <StyledDescription
        noSelect
        noAllowInvitingGuests={roomId !== -1 ? !allowInvitingGuests : null}
      >
        {roomId === -1
          ? t("InviteMembersManuallyDescription", {
              productName: t("Common:ProductName"),
            })
          : !allowInvitingGuests
            ? t("InviteToRoomManuallyInfoMembers", {
                productName: t("Common:ProductName"),
              })
            : t("InviteToRoomManuallyInfoGuest", {
                productName: t("Common:ProductName"),
              })}
      </StyledDescription>
      {roomId === -1 || allowInvitingGuests ? (
        <StyledInviteLanguage>
          <Text className="invitation-language" noSelect>
            {t("InvitationLanguage")}:
          </Text>
          <div className="language-combo-box-wrapper">
            <ComboBox
              className="language-combo-box"
              directionY="both"
              options={cultureNamesNew}
              selectedOption={culture}
              onSelect={onLanguageSelect}
              isDisabled={false}
              scaled={isMobileView}
              scaledOptions={false}
              size="content"
              manualWidth="280px"
              showDisabledItems
              dropDownMaxHeight={364}
              withBlur={isMobileView}
              isDefaultMode={!isMobileView}
              fillIcon={false}
              modernView
              withBackdrop={isMobileView}
              withBackground={isMobileView}
              shouldShowBackdrop={isMobileView}
            />
          </div>
          {isChangeLangMail ? (
            <IconButton
              className="list-link"
              iconName={BackupIcon}
              onClick={onResetLangMail}
              size={12}
            />
          ) : null}
        </StyledInviteLanguage>
      ) : null}

      <StyledInviteInputContainer ref={inputsRef}>
        <StyledInviteInput ref={searchRef} isShowCross={!!inputValue}>
          <TextInput
            className="invite-input"
            scale
            onChange={onChange}
            placeholder={
              roomId === -1
                ? t("InviteMembersSearchPlaceholder")
                : !allowInvitingGuests
                  ? t("InviteToRoomAddPlaceholder")
                  : t("InviteToRoomSearchPlaceholder")
            }
            value={inputValue}
            onKeyDown={onKeyDown}
            type="search"
            withBorder={false}
          />

          <div className="append" onClick={() => onChangeInput("")}>
            <StyledCrossIcon />
          </div>
        </StyledInviteInput>
        {isAddEmailPanelBlocked ? null : (
          <StyledDropDown
            width={dropDownWidth}
            isDefaultMode={false}
            open
            manualX="16px"
            showDisabledItems
            eventTypes="click"
            withBackdrop={false}
            zIndex={zIndex.backdrop}
            className="add-manually-dropdown"
            {...dropDownMaxHeight}
            isRequestRunning={searchRequestRunning}
          >
            {dropDownContent}
          </StyledDropDown>
        )}

        <AccessSelector
          className="add-manually-access"
          t={t}
          roomType={roomType}
          defaultAccess={selectedAccess}
          onSelectAccess={onSelectAccess}
          containerRef={inputsRef}
          isOwner={isOwner}
          isAdmin={isAdmin}
          isMobileView={isMobileView}
          {...(roomId === -1 && {
            isSelectionDisabled: isUserTariffLimit,
            selectionErrorText: <PaidQuotaLimitError />,
          })}
        />
      </StyledInviteInputContainer>
    </>
  );
};

export default inject(
  ({ settingsStore, dialogsStore, userStore, currentQuotaStore }) => {
    const { isOwner, isAdmin } = userStore.user;
    const {
      invitePanelOptions,
      setInviteItems,
      inviteItems,
      setInviteLanguage,
      culture,

      isPaidUserAccess,
    } = dialogsStore;

    const { culture: language, allowInvitingGuests } = settingsStore;
    const { isUserTariffLimit } = currentQuotaStore;
    return {
      language,
      setInviteLanguage,
      setInviteItems,
      inviteItems,
      culture,
      roomId: invitePanelOptions.roomId,
      hideSelector: invitePanelOptions.hideSelector,
      defaultAccess: invitePanelOptions.defaultAccess,
      isOwner,
      isAdmin,
      isPaidUserAccess,
      isUserTariffLimit,
      allowInvitingGuests,
    };
  },
)(
  withCultureNames(
    withTranslation(["InviteDialog", "Common", "Translations"])(
      observer(InviteInput),
    ),
  ),
);
