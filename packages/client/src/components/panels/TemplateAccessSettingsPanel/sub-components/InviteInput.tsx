/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import debounce from "lodash/debounce";
import { withTranslation } from "react-i18next";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";

import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/ui-kit/components/avatar";
import { InputType, TextInput } from "@docspace/ui-kit/components/text-input";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { toastr } from "@docspace/ui-kit/components/toast";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { Text } from "@docspace/ui-kit/components/text";
import { Heading } from "@docspace/ui-kit/components/heading";
import { DropDown } from "@docspace/ui-kit/components/drop-down";
import { TSelectorItem } from "@docspace/ui-kit/components/selector";
import Filter from "@docspace/shared/api/people/filter";
import { getMembersList } from "@docspace/shared/api/people";
import { AccountsSearchArea, EmployeeType } from "@docspace/shared/enums";
import { TTranslation } from "@docspace/shared/types";
import { TUser } from "@docspace/shared/api/people/types";
import { TGroup } from "@docspace/shared/api/groups/types";
import CrossIcon from "PUBLIC_DIR/images/cross.edit.react.svg";

import styles from "../TemplateAccessSettingsPanel.module.scss";

const MIN_SEARCH_VALUE = 2;
const ITEM_HEIGHT = 48;

type InviteInputProps = {
  t: TTranslation;
  roomId: string | number;

  inviteItems: TSelectorItem[];
  setInviteItems: (items: TSelectorItem[]) => void;
  setAddUsersPanelVisible: (visible: boolean) => void;
  isDisabled: boolean;
};

const InviteInput = ({
  t,
  roomId,
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

        filter.role = [EmployeeType.Admin, EmployeeType.RoomAdmin];
        filter.search = query;

        const users = await getMembersList(
          AccountsSearchArea.Any,
          roomId,
          filter,
        );

        setUsersList(users.items);

        if (users.total) {
          isBlocked = false;
        }
      }

      setIsAddEmailPanelBlocked(isBlocked);

      setSearchRequestRunning(false);
    },
    [roomId],
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
              <Text
                className={
                  shared
                    ? styles.searchItemTextPrimaryDisabled
                    : styles.searchItemTextPrimary
                }
              >
                {"displayName" in item ? item.displayName : item.name}
              </Text>
            </div>
            <Text className={styles.searchItemTextSecondary}>
              {(item as TUser).email}
            </Text>
          </div>
          {shared ? (
            <Text className={styles.searchItemTextInfo}>
              {t("Common:Invited")}
            </Text>
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
      <Heading
        className={`${styles.subHeader} invite-input-text`}
        fontSize="16px"
        fontWeight={700}
      >
        {t("Files:AddUsersOrGroupsTitle")}

        <Link
          className={`link-list invite-input-text ${styles.link}`}
          fontWeight="600"
          type={LinkType.action}
          isHovered
          onClick={openUsersPanel}
          dataTestId="template_access_settings_choose_from_list_link"
        >
          {t("Translations:ChooseFromList")}
        </Link>
      </Heading>
      <Text className={styles.description}>
        {t("Files:AddUsersOrGroupsDescription")}
      </Text>

      <div className={styles.inviteInputContainer}>
        <div
          ref={searchRef}
          className={`${styles.inviteInput} ${inputValue ? styles.showCross : ""}`}
        >
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
            <CrossIcon className={styles.crossIcon} />
          </div>
        </div>

        {!isAddEmailPanelBlocked ? (
          <DropDown
            style={dropDownWidth ? { width: `${dropDownWidth}px` } : undefined}
            isDefaultMode={false}
            open
            showDisabledItems
            eventTypes="click"
            withBackdrop={false}
            zIndex={399}
            className={`add-manually-dropdown ${styles.addManuallyDropdown} ${searchRequestRunning ? styles.addManuallyDropdownLoading : ""}`}
            {...dropDownMaxHeight}
          >
            {dropDownContent}
          </DropDown>
        ) : null}
      </div>
    </>
  );
};

export default withTranslation(["InviteDialog", "Common", "Translations"])(
  InviteInput,
);
