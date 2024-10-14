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
import { CustomScrollbarsVirtualList } from "@docspace/shared/components/scrollbar";
import { Checkbox } from "@docspace/shared/components/checkbox";

import { FixedSizeList as List, areEqual } from "react-window";
// import AutoSizer from "react-virtualized-auto-sizer";
import { withTranslation } from "react-i18next";
import { resendUserInvites } from "@docspace/shared/api/people";

import { inject, observer } from "mobx-react";

class SendInviteDialogComponent extends React.Component {
  constructor(props) {
    super(props);

    const { userIds, selectedUsers } = props;

    const listUsers = selectedUsers.map((item, index) => {
      const disabled = userIds.find((x) => x === item.id);
      return (selectedUsers[index] = {
        ...selectedUsers[index],
        checked: disabled ? true : false,
        disabled: disabled ? false : true,
      });
    });

    this.state = {
      listUsers,
      isRequestRunning: false,
      userIds,
    };
  }

  onSendInvite = () => {
    const { t, setSelected, onClose } = this.props;
    const { userIds } = this.state;

    this.setState({ isRequestRunning: true }, () => {
      resendUserInvites(userIds)
        .then(() =>
          toastr.success(t("PeopleTranslations:SuccessSentInvitation")),
        )
        .catch((error) => toastr.error(error))
        .finally(() => {
          this.setState({ isRequestRunning: false }, () => {
            setSelected("close");
            onClose();
          });
        });
    });
  };

  onChange = (e) => {
    const userIndex = this.state.listUsers.findIndex(
      (x) => x.id === e.target.value,
    );
    const newUsersList = this.state.listUsers;
    newUsersList[userIndex].checked = !newUsersList[userIndex].checked;

    const newUserIds = [];

    for (let item of newUsersList) {
      if (item.checked === true) {
        newUserIds.push(item.id);
      }
    }

    this.setState({ listUsers: newUsersList, userIds: newUserIds });
  };

  render() {
    const { t, tReady, onClose, visible } = this.props;
    const { listUsers, isRequestRunning, userIds } = this.state;
    const itemSize = 25;
    const containerStyles = { height: listUsers.length * 25, maxHeight: 220 };

    const renderItems = memo(({ data, index, style }) => {
      return (
        <Checkbox
          truncate
          style={style}
          className="modal-dialog-checkbox"
          value={data[index].id}
          onChange={this.onChange}
          key={`checkbox_${index}`}
          isChecked={data[index].checked}
          label={data[index].displayName}
          isDisabled={data[index].disabled}
        />
      );
    }, areEqual);

    const renderList = ({ height, width }) => (
      <List
        className="List"
        height={height}
        width={width}
        itemSize={itemSize}
        itemCount={listUsers.length}
        itemData={listUsers}
        outerElementType={CustomScrollbarsVirtualList}
      >
        {renderItems}
      </List>
    );

    //console.log("SendInviteDialog render");
    return (
      <ModalDialog
        isLoading={!tReady}
        visible={visible}
        onClose={onClose}
        autoMaxHeight
      >
        <ModalDialog.Header>
          {t("PeopleTranslations:SendInviteAgain")}
        </ModalDialog.Header>
        <ModalDialog.Body>
          <Text>{t("SendInviteAgainDialog")}</Text>
          <Text>{t("SendInviteAgainDialogMessage")}</Text>
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <Button
            id="send-inite-again-modal_submit"
            label={t("Common:SendButton")}
            size="normal"
            scale
            primary
            onClick={this.onSendInvite}
            isLoading={isRequestRunning}
            isDisabled={!userIds.length}
          />
          <Button
            id="send-inite-again-modal_cancel"
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

const SendInviteDialog = withTranslation([
  "SendInviteDialog",
  "Common",
  "PeopleTranslations",
])(SendInviteDialogComponent);

SendInviteDialog.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  userIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedUsers: PropTypes.arrayOf(PropTypes.object).isRequired,
  setSelected: PropTypes.func.isRequired,
};

export default inject(({ peopleStore }) => ({
  selectedUsers: peopleStore.usersStore.selection,
  setSelected: peopleStore.usersStore.setSelected,
  userIds: peopleStore.usersStore.getUsersToInviteIds,
}))(observer(SendInviteDialog));
