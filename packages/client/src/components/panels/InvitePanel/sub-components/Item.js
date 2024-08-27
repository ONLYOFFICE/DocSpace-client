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

import InfoEditReactSvgUrl from "PUBLIC_DIR/images/info.edit.react.svg?url";
import AtReactSvgUrl from "PUBLIC_DIR/images/@.react.svg?url";
import AlertSvgUrl from "PUBLIC_DIR/images/icons/12/alert.react.svg?url";

import React, { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";

import { Avatar } from "@docspace/shared/components/avatar";
import { Text } from "@docspace/shared/components/text";
import { parseAddresses } from "@docspace/shared/utils";
import { getUserTypeLabel } from "@docspace/shared/utils/common";

import {
  getAccessOptions,
  getFreeUsersRoleArray,
  getFreeUsersTypeArray,
} from "../utils";
import {
  StyledEditInput,
  StyledEditButton,
  StyledCheckIcon,
  StyledCrossIcon,
  StyledHelpButton,
  StyledDeleteIcon,
  StyledInviteUserBody,
  ErrorWrapper,
} from "../StyledInvitePanel";
import { filterGroupRoleOptions, filterUserRoleOptions } from "SRC_DIR/helpers";
import AccessSelector from "../../../AccessSelector";

import PaidQuotaLimitError from "SRC_DIR/components/PaidQuotaLimitError";

const Item = ({
  t,
  item,
  theme,
  setInviteItems,
  inviteItems,
  changeInviteItem,
  setHasErrors,
  roomType,
  isOwner,
  inputsRef,
  setIsOpenItemAccess,
  isMobileView,
  standalone,
  isPaidUserAccess,
  setInvitePaidUsersCount,
  isUserTariffLimit,
  roomId,
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
    isVisitor,
  } = item;

  const name = isGroup
    ? groupName
    : !!avatar
      ? displayName !== ""
        ? displayName
        : email
      : email;
  const source = !!avatar ? avatar : isGroup ? "" : AtReactSvgUrl;

  const [edit, setEdit] = useState(false);
  const [inputValue, setInputValue] = useState(name);
  const [parseErrors, setParseErrors] = useState(errors);

  const accesses = getAccessOptions(
    t,
    roomType,
    true,
    true,
    isOwner,
    standalone,
  );

  const filteredAccesses = item.isGroup
    ? filterGroupRoleOptions(accesses)
    : filterUserRoleOptions(accesses, item, true);

  const defaultAccess = filteredAccesses.find(
    (option) => option.access === +access,
  );
  const getUserType = (item) => {
    if (item.isOwner) return "owner";
    if (item.isAdmin) return "admin";
    if (item.isRoomAdmin) return "manager";
    if (item.isCollaborator) return "collaborator";
    return "user";
  };

  const type = getUserType(item);

  const typeLabel = item?.isEmailInvite
    ? getUserTypeLabel(defaultAccess.type, t)
    : (type === "user" && defaultAccess?.type !== type) ||
        (defaultAccess?.type === "manager" && type !== "admin")
      ? getUserTypeLabel(defaultAccess.type, t)
      : getUserTypeLabel(type, t);

  const errorsInList = () => {
    const hasErrors = inviteItems.some((item) => !!item.errors?.length);
    setHasErrors(hasErrors);
  };

  const onEdit = (e) => {
    if (e.detail === 2) {
      setEdit(true);
    }
  };

  const cancelEdit = (e) => {
    setInputValue(name);
    setEdit(false);
  };

  const saveEdit = (e) => {
    const value = inputValue === "" ? name : inputValue;

    setEdit(false);
    validateValue(value);
  };

  const onKeyPress = (e) => {
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

  const validateValue = (value) => {
    const email = parseAddresses(value);
    const parseErrors = email[0].parseErrors;
    const errors = !!parseErrors.length ? parseErrors : [];

    setParseErrors(errors);
    changeInviteItem({ id, email: value, errors, access }).then(() =>
      errorsInList(),
    );
  };

  const changeValue = (e) => {
    const value = e.target.value.trim();

    setInputValue(value);
  };

  const hasError = parseErrors && !!parseErrors.length;

  const removeItem = () => {
    const newItems = inviteItems.filter((item) => item.id !== id);

    if (isPaidUserAccess(item.access)) setInvitePaidUsersCount(-1);

    setInviteItems(newItems);
  };

  const selectItemAccess = (selected) => {
    if (selected.key === "remove") return removeItem();

    changeInviteItem({ id, access: selected.access });
  };

  const textProps = !!avatar || isGroup ? {} : { onClick: onEdit };

  const availableAccess =
    roomId === -1 ? getFreeUsersTypeArray() : getFreeUsersRoleArray();

  const displayBody = (
    <>
      <StyledInviteUserBody>
        <Text {...textProps} truncate noSelect>
          {inputValue}
        </Text>

        {!isGroup && (
          <Text
            className="label about-label"
            fontWeight={400}
            fontSize="12px"
            noSelect
            truncate
          >
            {`${typeLabel} | ${email}`}
          </Text>
        )}
      </StyledInviteUserBody>

      {hasError ? (
        <ErrorWrapper>
          <StyledHelpButton
            iconName={InfoEditReactSvgUrl}
            displayType="auto"
            offsetRight={0}
            tooltipContent={t("EmailErrorMessage")}
            openOnClick={false}
            size={16}
            color={theme.infoPanel.errorColor}
          />
          <StyledDeleteIcon
            className="delete-icon"
            size="medium"
            onClick={removeItem}
          />
        </ErrorWrapper>
      ) : (
        <>
          {warning && (
            <div className="warning">
              <StyledHelpButton
                tooltipContent={warning}
                iconName={AlertSvgUrl}
              />
            </div>
          )}
          <AccessSelector
            className="user-access"
            t={t}
            roomType={roomType}
            defaultAccess={defaultAccess?.access}
            onSelectAccess={selectItemAccess}
            containerRef={inputsRef}
            isOwner={isOwner}
            withRemove={true}
            filteredAccesses={filteredAccesses}
            setIsOpenItemAccess={setIsOpenItemAccess}
            isMobileView={isMobileView}
            noBorder
            {...((roomId === -1 || !avatar || isVisitor) && {
              isSelectionDisabled: isUserTariffLimit,
              selectionErrorText: <PaidQuotaLimitError />,
              availableAccess,
            })}
          />
        </>
      )}
    </>
  );

  const okIcon = <StyledCheckIcon size="scale" />;
  const cancelIcon = <StyledCrossIcon size="scale" />;

  const editBody = (
    <>
      <StyledEditInput value={inputValue} onChange={changeValue} />
      <StyledEditButton icon={okIcon} onClick={saveEdit} />
      <StyledEditButton icon={cancelIcon} onClick={cancelEdit} />
    </>
  );

  return (
    <>
      <Avatar
        size="min"
        role={type}
        source={source}
        isGroup={isGroup}
        userName={groupName}
      />
      {edit ? editBody : displayBody}
    </>
  );
};

export default inject(({ dialogsStore, currentQuotaStore }) => {
  const { isPaidUserAccess, setInvitePaidUsersCount, invitePanelOptions } =
    dialogsStore;
  const { isUserTariffLimit } = currentQuotaStore;

  return {
    isPaidUserAccess,
    setInvitePaidUsersCount,
    isUserTariffLimit,
    roomId: invitePanelOptions.roomId,
  };
})(observer(Item));
