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
import PropTypes from "prop-types";

import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

class DataLossWarningDialogComponent extends React.Component {
  onClose = () => {
    const { setIsVisibleDataLossDialog } = this.props;
    setIsVisibleDataLossDialog(false);
  };

  onSubmit = () => {
    const {
      onContinue,
      setIsVisibleDataLossDialog,
      setIsEditingForm,
      callback,
    } = this.props;

    setIsVisibleDataLossDialog(false);
    setIsEditingForm(false);

    if (callback) {
      callback();
    } else {
      onContinue && onContinue();
    }
  };
  render() {
    const { t, tReady, isVisibleDataLossDialog } = this.props;

    return (
      <ModalDialog
        visible={isVisibleDataLossDialog}
        onClose={this.onClose}
        isLoading={!tReady}
      >
        <ModalDialog.Header>{t("DataLossWarningHeader")}</ModalDialog.Header>
        <ModalDialog.Body>
          <Text fontSize="13px">{t("DataLossWarningBody")}</Text>
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <Button
            key="LeaveForm"
            label={t("DataLossWarningLeaveBtn")}
            size="normal"
            scale
            primary={true}
            onClick={this.onSubmit}
          />
          <Button
            key="StayOnPage"
            label={t("Common:CancelButton")}
            size="normal"
            scale
            onClick={this.onClose}
          />
        </ModalDialog.Footer>
      </ModalDialog>
    );
  }
}

const DataLossWarningDialog = withTranslation("DataLossWarningDialog")(
  DataLossWarningDialogComponent,
);

DataLossWarningDialog.propTypes = {
  //editingForm: PropTypes.object.isRequired,
  onContinue: PropTypes.func.isRequired,
};

export default inject(({ peopleStore }) => {
  return {
    isVisibleDataLossDialog:
      peopleStore.editingFormStore.isVisibleDataLossDialog,
    setIsVisibleDataLossDialog:
      peopleStore.editingFormStore.setIsVisibleDataLossDialog,
    setIsEditingForm: peopleStore.editingFormStore.setIsEditingForm,
    callback: peopleStore.editingFormStore.callback,
  };
})(observer(DataLossWarningDialog));
