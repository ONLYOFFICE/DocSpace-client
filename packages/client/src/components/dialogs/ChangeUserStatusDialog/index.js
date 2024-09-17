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

import React, { memo } from "react";
import PropTypes from "prop-types";

import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Button } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { toastr } from "@docspace/shared/components/toast";

import { combineUrl } from "@docspace/shared/utils/combineUrl";

import { withTranslation } from "react-i18next";

import { EmployeeStatus } from "@docspace/shared/enums";
import ModalDialogContainer from "../ModalDialogContainer";
import { inject, observer } from "mobx-react";

import PaidQuotaLimitError from "SRC_DIR/components/PaidQuotaLimitError";

class ChangeUserStatusDialogComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = { isRequestRunning: false };
  }

  onChangeUserStatus = () => {
    const {
      updateUserStatus,
      status,
      t,
      setSelected,
      onClose,
      userIDs,
      getPeopleListItem,
      setInfoPanelSelection,
      infoPanelVisible,
      needResetUserSelection,
    } = this.props;

    this.setState({ isRequestRunning: true }, () => {
      updateUserStatus(status, userIDs)
        .then((users) => {
          if (users.length === 1 && infoPanelVisible) {
            const user = getPeopleListItem(users[0]);

            setInfoPanelSelection(user);
          }

          toastr.success(t("PeopleTranslations:SuccessChangeUserStatus"));
        })
        .catch((err) => {
          toastr.error(<PaidQuotaLimitError />, false, 0, true, true);
        })
        .finally(() => {
          this.setState({ isRequestRunning: false }, () => {
            needResetUserSelection && setSelected("close");
            onClose();
          });
        });
    });
  };

  onCloseAction = () => {
    const { onClose } = this.props;
    const { isRequestRunning } = this.state;

    !isRequestRunning && onClose();
  };

  render() {
    const { t, tReady, visible, status, userIDs } = this.props;
    const { isRequestRunning } = this.state;

    const needDisabled = status === EmployeeStatus.Disabled;
    const onlyOneUser = userIDs.length === 1;

    let header = "";
    let bodyText = "";
    let buttonLabelSave = "";

    if (needDisabled) {
      header = onlyOneUser ? t("DisableUser") : t("DisableUsers");

      bodyText = onlyOneUser
        ? t("DisableUserDescription", { productName: t("Common:ProductName") })
        : t("DisableUsersDescription", {
            productName: t("Common:ProductName"),
          });

      bodyText = bodyText + t("DisableGeneralDescription");

      buttonLabelSave = t("PeopleTranslations:DisableUserButton");
    } else {
      header = onlyOneUser ? t("EnableUser") : t("EnableUsers");

      bodyText = onlyOneUser
        ? t("EnableUserDescription", { productName: t("Common:ProductName") })
        : t("EnableUsersDescription", { productName: t("Common:ProductName") });

      buttonLabelSave = t("Common:Enable");
    }

    return (
      <ModalDialogContainer
        isLoading={!tReady}
        visible={visible}
        onClose={this.onCloseAction}
        autoMaxHeight
      >
        <ModalDialog.Header>{header}</ModalDialog.Header>
        <ModalDialog.Body>
          <Text>{bodyText}</Text>
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <Button
            id="change-user-status-modal_submit"
            label={buttonLabelSave}
            size="normal"
            primary
            scale
            onClick={this.onChangeUserStatus}
            isLoading={isRequestRunning}
            isDisabled={userIDs.length === 0}
          />
          <Button
            id="change-user-status-modal_cancel"
            label={t("Common:CancelButton")}
            size="normal"
            scale
            onClick={this.onCloseAction}
            isDisabled={isRequestRunning}
          />
        </ModalDialog.Footer>
      </ModalDialogContainer>
    );
  }
}

const ChangeUserStatusDialog = withTranslation([
  "ChangeUserStatusDialog",
  "Common",
  "PeopleTranslations",
])(ChangeUserStatusDialogComponent);

ChangeUserStatusDialog.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  setSelected: PropTypes.func.isRequired,
  userIDs: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default inject(({ peopleStore, infoPanelStore }) => {
  const setSelected = peopleStore.selectionStore.setSelected;

  const { getPeopleListItem, updateUserStatus, needResetUserSelection } =
    peopleStore.usersStore;

  const { setInfoPanelSelection, isVisible: infoPanelVisible } = infoPanelStore;

  return {
    needResetUserSelection,
    updateUserStatus,

    setSelected,

    getPeopleListItem,

    setInfoPanelSelection,
    infoPanelVisible,
  };
})(observer(ChangeUserStatusDialog));
