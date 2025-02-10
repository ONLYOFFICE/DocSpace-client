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

import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Button } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { toastr } from "@docspace/shared/components/toast";

import { withTranslation } from "react-i18next";

class ChangePhoneDialogComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isRequestRunning: false,
    };
  }

  // TODO: add real api request for executing change phone
  onChangePhone = () => {
    const { onClose, t } = this.props;
    this.setState({ isRequestRunning: true }, () => {
      toastr.success(t("ChangePhoneInstructionSent"));
      this.setState({ isRequestRunning: false }, () => onClose());
    });
  };

  render() {
    // console.log("ChangePhoneDialog render");

    const { t, tReady, visible, onClose } = this.props;
    const { isRequestRunning } = this.state;

    return (
      <ModalDialog isLoading={!tReady} visible={visible} onClose={onClose}>
        <ModalDialog.Header>{t("MobilePhoneChangeTitle")}</ModalDialog.Header>
        <ModalDialog.Body>
          <Text>{t("MobilePhoneEraseDescription")}</Text>
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <Button
            key="ChangePhoneSendBtn"
            label={t("Common:SendButton")}
            size="normal"
            scale
            primary
            onClick={this.onChangePhone}
            isLoading={isRequestRunning}
          />
        </ModalDialog.Footer>
      </ModalDialog>
    );
  }
}

const ChangePhoneDialog = withTranslation(["ChangePhoneDialog", "Common"])(
  ChangePhoneDialogComponent,
);

ChangePhoneDialog.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
};

export default ChangePhoneDialog;
