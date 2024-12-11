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
import { withTranslation, Trans } from "react-i18next";
import { useMemo, useState, useCallback, useEffect, useRef } from "react";

import { Avatar } from "@docspace/shared/components/avatar";
import { TextInput } from "@docspace/shared/components/text-input";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { toastr } from "@docspace/shared/components/toast";
import Filter from "@docspace/shared/api/people/filter";
import { getMembersList } from "@docspace/shared/api/people";
import {
  AccountsSearchArea,
  EmployeeType,
  RoomsType,
  ShareAccessRights,
} from "@docspace/shared/enums";
import withCultureNames from "SRC_DIR/HOCs/withCultureNames";
import { checkIfAccessPaid } from "SRC_DIR/helpers";

import PeopleSelector from "@docspace/shared/selectors/People";
import { getAccessOptions, getTopFreeRole } from "../utils";

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
import { getDefaultAccessUser } from "@docspace/shared/utils/getDefaultAccessUser";

const minSearchValue = 1;
const PEOPLE_TAB_ID = "0";

const InviteInput = ({
  t,
  roomId = 281, //TODO: Templates
  onClose,
  roomType,
  inviteItems,
  setInviteItems,
  addUsersPanelVisible,
  setAddUsersPanelVisible,
  isMobileView,
  isOwner,
  standalone,
  isDisabled,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [selectedTab, setSelectedTab] = useState(PEOPLE_TAB_ID);
  const [usersList, setUsersList] = useState([]);
  const [isAddEmailPanelBlocked, setIsAddEmailPanelBlocked] = useState(true);
  const [dropDownWidth, setDropDownWidth] = useState(0);
  const searchRef = useRef();

  console.log("roomId", roomId);

  const isPublicRoomType = roomType === RoomsType.PublicRoom;

  const dropDownMaxHeight = usersList.length > 5 ? { maxHeight: 240 } : {};
  const foundUsers = usersList.map((user) => getItemContent(user));

  useEffect(() => {
    setTimeout(() => {
      const width = searchRef?.current?.offsetWidth ?? 0;
      if (width !== dropDownWidth) setDropDownWidth(width);
    }, 0);
  });

  const searchByQuery = async (value) => {
    console.log("searchByQuery");
    return;

    const query = value.trim();

    if (query.length >= minSearchValue) {
      const searchArea = isPublicRoomType
        ? AccountsSearchArea.People
        : AccountsSearchArea.Any;
      const filter = Filter.getFilterWithOutDisabledUser();
      filter.role = [EmployeeType.Admin, EmployeeType.User];
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

    setIsAddEmailPanelBlocked(true);
  };

  const removeExist = (items) => {
    const filtered = items.reduce((unique, o) => {
      !unique.some((obj) =>
        obj.isGroup ? obj.id === o.id : obj.email === o.email,
      ) && unique.push(o);

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

    const addUser = () => {
      console.log("addUser");
      if (item.isOwner || item.isAdmin)
        item.access = ShareAccessRights.RoomManager;

      // if (isGroup && checkIfAccessPaid(item.access)) {
      //   const topFreeRole = getTopFreeRole(t, roomType);
      //   item.access = topFreeRole.access;
      //   item.warning = t("GroupMaxAvailableRoleWarning", {
      //     role: topFreeRole.label,
      //   });
      // }

      const items = removeExist([item, ...inviteItems]);
      setInviteItems(items);

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

  const addItems = (users) => {
    console.log("addItems", users);
    const topFreeRole = getTopFreeRole(t, roomType);
    users.forEach((u) => {
      if (u.isGroup && checkIfAccessPaid(u.access)) {
        u.access = topFreeRole.access;
        u.warning = t("GroupMaxAvailableRoleWarning", {
          role: topFreeRole.label,
        });
      }
    });

    const items = [...users, ...inviteItems];

    const filtered = removeExist(items);

    setInviteItems(filtered);
    setInputValue("");
    setUsersList([]);
  };

  const getSelectedTab = (item) => setSelectedTab(item);

  const openUsersPanel = () => {
    setInputValue("");
    setAddUsersPanelVisible(true);
    setIsAddEmailPanelBlocked(true);
  };

  const closeUsersPanel = () => {
    setAddUsersPanelVisible(false);
  };

  const onClearInput = () => onChangeInput("");

  const invitedUsers = useMemo(
    () => inviteItems.map((item) => item.id),
    [inviteItems],
  );

  const filter = new Filter();
  filter.role = [EmployeeType.Admin, EmployeeType.User]; // 1(EmployeeType.User) - RoomAdmin | 3(EmployeeType.Admin) - DocSpaceAdmin

  const accessOptions = getAccessOptions(
    t,
    roomType,
    false,
    true,
    isOwner,
    standalone,
  );

  const infoText =
    selectedTab === PEOPLE_TAB_ID ? (
      <Trans i18nKey="AddUsersOrGroupsInfo" ns="Files" t={t}></Trans>
    ) : (
      <Trans i18nKey="AddUsersOrGroupsInfoGroups" ns="Files" t={t}></Trans>
    );

  return (
    <>
      <StyledSubHeader className="invite-input-text">
        {t("Files:AddUsersOrGroups")}

        <StyledLink
          className="link-list invite-input-text"
          fontWeight="600"
          type="action"
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
            isAutoFocussed={true}
            type="search"
            withBorder={false}
            isDisabled={isDisabled}
          />

          <div className="append" onClick={onClearInput}>
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
            {foundUsers}
          </StyledDropDown>
        )}
        {/* //TODO: Templates rewrite to PeopleSelector */}
        {/* {addUsersPanelVisible && (
          <AddUsersPanel
            onParentPanelClose={onClose}
            onClose={closeUsersPanel}
            visible={addUsersPanelVisible}
            tempDataItems={inviteItems}
            accessOptions={accessOptions}
            setDataItems={addItems}
            isMultiSelect
            withoutBackground={isMobileView}
            withBlur={!isMobileView}
            roomId={roomId} // fixed groups request // need template id for correct working
            withGroups={!isPublicRoomType}
            withInfo
            infoText={infoText}
            withInfoBadge
            invitedUsers={invitedUsers}
            disableDisabledUsers
            filter={filter}
            setActiveTabId={getSelectedTab}
            isUsersList
            defaultAccess={getDefaultAccessUser(roomType)}
          />
        )} */}
      </StyledInviteInputContainer>
    </>
  );
};

export default inject(({ dialogsStore }) => {
  const { invitePanelOptions } = dialogsStore;

  return {
    roomId: invitePanelOptions.roomId,
  };
})(
  withCultureNames(
    withTranslation(["InviteDialog", "Common", "Translations"])(
      observer(InviteInput),
    ),
  ),
);
