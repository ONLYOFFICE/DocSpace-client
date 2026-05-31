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

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";
import { TextInput } from "@docspace/ui-kit/components/text-input";
import { Button } from "@docspace/ui-kit/components/button";
import { toastr } from "@docspace/ui-kit/components/toast";

import styles from "./change-name.module.scss";

const ChangeNameDialog = (props) => {
	const {
		visible,
		onClose,
		profile,
		updateProfile,
		updateProfileInUsers,
		userNameRegex,
		fromList,
	} = props;

	const { t, ready } = useTranslation(["PeopleTranslations", "Common"]);
	const [firstName, setFirstName] = useState(profile.firstName);
	const [lastName, setLastName] = useState(profile.lastName);
	const [isSaving, setIsSaving] = useState(false);

	const nameRegex = new RegExp(userNameRegex, "gu");

	const [isNameValid, setIsNameValid] = useState(true);
	const [isSurnameValid, setIsSurnameValid] = useState(true);

	const isLastNameFirst =
		profile.displayName &&
		profile.firstName &&
		profile.lastName &&
		profile.displayName.trim().indexOf(profile.lastName.trim()) <
			profile.displayName.trim().indexOf(profile.firstName.trim());

	const handleNameChange = (e) => {
		setFirstName(e.target.value);
		setIsNameValid(nameRegex.test(e.target.value.trim()));
	};
	const handleSurnameChange = (e) => {
		setLastName(e.target.value);
		setIsSurnameValid(nameRegex.test(e.target.value.trim()));
	};

	const onCloseAction = () => {
		if (!isSaving) {
			onClose();
		}
	};

	const onSaveClick = async () => {
		if (
			!isNameValid ||
			!isSurnameValid ||
			firstName.trim().length === 0 ||
			lastName.trim().length === 0
		)
			return;

		setIsSaving(true);

		try {
			const newProfile = profile;
			newProfile.firstName = firstName.trim();
			newProfile.lastName = lastName.trim();

			const currentProfile = await updateProfile(newProfile);
			fromList && (await updateProfileInUsers(currentProfile));
			toastr.success(t("Common:ChangesSavedSuccessfully"));

			setIsSaving(false);
			onClose();
		} catch (error) {
			toastr.error(error);
			setIsSaving(false);
		}
	};

	const onKeyDown = (e) => {
		if (e.keyCode === 13 || e.which === 13) onSaveClick();
	};

	return (
		<ModalDialog
			isLoading={!ready}
			visible={visible}
			onClose={onCloseAction}
			displayType="modal"
		>
			<ModalDialog.Header>
				{t("PeopleTranslations:NameChangeButton")}
			</ModalDialog.Header>
			<ModalDialog.Body>
				<div className={styles.content}>
					{(() => {
						const fields = [
							{
								id: "firstName",
								label: t("Common:FirstName"),
								value: firstName,
								onChange: handleNameChange,
								placeholder: t("Common:FirstName"),
								hasError: !isNameValid,
								errorMessage:
									firstName.trim().length === 0
										? t("Common:RequiredField")
										: t("Common:IncorrectFirstName"),
								className: "first-name",
								dataTestId: "change_name_first_name_field",
							},
							{
								id: "lastName",
								label: t("Common:LastName"),
								value: lastName,
								onChange: handleSurnameChange,
								placeholder: t("Common:LastName"),
								hasError: !isSurnameValid,
								errorMessage:
									lastName.trim().length === 0
										? t("Common:RequiredField")
										: t("Common:IncorrectLastName"),
								className: "last-name",
								dataTestId: "change_name_last_name_field",
							},
						];

						const orderedFields = isLastNameFirst
							? [fields[1], fields[0]]
							: fields;

						return orderedFields.map((field, index) => (
							<FieldContainer
								key={field.id}
								isVertical
								labelText={field.label}
								className={styles.field}
								hasError={field.hasError}
								errorMessage={field.errorMessage}
								dataTestId={field.dataTestId}
							>
								<TextInput
									className={field.className}
									name={field.id}
									scale
									isAutoFocussed={index === 0}
									value={field.value}
									onChange={field.onChange}
									placeholder={field.placeholder}
									isDisabled={isSaving}
									onKeyDown={onKeyDown}
									tabIndex={index + 1}
									hasError={field.hasError}
									testId={`${field.dataTestId}_input`}
								/>
							</FieldContainer>
						));
					})()}
				</div>
			</ModalDialog.Body>
			<ModalDialog.Footer>
				<Button
					className="save"
					key="ChangeNameSaveBtn"
					label={t("Common:SaveButton")}
					size="normal"
					scale
					primary
					onClick={onSaveClick}
					isLoading={isSaving}
					tabIndex={3}
					isDisabled={
						!isNameValid ||
						!isSurnameValid ||
						firstName.trim().length === 0 ||
						lastName.trim().length === 0
					}
					testId="dialog_change_name_save_button"
				/>
				<Button
					className="cancel-button"
					key="CloseBtn"
					label={t("Common:CancelButton")}
					size="normal"
					scale
					onClick={onClose}
					isDisabled={isSaving}
					tabIndex={4}
					testId="dialog_change_name_cancel_button"
				/>
			</ModalDialog.Footer>
		</ModalDialog>
	);
};

export default inject(({ peopleStore, settingsStore }) => {
	const { updateProfile } = peopleStore.targetUserStore;

	const { updateProfileInUsers } = peopleStore.usersStore;

	const { userNameRegex } = settingsStore;

	return { updateProfile, updateProfileInUsers, userNameRegex };
})(observer(ChangeNameDialog));
