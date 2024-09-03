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

import debounce from "lodash.debounce";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { useMemo, useState, useCallback, useEffect, useRef } from "react";

import { Avatar } from "@docspace/shared/components/avatar";
import { Text } from "@docspace/shared/components/text";
import { TextInput } from "@docspace/shared/components/text-input";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { toastr } from "@docspace/shared/components/toast";
import { parseAddresses, getParts } from "@docspace/shared/utils";
import { ComboBox } from "@docspace/shared/components/combobox";

import Filter from "@docspace/shared/api/people/filter";
import BetaBadge from "../../../BetaBadgeWrapper";
import { getMembersList } from "@docspace/shared/api/people";
import {
  AccountsSearchArea,
  EmployeeType,
  RoomsType,
  ShareAccessRights,
} from "@docspace/shared/enums";
import withCultureNames from "SRC_DIR/HOCs/withCultureNames";
import { isBetaLanguage } from "@docspace/shared/utils";
import { checkIfAccessPaid } from "SRC_DIR/helpers";

import { getTopFreeRole, isPaidUserRole } from "../utils";
import AccessSelector from "../../../AccessSelector";

import {
  StyledSubHeader,
  StyledLink,
  StyledInviteInput,
  StyledInviteInputContainer,
  StyledDropDown,
  SearchItemText,
  StyledDescription,
  StyledInviteLanguage,
  ResetLink,
  StyledCrossIcon,
} from "../StyledInvitePanel";

import AtReactSvgUrl from "PUBLIC_DIR/images/@.react.svg?url";
import ArrowIcon from "PUBLIC_DIR/images/arrow.right.react.svg";
import PaidQuotaLimitError from "SRC_DIR/components/PaidQuotaLimitError";

const minSearchValue = 2;

const InviteInput = ({
  defaultAccess,
  setInviteLanguage,
  hideSelector,
  inviteItems,
  onClose,
  roomId,
  roomType,
  setInviteItems,
  t,
  culture,
  language,
  isOwner,
  inputsRef,
  addUsersPanelVisible,
  setAddUsersPanelVisible,
  isMobileView,
  cultureNames,
  i18n,
  setCultureKey,
  isPaidUserAccess,
  setInvitePaidUsersCount,
  isUserTariffLimit,
}) => {
  const isPublicRoomType = roomType === RoomsType.PublicRoom;

  const [inputValue, setInputValue] = useState("");
  const [usersList, setUsersList] = useState([]);
  const [isChangeLangMail, setIsChangeLangMail] = useState(false);
  const [isAddEmailPanelBlocked, setIsAddEmailPanelBlocked] = useState(true);

  const [selectedAccess, setSelectedAccess] = useState(defaultAccess);
  const [dropDownWidth, setDropDownWidth] = useState(0);

  const searchRef = useRef();

  const selectedLanguage = cultureNames.find((item) => item.key === language) ||
    cultureNames.find((item) => item.key === culture.key) || {
      key: language,
      label: "",
      isBeta: isBetaLanguage(language),
    };

  useEffect(() => {
    setTimeout(() => {
      const width = searchRef?.current?.offsetWidth ?? 0;
      if (width !== dropDownWidth) setDropDownWidth(width);
    }, 0);
  });

  useEffect(() => {
    !culture.key &&
      setInviteLanguage({
        key: language,
        label: selectedLanguage.label,
        isBeta: isBetaLanguage(language),
      });
  }, []);

  const toUserItems = (query) => {
    const addresses = parseAddresses(query);
    const uid = () => Math.random().toString(36).slice(-6);
    let userAccess = selectedAccess;

    const isAccounts = roomId === -1;
    const isPaidAccess = isAccounts
      ? isPaidUserAccess(userAccess)
      : isPaidUserRole(userAccess);

    if (addresses.length > 1) {
      let isShowErrorToast = false;

      const itemsArray = addresses.map((address) => {
        if (isPaidAccess) {
          if (isUserTariffLimit) {
            const FreeUser = isAccounts
              ? EmployeeType.Guest
              : getTopFreeRole(t, roomType)?.access;

            if (FreeUser) {
              userAccess = FreeUser;
              isShowErrorToast = true;
            }
          } else {
            setInvitePaidUsersCount();
          }
        }

        return {
          email: address.email,
          id: uid(),
          access: userAccess,
          displayName: address.email,
          errors: address.parseErrors,
          isEmailInvite: true,
        };
      });

      if (isShowErrorToast) toastr.error(<PaidQuotaLimitError />);

      return itemsArray;
    }

    if (isPaidAccess) {
      if (isUserTariffLimit) {
        const FreeUser = isAccounts
          ? EmployeeType.Guest
          : getTopFreeRole(t, roomType)?.access;

        if (FreeUser) {
          userAccess = FreeUser;
          toastr.error(<PaidQuotaLimitError />);
        }
      } else {
        setInvitePaidUsersCount();
      }
    }

    return {
      email: addresses[0].email,
      id: uid(),
      access: userAccess,
      displayName: addresses[0].email,
      errors: addresses[0].parseErrors,
      isEmailInvite: true,
    };
  };

  const searchByQuery = async (value) => {
    const query = value.trim();

    if (query.length >= minSearchValue) {
      const searchArea = isPublicRoomType
        ? AccountsSearchArea.People
        : AccountsSearchArea.Any;
      const filter = Filter.getFilterWithOutDisabledUser();
      filter.search = query;

      const users = await getMembersList(searchArea, roomId, filter);

      setUsersList(users.items);

      if (users.total) setIsAddEmailPanelBlocked(false);
    }

    if (!query) {
      setInputValue("");
      setUsersList([]);
      setIsAddEmailPanelBlocked(true);
    }
  };

  const debouncedSearch = useCallback(
    debounce((value) => searchByQuery(value), 300),
    [],
  );

  const onChange = (e) => {
    const value = e.target.value;
    onChangeInput(value);
  };

  const onChangeInput = (value) => {
    const clearValue = value.trim();

    setInputValue(value);

    if (clearValue.length < minSearchValue) {
      setUsersList([]);
      setIsAddEmailPanelBlocked(true);
      return;
    }

    if (roomId !== -1) {
      debouncedSearch(clearValue);
    }

    const regex =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{0,}))$/g;

    const parts = getParts(value);
    for (let i = 0; i < parts.length; i += 1) {
      if (regex.test(parts[i])) {
        setIsAddEmailPanelBlocked(false);
        return;
      }
    }

    setIsAddEmailPanelBlocked(true);
  };

  const removeExist = (items) => {
    const filtered = items.reduce((unique, current) => {
      const isUnique = !unique.some((obj) =>
        obj.isGroup ? obj.id === current.id : obj.email === current.email,
      );

      if (!isUnique && isPaidUserAccess(current.access))
        setInvitePaidUsersCount(-1);

      isUnique && unique.push(current);

      return unique;
    }, []);

    if (items.length > filtered.length) toastr.warning(t("UsersAlreadyAdded"));

    return filtered;
  };

  const getItemContent = (item) => {
    const {
      avatar,
      displayName,
      name: groupName,
      email,
      id,
      shared,
      isGroup = false,
    } = item;

    item.access = selectedAccess;

    const addUser = () => {
      if (shared) {
        toastr.warning(t("UsersAlreadyAdded"));
      } else {
        if (item.isOwner || item.isAdmin)
          item.access = ShareAccessRights.RoomManager;

        if (isGroup && checkIfAccessPaid(item.access)) {
          const topFreeRole = getTopFreeRole(t, roomType);
          item.access = topFreeRole.access;
          item.warning = t("GroupMaxAvailableRoleWarning", {
            roleName: topFreeRole.label,
          });
        }

        if (
          isUserTariffLimit &&
          item.isVisitor &&
          isPaidUserRole(item.access)
        ) {
          const freeRole = getTopFreeRole(t, roomType)?.access;

          if (freeRole) {
            item.access = freeRole;
            toastr.error(<PaidQuotaLimitError />);
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
        />
        <div className="list-item_content">
          <SearchItemText primary disabled={shared}>
            {displayName || groupName}
          </SearchItemText>
          <SearchItemText>{email}</SearchItemText>
        </div>
        {shared && <SearchItemText info>{t("Common:Invited")}</SearchItemText>}
      </DropDownItem>
    );
  };

  const addEmail = () => {
    if (!inputValue.trim()) return;

    const items = toUserItems(inputValue);

    const newItems =
      items.length > 1 ? [...items, ...inviteItems] : [items, ...inviteItems];

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

  const foundUsers = usersList.map((user) => getItemContent(user));

  const addEmailPanel = (
    <DropDownItem
      className="list-item"
      style={{ width: "inherit" }}
      textOverflow
      onClick={addEmail}
      height={48}
    >
      <div className="email-list_avatar">
        <Avatar size="min" role="user" source={AtReactSvgUrl} />
        <Text truncate fontSize="14px" fontWeight={600}>
          {inputValue}
        </Text>
      </div>
      <div className="email-list_add-button">
        <Text fontSize="13px" fontWeight={600}>
          {t("Common:AddButton")}
        </Text>
        <ArrowIcon />
      </div>
    </DropDownItem>
  );

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
  const onLanguageSelect = (language) => {
    setInviteLanguage(language);
    setCultureKey(language.key);
    if (language.key !== i18n.language) setIsChangeLangMail(true);
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

  const cultureNamesNew = cultureNames.map((item) => ({
    label: item.label,
    key: item.key,
    isBeta: isBetaLanguage(item.key),
  }));

  return (
    <>
      <StyledSubHeader>
        {t("AddManually")}
        {!hideSelector && (
          <StyledLink
            className="link-list"
            fontWeight="600"
            type="action"
            isHovered
            onClick={openUsersPanel}
          >
            {t("Translations:ChooseFromList")}
          </StyledLink>
        )}
      </StyledSubHeader>
      <StyledDescription>
        {roomId === -1
          ? t("AddManuallyDescriptionAccounts", {
              productName: t("Common:ProductName"),
            })
          : t("AddManuallyDescriptionRoom", {
              productName: t("Common:ProductName"),
            })}
      </StyledDescription>
      <StyledInviteLanguage>
        <Text className="invitation-language">{t("InvitationLanguage")}:</Text>
        <div className="language-combo-box-wrapper">
          <ComboBox
            className="language-combo-box"
            directionY={"both"}
            options={cultureNamesNew}
            selectedOption={culture}
            onSelect={onLanguageSelect}
            isDisabled={false}
            scaled={isMobileView}
            scaledOptions={false}
            size="content"
            manualWidth="280px"
            showDisabledItems={true}
            dropDownMaxHeight={364}
            withBlur={isMobileView}
            isDefaultMode={!isMobileView}
            fillIcon={false}
            modernView
          />
          {culture?.isBeta && (
            <BetaBadge place="bottom-end" mobilePlace="bottom" />
          )}
        </div>
        {isChangeLangMail && !isMobileView && (
          <StyledLink
            className="list-link"
            fontWeight="600"
            type="action"
            isHovered
            onClick={onResetLangMail}
          >
            {t("ResetChange")}
          </StyledLink>
        )}
      </StyledInviteLanguage>
      {isChangeLangMail && isMobileView && (
        <ResetLink
          className="reset-link"
          fontWeight="600"
          type="action"
          isHovered
          onClick={onResetLangMail}
        >
          {t("ResetChange")}
        </ResetLink>
      )}

      <StyledInviteInputContainer ref={inputsRef}>
        <StyledInviteInput ref={searchRef} isShowCross={!!inputValue}>
          <TextInput
            className="invite-input"
            scale
            onChange={onChange}
            placeholder={
              roomId === -1
                ? t("InviteAccountSearchPlaceholder")
                : t("InviteRoomSearchPlaceholder")
            }
            value={inputValue}
            isAutoFocussed={true}
            onKeyDown={onKeyDown}
            type="search"
            withBorder={false}
          />

          <div className="append" onClick={() => onChangeInput("")}>
            <StyledCrossIcon />
          </div>
        </StyledInviteInput>
        {isAddEmailPanelBlocked ? (
          <></>
        ) : (
          <StyledDropDown
            width={dropDownWidth}
            isDefaultMode={false}
            open
            manualX="16px"
            showDisabledItems
            eventTypes="click"
            withBackdrop={false}
            zIndex={399}
            {...dropDownMaxHeight}
          >
            {!!usersList.length ? foundUsers : addEmailPanel}
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
    const { isOwner } = userStore.user;
    const {
      invitePanelOptions,
      setInviteItems,
      inviteItems,
      setInviteLanguage,
      culture,
      setInvitePaidUsersCount,
      isPaidUserAccess,
    } = dialogsStore;

    const { culture: language } = settingsStore;
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
      isPaidUserAccess,
      setInvitePaidUsersCount,
      isUserTariffLimit,
    };
  },
)(
  withCultureNames(
    withTranslation(["InviteDialog", "Common", "Translations"])(
      observer(InviteInput),
    ),
  ),
);
