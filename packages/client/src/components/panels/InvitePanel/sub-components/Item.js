import InfoEditReactSvgUrl from "PUBLIC_DIR/images/info.edit.react.svg?url";
import AtReactSvgUrl from "PUBLIC_DIR/images/@.react.svg?url";
import AlertSvgUrl from "PUBLIC_DIR/images/icons/12/alert.react.svg?url";
import React, { useState, useEffect } from "react";
import { Avatar } from "@docspace/shared/components/avatar";
import { Text } from "@docspace/shared/components/text";

import { parseAddresses } from "@docspace/shared/utils";
import { getAccessOptions } from "../utils";
import { getUserRole, getUserTypeLabel } from "@docspace/shared/utils/common";
import { capitalize } from "lodash";

import {
  StyledEditInput,
  StyledEditButton,
  StyledCheckIcon,
  StyledCrossIcon,
  StyledHelpButton,
  StyledDeleteIcon,
  StyledInviteUserBody,
} from "../StyledInvitePanel";
import { filterGroupRoleOptions, filterUserRoleOptions } from "SRC_DIR/helpers";
import AccessSelector from "./AccessSelector";

const Item = ({
  t,
  item,
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

  const role = getUserRole(item);
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
    changeInviteItem({ id, email: value, errors }).then(() => errorsInList());
  };

  const changeValue = (e) => {
    const value = e.target.value.trim();

    setInputValue(value);
  };

  const hasError = parseErrors && !!parseErrors.length;

  const removeItem = () => {
    const newItems = inviteItems.filter((item) => item.id !== id);

    setInviteItems(newItems);
  };

  const selectItemAccess = (selected) => {
    if (selected.key === "remove") return removeItem();

    changeInviteItem({ id, access: selected.access });
  };

  const textProps = !!avatar || isGroup ? {} : { onClick: onEdit };

  const displayBody = (
    <>
      <StyledInviteUserBody>
        <Text {...textProps} truncate noSelect>
          {inputValue}
        </Text>

        {!isGroup && (
          <Text
            className="label"
            fontWeight={400}
            fontSize="12px"
            noSelect
            color="#A3A9AE"
            truncate
          >
            {`${capitalize(role)} | ${email}`}
          </Text>
        )}
      </StyledInviteUserBody>

      {hasError ? (
        <>
          <StyledHelpButton
            iconName={InfoEditReactSvgUrl}
            displayType="auto"
            offsetRight={0}
            tooltipContent={t("EmailErrorMessage")}
            size={16}
            color="#F21C0E"
          />
          <StyledDeleteIcon
            className="delete-icon"
            size="medium"
            onClick={removeItem}
          />
        </>
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
        role={role}
        source={source}
        isGroup={isGroup}
        userName={groupName}
      />
      {edit ? editBody : displayBody}
    </>
  );
};

export default Item;
