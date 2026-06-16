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

import InfoEditReactSvgUrl from "PUBLIC_DIR/images/info.edit.react.svg?url";
import AtReactSvgUrl from "PUBLIC_DIR/images/@.react.svg?url";
import InfoRoleSvgUrl from "PUBLIC_DIR/images/info.role.react.svg?url";
import DeleteIcon from "PUBLIC_DIR/images/mobile.actions.remove.react.svg";
import CheckIcon from "PUBLIC_DIR/images/check.edit.react.svg";
import CrossIcon from "PUBLIC_DIR/images/cross.edit.react.svg";

import { useState, useEffect, useCallback } from "react";
import classNames from "classnames";

import { Avatar } from "@docspace/ui-kit/components/avatar";
import {
  AvatarRole,
  AvatarSize,
} from "@docspace/ui-kit/components/avatar/Avatar.enums";
import { Text } from "@docspace/ui-kit/components/text";
import { Encoder } from "@docspace/ui-kit/utils/encoder";
import { parseAddresses } from "@docspace/shared/utils";
import {
  getUserType,
  getUserTypeTranslation,
} from "@docspace/shared/utils/common";
import { getMembersList } from "@docspace/shared/api/people";
import {
  AccountsSearchArea,
  EmployeeStatus,
  EmployeeType,
  RoomsType,
} from "@docspace/shared/enums";
import { toastr } from "@docspace/ui-kit/components/toast";
import { HelpButton } from "@docspace/ui-kit/components/help-button";
import { TextInput } from "@docspace/ui-kit/components/text-input";
import { InputType } from "@docspace/ui-kit/components/text-input/TextInput.enums";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { getAccessOptions } from "@docspace/shared/utils/getAccessOptions";
import type { TOption } from "@docspace/ui-kit/components/combobox";

import { filterPaidRoleOptions } from "@docspace/shared/utils/filterPaidRoleOptions";
import { filterNotReadOnlyOptions } from "@docspace/shared/utils/filterNotReadOnlyOptions";
import Filter from "@docspace/shared/api/people/filter";
import type { TTranslation } from "@docspace/shared/types";

import type { InviteItem } from "../index";
import AccessSelector from "./AccessSelector";
import styles from "../InvitePanel.module.scss";
import {
  getFreeUsersRoleArray,
  getTopFreeRole,
  getViewerRole,
  isPaidUserRole,
} from "../utils";

export type ItemProps = {
  t: TTranslation;
  item: InviteItem;
  index: number;
  inviteItems: InviteItem[];
  setInviteItems: (items: InviteItem[]) => void;
  changeInviteItem: (
    update: Partial<InviteItem> & { id: string | number },
    addExisting?: boolean,
    oldId?: string | number | null,
  ) => Promise<void>;
  setHasErrors: (v: boolean) => void;
  roomType: RoomsType | -1;
  roomId: number;
  isOwner: boolean;
  isAdmin: boolean;
  inputsRef: React.RefObject<HTMLDivElement | null>;
  setIsOpenItemAccess: (v: boolean) => void;
  isMobileView: boolean;
  allowInvitingGuests: boolean;
  style?: React.CSSProperties;
};

type AccessOption = TOption & {
  access?: number;
  type?: EmployeeType;
  isSeparator?: boolean;
};

const Item: React.FC<ItemProps> = ({
  t,
  item,
  index,
  setInviteItems,
  inviteItems,
  changeInviteItem,
  setHasErrors,
  roomType,
  roomId,
  style,
  isOwner,
  isAdmin,
  inputsRef,
  setIsOpenItemAccess,
  isMobileView,
  allowInvitingGuests,
}) => {
  const {
    avatar,
    displayName,
    email,
    id,
    errors,
    access,
    isGroup,
    name: groupName,
    warning,
    status,
    isEmailInvite,
    userType,
  } = item;

  const name = isGroup
    ? groupName
    : avatar
      ? displayName !== ""
        ? displayName
        : email
      : email;
  const source = avatar || (isGroup ? "" : AtReactSvgUrl);

  const [edit, setEdit] = useState(false);
  const [inputValue, setInputValue] = useState(name ?? "");
  const [parseErrors, setParseErrors] = useState(errors);

  const [searchRequestRunning, setSearchRequestRunning] = useState(false);
  const [isSharedUser, setIsSharedUser] = useState(false);
  const [userExistsOnPortal, setUserExistsOnPortal] =
    useState<InviteItem | null>(null);

  const searchByQuery = async (value: string) => {
    if (!value) {
      setSearchRequestRunning(false);
      setIsSharedUser(false);
      return;
    }

    const filter = Filter.getDefault();
    filter.search = value;

    const users = await getMembersList(
      AccountsSearchArea.People,
      roomId,
      filter,
    );

    setSearchRequestRunning(false);

    const user = (users.items as InviteItem[]).find(
      (userItem) => userItem.email === value,
    );

    setIsSharedUser(!!(user && user?.shared));
    setUserExistsOnPortal(user ?? null);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value: string) => searchByQuery(value), 300),
    [],
  );

  const type: EmployeeType | undefined = isEmailInvite
    ? (userType as EmployeeType | undefined)
    : ((getUserType(item as Parameters<typeof getUserType>[0]) ?? userType) as
        | EmployeeType
        | undefined);

  // standalone = false always in SDK
  const accesses = getAccessOptions(
    t,
    roomType as RoomsType,
    true,
    true,
    isOwner,
    isAdmin,
    false,
  ) as AccessOption[];

  const isRolePaid = isPaidUserRole(access);
  const isUserRolesFiltered =
    isRolePaid && (type === EmployeeType.Guest || type === EmployeeType.User);

  const isReadOnlyFiltered =
    roomType === RoomsType.AIRoom && type === EmployeeType.Guest;

  const isGroupRoleFiltered = isRolePaid && item.isGroup;

  // Cast to the narrower type filterNotReadOnlyOptions / filterPaidRoleOptions expect
  type NarrowOption = Parameters<typeof filterNotReadOnlyOptions>[0][number];
  const accessesNarrow = accesses as unknown as NarrowOption[];

  const filteredAccesses: AccessOption[] = isReadOnlyFiltered
    ? (filterNotReadOnlyOptions(accessesNarrow) as unknown as AccessOption[])
    : item.isGroup ||
        isUserRolesFiltered ||
        type === EmployeeType.Guest ||
        type === EmployeeType.User
      ? (filterPaidRoleOptions(
          accesses as unknown as Parameters<typeof filterPaidRoleOptions>[0],
        ) as unknown as AccessOption[])
      : accesses;

  const defaultAccessOption: AccessOption | undefined = isReadOnlyFiltered
    ? (getViewerRole(t, roomType as RoomsType) as AccessOption | undefined)
    : isUserRolesFiltered || isGroupRoleFiltered
      ? (getTopFreeRole(t, roomType as RoomsType) as AccessOption | undefined)
      : filteredAccesses.find((option) => option.access === +access);

  const resolvedType = type ?? EmployeeType.User;

  const typeLabel = isEmailInvite
    ? isRolePaid
      ? getUserTypeTranslation(defaultAccessOption?.type ?? resolvedType, t)
      : t("Common:Guest")
    : (defaultAccessOption?.type as number) ===
          (EmployeeType.RoomAdmin as number) &&
        (resolvedType as number) !== (EmployeeType.Admin as number) &&
        (resolvedType as number) !== (EmployeeType.Owner as number)
      ? getUserTypeTranslation(EmployeeType.RoomAdmin, t)
      : getUserTypeTranslation(resolvedType, t);

  const errorsInList = () => {
    const hasErrors = inviteItems.some((elm) => !!elm.errors?.length);
    const needRemoveGuests = !allowInvitingGuests
      ? inviteItems.some(
          (inviteItem) =>
            inviteItem.userType === EmployeeType.Guest && !inviteItem.status,
        )
      : false;

    setHasErrors(hasErrors || needRemoveGuests);
  };

  const onEdit = (e: React.MouseEvent) => {
    if (e.detail === 2) {
      setEdit(true);
    }
  };

  const cancelEdit = () => {
    setInputValue(name ?? "");
    setEdit(false);
    setSearchRequestRunning(false);
    setIsSharedUser(false);
  };

  const validateValue = (value: string) => {
    const parsedEmail = parseAddresses(value);
    const validationErrors = parsedEmail[0]?.parseErrors ?? [];
    const currentErrors = validationErrors.length
      ? (validationErrors as unknown as InviteItem["errors"])
      : [];

    setParseErrors(currentErrors as typeof parseErrors);

    const newValue: Partial<InviteItem> & { id: string | number } =
      userExistsOnPortal
        ? { ...userExistsOnPortal }
        : {
            id,
            email: value,
            errors: currentErrors as InviteItem["errors"],
            access,
          };

    const addExisting = !!userExistsOnPortal;
    const oldId = addExisting ? id : null;

    changeInviteItem(newValue, addExisting, oldId).then(() => errorsInList());
  };

  const saveEdit = async () => {
    if (searchRequestRunning) return;

    if (isSharedUser) {
      return toastr.warning(t("Common:UsersAlreadyAdded"));
    }

    const value = inputValue === "" ? (name ?? "") : inputValue;

    setEdit(false);
    validateValue(value);
  };

  const onKeyPress = (e: KeyboardEvent) => {
    if (edit) {
      if (e.key === "Enter") {
        saveEdit();
      }
    }
  };

  useEffect(() => {
    document.addEventListener("keyup", onKeyPress);
    return () => document.removeEventListener("keyup", onKeyPress);
  });

  const changeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();

    setInputValue(value);
    setSearchRequestRunning(true);
    debouncedSearch(value);
  };

  const hasError = parseErrors && !!parseErrors.length;

  const removeItem = () => {
    const newItems = inviteItems.filter((inviteItem) => inviteItem.id !== id);
    setInviteItems(newItems);
  };

  const selectItemAccess = (selected: AccessOption) => {
    if (selected.key === "remove") return removeItem();
    changeInviteItem({ id, access: selected.access ?? access });
  };

  const textProps = avatar || isGroup ? {} : { onClick: onEdit };

  const availableAccess = getFreeUsersRoleArray();

  const hasNotFoundEmail = isGroup
    ? false
    : !allowInvitingGuests && type === EmployeeType.Guest && !status;

  // Hoist casts that contain type parameters out of JSX to avoid parser confusion.
  const setIsOpenItemAccessCast = setIsOpenItemAccess as React.Dispatch<
    React.SetStateAction<boolean>
  >;
  const selectItemAccessCast = selectItemAccess as (access: TOption) => void;
  // Compute avatar role as a plain string to avoid any `as EnumType` cast
  // inside JSX attributes (which the JSX parser misreads as a tag).
  const avatarRoleStr = (type as string | undefined) ?? AvatarRole.none;

  const displayBody = (
    <>
      <div className={styles.inviteUserBody}>
        <div
          className={classNames(styles.inviteUserBox, {
            [styles.isGroup]: isGroup,
          })}
        >
          <Text {...textProps} truncate>
            {Encoder.htmlDecode(inputValue ?? "")}
          </Text>
        </div>

        {!isGroup ? (
          <Text
            className={styles.aboutLabel}
            fontWeight={400}
            fontSize="12px"
            truncate
          >
            {`${typeLabel} | ${email}`}
          </Text>
        ) : null}
      </div>

      {hasError || hasNotFoundEmail ? (
        <div className={styles.errorWrapper}>
          <HelpButton
            className={styles.helpButton}
            iconName={InfoEditReactSvgUrl}
            offsetRight={0}
            tooltipContent={
              hasNotFoundEmail
                ? t("Common:EmailErrorMessageUserNotFound")
                : t("Common:EmailErrorMessage")
            }
            openOnClick={false}
            size={16}
            color="--warning-color"
          />
          <DeleteIcon
            className={classNames(styles.rowIcons, {
              [styles.isClicked]: true,
            })}
            size="medium"
            onClick={removeItem}
            data-testid="invite_panel_item_delete_button"
          />
        </div>
      ) : (
        <div className={styles.roleAccess}>
          {warning ? (
            <div className={styles.roleWarning}>
              <HelpButton
                className={styles.helpButton}
                tooltipContent={warning}
                iconName={InfoRoleSvgUrl}
                size={16}
              />
            </div>
          ) : null}
          <AccessSelector
            className="user-access"
            t={t}
            roomType={roomType}
            defaultAccess={defaultAccessOption?.access}
            onSelectAccess={selectItemAccessCast}
            containerRef={inputsRef}
            isOwner={isOwner}
            withRemove
            filteredAccesses={filteredAccesses as TOption[]}
            setIsOpenItemAccess={setIsOpenItemAccessCast}
            isMobileView={isMobileView}
            noBorder
            isAdmin={isAdmin}
            availableAccess={availableAccess}
            dataTestId="invite_panel_item_access_selector"
          />
        </div>
      )}
    </>
  );

  const editBody = (
    <>
      <TextInput
        className={styles.editBodyInputStyles}
        value={inputValue}
        onChange={changeValue}
        scale
        type={InputType.text}
        testId="invite_panel_item_edit_input"
      />
      <IconButton
        className={styles.editButton}
        iconNode={<CheckIcon className={styles.rowIcons} size="scale" />}
        isDisabled={searchRequestRunning}
        onClick={saveEdit}
        dataTestId="invite_panel_item_save_button"
      />
      <IconButton
        className={styles.editButton}
        iconNode={<CrossIcon className={styles.rowIcons} size="scale" />}
        onClick={cancelEdit}
        dataTestId="invite_panel_item_cancel_button"
      />
    </>
  );

  return (
    <div
      key={item.id}
      style={style}
      className={classNames("row-item", styles.rowItem, styles.styledRow, {
        [styles.isEdit]: edit,
        [styles.hasWarning]: !!item.warning,
      })}
      data-testid={`invite_panel_item_${index}`}
    >
      <Avatar
        size={AvatarSize.min}
        role={avatarRoleStr as AvatarRole}
        source={source ?? undefined}
        isGroup={isGroup}
        userName={groupName}
        dataTestId={`invite_panel_item_avatar_${index}`}
      />
      {edit ? editBody : displayBody}
    </div>
  );
};

export default Item;

