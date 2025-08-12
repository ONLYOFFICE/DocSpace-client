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
import Filter from "@docspace/shared/api/people/filter";
import { getMembersList } from "@docspace/shared/api/people";
import {
  AccountsSearchArea,
  EmployeeType,
  RoomsType,
} from "@docspace/shared/enums";
import { TTranslation } from "@docspace/shared/types";
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

type InviteInputProps = {
  t: TTranslation;
  roomId: string | number;

  roomType: RoomsType;
  inviteItems: TSelectorItem[];
  setInviteItems: (items: TSelectorItem[]) => void;
  setAddUsersPanelVisible: (visible: boolean) => void;
  isDisabled: boolean;
};

const InviteInput = ({
  t,
  roomId,
  roomType,
  inviteItems,
  setInviteItems,
  setAddUsersPanelVisible,
  isDisabled,
}: InviteInputProps) => {
  const [inputValue, setInputValue] = useState("");

  const [usersList, setUsersList] = useState<(TUser | TGroup)[]>([]);
  const [isAddEmailPanelBlocked, setIsAddEmailPanelBlocked] = useState(true);
  const [dropDownWidth, setDropDownWidth] = useState(0);
  const [searchRequestRunning, setSearchRequestRunning] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

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
      const query = value.trim();

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

        filter.role = [EmployeeType.Admin, EmployeeType.RoomAdmin];
        filter.search = query;

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

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChangeInput(value);
  };

  const getItemContent = useCallback(
    (item: TUser | TGroup) => {
      const { id, shared } = item;

      const addUser = () => {
        if (shared) {
          toastr.warning(t("UsersAlreadyAdded"));
        } else {
          setInviteItems([item, ...inviteItems] as TSelectorItem[]);
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
            source={(item as TUser).avatar}
            userName={(item as TGroup).name}
            isGroup={(item as TGroup).isGroup}
          />

          <div className="list-item_content">
            <div className="list-item_content-box">
              <SearchItemText $primary disabled={shared}>
                {"displayName" in item ? item.displayName : item.name}
              </SearchItemText>
            </div>
            <SearchItemText>{(item as TUser).email}</SearchItemText>
          </div>
          {shared ? (
            <SearchItemText $info>{t("Common:Invited")}</SearchItemText>
          ) : null}
        </DropDownItem>
      );
    },
    [t, inviteItems, setInviteItems],
  );

  const openUsersPanel = () => {
    setInputValue("");
    setAddUsersPanelVisible(true);
    setIsAddEmailPanelBlocked(true);
  };

  const onClearInput = () => onChangeInput("");

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const keyCode = event.code;

    const isAcceptableEvents =
      keyCode === "ArrowUp" || keyCode === "ArrowDown" || keyCode === "Enter";

    if (isAcceptableEvents && inputValue.length > 2) return;

    event.stopPropagation();
  };

  const dropDownContent = useMemo(() => {
    if (searchRequestRunning || !usersList.length) {
      setIsAddEmailPanelBlocked(true);
      return;
    }

    return usersList.map((user) => getItemContent(user));
  }, [usersList, inputValue, getItemContent, searchRequestRunning]);

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
          dataTestId="template_access_settings_choose_from_list_link"
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
            type={InputType.search}
            withBorder={false}
            isDisabled={isDisabled}
            onKeyDown={onKeyDown}
            testId="template_access_settings_search_input"
          />

          <div className="append" onClick={onClearInput}>
            <StyledCrossIcon />
          </div>
        </StyledInviteInput>

        {!isAddEmailPanelBlocked ? (
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
        ) : null}
      </StyledInviteInputContainer>
    </>
  );
};

export default withTranslation(["InviteDialog", "Common", "Translations"])(
  InviteInput,
);
