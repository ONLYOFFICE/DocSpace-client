import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { TextInput } from "@docspace/shared/components/text-input";
import { Button } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";

import { ChangeNameContainer } from "./StyledChangeName";

const ChangeNameDialog = (props) => {
  const { t, ready } = useTranslation([
    "ProfileAction",
    "PeopleTranslations",
    "Common",
  ]);
  const {
    visible,
    onClose,
    profile,
    updateProfile,
    updateProfileInUsers,
    fromList,
    userNameRegex,
  } = props;
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [isSaving, setIsSaving] = useState(false);

  const nameRegex = new RegExp(userNameRegex, "gu");

  const [isNameValid, setIsNameValid] = useState(true);
  const [isSurnameValid, setIsSurnameValid] = useState(true);

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

  const onKeyDown = (e) => {
    if (e.keyCode === 13 || e.which === 13) onSaveClick();
  };

  const onSaveClick = async () => {
    if (
      !isNameValid ||
      !isSurnameValid ||
      firstName.trim().length === 0 ||
      lastName.trim().length === 0
    )
      return;

    const newProfile = profile;
    newProfile.firstName = firstName;
    newProfile.lastName = lastName;

    try {
      setIsSaving(true);
      const currentProfile = await updateProfile(newProfile);
      fromList && (await updateProfileInUsers(currentProfile));
      toastr.success(t("Common:ChangesSavedSuccessfully"));
    } catch (error) {
      console.error(error);
      toastr.error(error);
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  return (
    <ChangeNameContainer
      isLoading={!ready}
      visible={visible}
      onClose={onCloseAction}
      displayType="modal"
    >
      <ModalDialog.Header>
        {t("PeopleTranslations:NameChangeButton")}
      </ModalDialog.Header>
      <ModalDialog.Body className="change-name-dialog-body">
        <FieldContainer
          isVertical
          labelText={t("Common:FirstName")}
          className="field"
          hasError={!isNameValid}
          errorMessage={
            firstName.trim().length === 0
              ? t("Common:RequiredField")
              : t("Common:IncorrectFirstName")
          }
        >
          <TextInput
            className="first-name"
            scale={true}
            isAutoFocussed={true}
            value={firstName}
            onChange={handleNameChange}
            placeholder={t("Common:FirstName")}
            isDisabled={isSaving}
            onKeyDown={onKeyDown}
            tabIndex={1}
            hasError={!isNameValid}
          />
        </FieldContainer>

        <FieldContainer
          isVertical
          labelText={t("Common:LastName")}
          className="field"
          hasError={!isSurnameValid}
          errorMessage={
            lastName.trim().length === 0
              ? t("Common:RequiredField")
              : t("Common:IncorrectLastName")
          }
        >
          <TextInput
            className="last-name"
            scale={true}
            value={lastName}
            onChange={handleSurnameChange}
            placeholder={t("Common:LastName")}
            isDisabled={isSaving}
            onKeyDown={onKeyDown}
            tabIndex={2}
            hasError={!isSurnameValid}
          />
        </FieldContainer>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          className="save"
          key="ChangeNameSaveBtn"
          label={t("Common:SaveButton")}
          size="normal"
          scale
          primary={true}
          onClick={onSaveClick}
          isLoading={isSaving}
          tabIndex={3}
          isDisabled={
            !isNameValid ||
            !isSurnameValid ||
            firstName.trim().length === 0 ||
            lastName.trim().length === 0
          }
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
        />
      </ModalDialog.Footer>
    </ChangeNameContainer>
  );
};

export default inject(({ peopleStore, settingsStore }) => {
  const { updateProfile } = peopleStore.targetUserStore;

  const { updateProfileInUsers } = peopleStore.usersStore;

  const { userNameRegex } = settingsStore;

  return { updateProfile, updateProfileInUsers, userNameRegex };
})(observer(ChangeNameDialog));
