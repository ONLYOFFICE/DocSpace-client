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

import React from "react";
import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";
import { toastr } from "@docspace/shared/components/toast";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Button } from "@docspace/shared/components/button";
import { Link } from "@docspace/shared/components/link";
import { Text } from "@docspace/shared/components/text";

import { withTranslation, Trans } from "react-i18next";
import { sendInstructionsToChangePassword } from "@docspace/shared/api/people";

class ChangePasswordDialogComponent extends React.Component {
  constructor() {
    super();

    this.state = {
      isRequestRunning: false,
    };
  }
  onSendPasswordChangeInstructions = () => {
    const { email, onClose } = this.props;

    this.setState({ isRequestRunning: true }, () => {
      sendInstructionsToChangePassword(email)
        .then((res) => {
          toastr.success(res);
        })
        .catch((error) => toastr.error(error))
        .finally(() => {
          this.setState({ isRequestRunning: false }, () => onClose());
        });
    });
  };

  keyPress = (e) => {
    if (e.keyCode === 13) {
      this.onSendPasswordChangeInstructions();
    }
  };

  componentDidMount() {
    addEventListener("keydown", this.keyPress, false);
  }

  componentWillUnmount() {
    removeEventListener("keydown", this.keyPress, false);
  }

  onClose = () => {
    const { onClose } = this.props;
    const { isRequestRunning } = this.state;

    if (!isRequestRunning) {
      onClose();
    }
  };

  render() {
    // console.log("ChangePasswordDialog render");
    const { t, tReady, visible, email, onClose, currentColorScheme } =
      this.props;
    const { isRequestRunning } = this.state;

    return (
      <ModalDialog
        isLoading={!tReady}
        visible={visible}
        onClose={this.onClose}
        displayType="modal"
      >
        <ModalDialog.Header>{t("PasswordChangeTitle")}</ModalDialog.Header>
        <ModalDialog.Body>
          <Text fontSize="13px">
            <Trans
              i18nKey="MessageSendPasswordChangeInstructionsOnEmail"
              ns="ChangePasswordDialog"
              t={t}
            >
              Send the password change instructions to the
              <Link
                className="email-link"
                type="page"
                href={`mailto:${email}`}
                noHover
                color={currentColorScheme.main?.accent}
                title={email}
              >
                {{ email }}
              </Link>
              email address
            </Trans>
          </Text>
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <Button
            className="send"
            key="ChangePasswordSendBtn"
            label={t("Common:SendButton")}
            size="normal"
            scale
            primary={true}
            onClick={this.onSendPasswordChangeInstructions}
            isLoading={isRequestRunning}
          />
          <Button
            className="cancel-button"
            key="CloseBtn"
            label={t("Common:CancelButton")}
            size="normal"
            scale
            onClick={onClose}
            isDisabled={isRequestRunning}
          />
        </ModalDialog.Footer>
      </ModalDialog>
    );
  }
}

const ChangePasswordDialog = inject(({ settingsStore }) => ({
  currentColorScheme: settingsStore.currentColorScheme,
}))(
  observer(
    withTranslation(["ChangePasswordDialog", "Common"])(
      ChangePasswordDialogComponent,
    ),
  ),
);

ChangePasswordDialog.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  email: PropTypes.string.isRequired,
};

export default ChangePasswordDialog;
