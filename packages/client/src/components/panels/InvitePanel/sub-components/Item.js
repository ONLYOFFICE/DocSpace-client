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
import debounce from "lodash.debounce";

import InfoEditReactSvgUrl from "PUBLIC_DIR/images/info.edit.react.svg?url";
import AtReactSvgUrl from "PUBLIC_DIR/images/@.react.svg?url";
import InfoRoleSvgUrl from "PUBLIC_DIR/images/info.role.react.svg?url";
import DeleteIcon from "PUBLIC_DIR/images/mobile.actions.remove.react.svg";
import CheckIcon from "PUBLIC_DIR/images/check.edit.react.svg";
import CrossIcon from "PUBLIC_DIR/images/cross.edit.react.svg";

import { useState, useEffect, useCallback } from "react";
import { inject, observer } from "mobx-react";
import classNames from "classnames";

import { Avatar } from "@docspace/ui-kit/components/avatar";
import { Text } from "@docspace/ui-kit/components/text";
import { Encoder } from "@docspace/ui-kit/utils/encoder";
import { parseAddresses } from "@docspace/shared/utils";
import {
	getUserType,
	getUserTypeTranslation,
} from "@docspace/shared/utils/common";
import { getMembersList, getUserList } from "@docspace/shared/api/people";
import {
	AccountsSearchArea,
	EmployeeStatus,
	EmployeeType,
	RoomsType,
} from "@docspace/shared/enums";
import { toastr } from "@docspace/ui-kit/components/toast";
import { HelpButton } from "@docspace/ui-kit/components/help-button";
import { TextInput } from "@docspace/ui-kit/components/text-input";
import { Button } from "@docspace/ui-kit/components/button";
import { getAccessOptions } from "@docspace/shared/utils/getAccessOptions";

import { filterPaidRoleOptions } from "@docspace/shared/utils/filterPaidRoleOptions";
import { filterNotReadOnlyOptions } from "@docspace/shared/utils/filterNotReadOnlyOptions";

import PaidQuotaLimitError from "SRC_DIR/components/PaidQuotaLimitError";
import Filter from "@docspace/shared/api/people/filter";
import { StyledSendClockIcon } from "SRC_DIR/components/Icons";
import AccessSelector from "../../../AccessSelector";

import styles from "../InvitePanel.module.scss";

import {
	getFreeUsersRoleArray,
	getFreeUsersTypeArray,
	getTopFreeRole,
	getViewerRole,
	isPaidUserRole,
} from "../utils";

const Item = ({
	t,
	item,
	index,
	theme,
	setInviteItems,
	inviteItems,
	changeInviteItem,
	setHasErrors,
	roomType,
	isOwner,
	isAdmin,
	inputsRef,
	setIsOpenItemAccess,
	isMobileView,
	standalone,
	isUserTariffLimit,
	roomId,
	style,
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
		isVisitor,
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
	const [inputValue, setInputValue] = useState(name);
	const [parseErrors, setParseErrors] = useState(errors);

	const [searchRequestRunning, setSearchRequestRunning] = useState(false);
	const [isSharedUser, setIsSharedUser] = useState(false);
	const [userExistsOnPortal, setUserExistsOnPortal] = useState(null);

	const searchByQuery = async (value) => {
		if (!value) {
			setSearchRequestRunning(false);
			setIsSharedUser(false);

			return;
		}

		const filter = Filter.getDefault();

		filter.search = value;

		const users =
			roomId === -1
				? await getUserList(filter)
				: await getMembersList(AccountsSearchArea.People, roomId, filter);

		setSearchRequestRunning(false);

		const user = users.items.find((userItem) => userItem.email === value);

		setIsSharedUser(user && (roomId === -1 || user?.shared));

		roomId !== -1 && setUserExistsOnPortal(user);
	};

	const debouncedSearch = useCallback(
		debounce((value) => searchByQuery(value), 300),
		[],
	);

	const type = isEmailInvite ? userType : (getUserType(item) ?? userType);

	const accesses = getAccessOptions(
		t,
		roomType,
		true,
		true,
		isOwner,
		isAdmin,
		standalone,
	);

	const isRolePaid = isPaidUserRole(access);
	const isUserRolesFilterd =
		roomId === -1
			? false
			: isRolePaid &&
				(type === EmployeeType.Guest || type === EmployeeType.User);

	const isReadOnlyFiltered =
		roomType === RoomsType.AIRoom && type === EmployeeType.Guest;

	const isGroupRoleFiltered = isRolePaid && item.isGroup;

	const filteredAccesses =
		roomId === -1
			? accesses
			: isReadOnlyFiltered
				? filterNotReadOnlyOptions(accesses)
				: item.isGroup ||
						isUserRolesFilterd ||
						type === EmployeeType.Guest ||
						type === EmployeeType.User
					? filterPaidRoleOptions(accesses)
					: accesses;

	const defaultAccess = isReadOnlyFiltered
		? getViewerRole(t, roomType)
		: isUserRolesFilterd || isGroupRoleFiltered
			? getTopFreeRole(t, roomType)
			: filteredAccesses.find((option) => option.access === +access);

	const typeLabel = isEmailInvite
		? roomId === -1 || isRolePaid
			? getUserTypeTranslation(roomId !== -1 ? type : defaultAccess.type, t)
			: t("Common:Guest")
		: defaultAccess?.type === EmployeeType.RoomAdmin &&
				type !== EmployeeType.Admin &&
				type !== EmployeeType.Owner
			? getUserTypeTranslation(defaultAccess.type, t)
			: getUserTypeTranslation(type, t);

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

	const onEdit = (e) => {
		if (e.detail === 2) {
			setEdit(true);
		}
	};

	const cancelEdit = () => {
		setInputValue(name);
		setEdit(false);
		setSearchRequestRunning(false);
		setIsSharedUser(false);
	};

	const validateValue = (value) => {
		const parsedEmail = parseAddresses(value);
		const validationErrors = parsedEmail[0].parseErrors;
		const currentErrors = validationErrors.length ? validationErrors : [];

		setParseErrors(currentErrors);

		const newValue = userExistsOnPortal || {
			id,
			email: value,
			errors: currentErrors,
			access,
		};

		const addExisting = !!userExistsOnPortal;
		const oldId = addExisting ? id : null;

		changeInviteItem(newValue, addExisting, oldId).then(() => errorsInList());
	};

	const saveEdit = async () => {
		if (searchRequestRunning) return;

		if (isSharedUser) {
			return toastr.warning(t("UsersAlreadyAdded"));
		}

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

	const changeValue = (e) => {
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

	const selectItemAccess = (selected) => {
		if (selected.key === "remove") return removeItem();

		changeInviteItem({ id, access: selected.access });
	};

	const textProps = !!avatar || isGroup ? {} : { onClick: onEdit };

	const availableAccess =
		roomId === -1 ? getFreeUsersTypeArray() : getFreeUsersRoleArray();

	const hasNotFoundEmail = isGroup
		? false
		: !allowInvitingGuests && type === EmployeeType.Guest && !status;

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
					{status === EmployeeStatus.Pending ? <StyledSendClockIcon /> : null}
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
						displayType="auto"
						offsetRight={0}
						tooltipContent={
							hasNotFoundEmail
								? t("EmailErrorMessageUserNotFound")
								: t("EmailErrorMessage")
						}
						openOnClick={false}
						size={16}
						color={theme.infoPanel.errorColor}
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
						defaultAccess={defaultAccess?.access}
						onSelectAccess={selectItemAccess}
						containerRef={inputsRef}
						isOwner={isOwner}
						withRemove
						filteredAccesses={filteredAccesses}
						setIsOpenItemAccess={setIsOpenItemAccess}
						isMobileView={isMobileView}
						noBorder
						dataTestId="invite_panel_item_access_selector"
						{...((roomId === -1 || !avatar || isVisitor) && {
							isSelectionDisabled: isUserTariffLimit,
							selectionErrorText: <PaidQuotaLimitError />,
							availableAccess,
						})}
					/>
				</div>
			)}
		</>
	);

	const okIcon = <CheckIcon className={styles.rowIcons} size="scale" />;
	const cancelIcon = <CrossIcon className={styles.rowIcons} size="scale" />;

	const editBody = (
		<>
			<TextInput
				className={styles.editBodyInputStyles}
				value={inputValue}
				onChange={changeValue}
				scale
				testId="invite_panel_item_edit_input"
			/>
			<Button
				className={styles.editButton}
				icon={okIcon}
				onClick={saveEdit}
				isDisabled={searchRequestRunning}
				testId="invite_panel_item_save_button"
			/>
			<Button
				className={styles.editButton}
				icon={cancelIcon}
				onClick={cancelEdit}
				testId="invite_panel_item_cancel_button"
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
				size="min"
				role={type}
				source={source}
				isGroup={isGroup}
				userName={groupName}
				dataTestId={`invite_panel_item_avatar_${index}`}
			/>
			{edit ? editBody : displayBody}
		</div>
	);
};

export default inject(({ dialogsStore, currentQuotaStore }) => {
	const { invitePanelOptions } = dialogsStore;
	const { isUserTariffLimit } = currentQuotaStore;

	return {
		isUserTariffLimit,
		roomId: invitePanelOptions.roomId,
	};
})(observer(Item));
