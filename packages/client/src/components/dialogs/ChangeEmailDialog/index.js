// (c) Copyright Ascensio System SIA 2009-2025
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

import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Button } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { EmailInput } from "@docspace/shared/components/email-input";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { toastr } from "@docspace/shared/components/toast";

import { withTranslation } from "react-i18next";
import { sendInstructionsToChangeEmail } from "@docspace/shared/api/people";

import { ErrorKeys } from "@docspace/shared/enums";
import { inject, observer } from "mobx-react";

const StyledBodyContent = styled.div`
  .text-body {
    margin-bottom: 16px;
  }
`;

class ChangeEmailDialogComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isEmailValid: true,
      isRequestRunning: false,
      email: "",
      hasError: false,
      errorMessage: "",
      emailErrors: [],
    };
  }

  componentDidMount() {
    window.addEventListener("keyup", this.onKeyPress);
  }

  componentWillUnmount() {
    window.removeEventListener("keyup", this.onKeyPress);
  }

  onValidateEmailInput = (result) =>
    this.setState({ isEmailValid: result.isValid, emailErrors: result.errors });

  onChangeEmailInput = (e) => {
    const { hasError } = this.state;
    const email = e.target.value;
    hasError && this.setState({ hasError: false });
    this.setState({ email });
  };

  onSendEmailChangeInstructions = () => {
    const { email } = this.state;
    const {
      user,
      updateProfile,
      updateProfileInUsers,
      fromList,
      profile,
      onClose,
    } = this.props;
    const { id } = user;
    const newProfile = user;
    // newProfile.email = email;

    const isSelf = profile?.id === id;

    this.setState({ isRequestRunning: true }, () => {
      sendInstructionsToChangeEmail(id, email)
        .then(async (res) => {
          toastr.success(res);
          isSelf && (await updateProfile(newProfile));
          fromList && (await updateProfileInUsers(newProfile));
        })
        .catch((error) => toastr.error(error))
        .finally(() => {
          this.setState({ isRequestRunning: false }, () => onClose());
        });
    });
  };

  onValidateEmail = () => {
    const { isEmailValid, email, emailErrors } = this.state;
    const { t, user } = this.props;

    if (email.trim() === "") {
      return this.setState({
        errorMessage: t("Common:IncorrectEmail"),
        hasError: true,
      });
    }

    if (isEmailValid) {
      const sameEmailError = email.toLowerCase() === user.email.toLowerCase();
      if (sameEmailError) {
        this.setState({ errorMessage: t("Common:SameEmail"), hasError: true });
      } else {
        this.setState({ errorMessage: "", hasError: false });
        this.onSendEmailChangeInstructions();
      }
    } else {
      const translatedErrors = emailErrors.map((errorKey) => {
        switch (errorKey) {
          case ErrorKeys.LocalDomain:
            return t("Common:LocalDomain");
          case ErrorKeys.IncorrectDomain:
            return t("Common:IncorrectDomain");
          case ErrorKeys.DomainIpAddress:
            return t("Common:DomainIpAddress");
          case ErrorKeys.PunycodeDomain:
            return t("Common:PunycodeDomain");
          case ErrorKeys.PunycodeLocalPart:
            return t("Common:PunycodeLocalPart");
          case ErrorKeys.IncorrectLocalPart:
            return t("Common:IncorrectLocalPart");
          case ErrorKeys.SpacesInLocalPart:
            return t("Common:SpacesInLocalPart");
          case ErrorKeys.MaxLengthExceeded:
            return t("Common:MaxLengthExceeded");
          case ErrorKeys.IncorrectEmail:
            return t("Common:IncorrectEmail");
          case ErrorKeys.ManyEmails:
            return t("Common:ManyEmails");
          case ErrorKeys.EmptyEmail:
            return t("Common:EmptyEmail");
          default:
            throw new Error("Unknown translation key");
        }
      });
      const errorMessage = translatedErrors[0];
      this.setState({ errorMessage, hasError: true });
    }
  };

  onKeyPress = (event) => {
    const { isRequestRunning } = this.state;
    if (event.key === "Enter" && !isRequestRunning) {
      this.onValidateEmail();
    }
  };

  onClose = () => {
    const { onClose } = this.props;
    const { isRequestRunning } = this.state;

    if (!isRequestRunning) {
      onClose();
    }
  };

  render() {
    const { t, tReady, visible, onClose } = this.props;
    const { isRequestRunning, email, errorMessage, hasError } = this.state;

    return (
      <ModalDialog
        isLoading={!tReady}
        visible={visible}
        onClose={this.onClose}
        displayType="modal"
      >
        <ModalDialog.Header>{t("EmailChangeTitle")}</ModalDialog.Header>
        <ModalDialog.Body className="email-dialog-body">
          <StyledBodyContent>
            <Text className="text-body">{t("EmailActivationDescription")}</Text>
            <FieldContainer
              isVertical
              style={{ margin: "0" }}
              // labelText={t("EnterEmail")}
              errorMessage={errorMessage}
              hasError={hasError}
              labelVisible={false}
              dataTestId="change_email_field"
            >
              <EmailInput
                id="new-email"
                scale
                isAutoFocussed
                value={email}
                onChange={this.onChangeEmailInput}
                onValidateInput={this.onValidateEmailInput}
                onKeyUp={this.onKeyPress}
                hasError={hasError}
                placeholder={t("EnterEmail")}
                testId="change_email_input"
              />
            </FieldContainer>
          </StyledBodyContent>
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <Button
            className="send"
            key="ChangeEmailSendBtn"
            label={t("Common:SendButton")}
            size="normal"
            scale
            primary
            onClick={this.onValidateEmail}
            isLoading={isRequestRunning}
            testId="change_email_send_button"
          />
          <Button
            className="cancel-button"
            key="CloseBtn"
            label={t("Common:CancelButton")}
            size="normal"
            scale
            onClick={onClose}
            isDisabled={isRequestRunning}
            testId="change_email_cancel_button"
          />
        </ModalDialog.Footer>
      </ModalDialog>
    );
  }
}

const ChangeEmailDialog = withTranslation(["ChangeEmailDialog", "Common"])(
  ChangeEmailDialogComponent,
);

ChangeEmailDialog.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
};

export default inject(({ settingsStore, peopleStore, userStore }) => {
  const { updateProfile } = peopleStore.targetUserStore;
  const { updateProfileInUsers } = peopleStore.usersStore;
  const { user: profile } = userStore;

  return {
    updateProfile,
    updateProfileInUsers,
    isTabletView: settingsStore.isTabletView,
    profile,
  };
})(observer(ChangeEmailDialog));
