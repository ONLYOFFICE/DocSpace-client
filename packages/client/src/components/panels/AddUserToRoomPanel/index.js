import React, { useState, useEffect } from "react";

import Backdrop from "@docspace/components/backdrop";
import Aside from "@docspace/components/aside";

import PeopleSelector from "@docspace/client/src/components/PeopleSelector";
import { ShareAccessRights } from "@docspace/common/constants";

import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

const AddUserToRoomPanel = ({
  visible,
  currentRole,
  onClose,
  getRoomMembers,
  roomId,
  onSelectUserForRole,
  inviteItems,
  setRoomSecurity,
  inviteUsers,
  setUpdateRoomMembers,
  existUsers,
}) => {
  const onAddToRoom = (users) => {
    console.log("newSelectedItems", users);

    const access = ShareAccessRights.FormFilling;

    const items = [];

    for (let item of users) {
      // const currentItem = shareDataItems.find((x) => x.sharedTo.id === item.id);

      const newItem = {
        access: access,
        email: item.email,
        id: item.id,
        displayName: item.label,
        avatar: item.avatar,
        isOwner: item.isOwner,
        isAdmin: item.isAdmin,
      };
      items.push(newItem);
    }

    if (users.length > items.length)
      toastr.warning("Some users are already in room");

    const invitations = items.map((item) => {
      let newItem = {};

      newItem.access = item.access;

      item.avatar ? (newItem.id = item.id) : (newItem.email = item.email);

      return newItem;
    });

    const data = {
      invitations,
    };

    data.notify = true;
    data.message = "Invitation message";

    setRoomSecurity(roomId, data);
    onClose();
  };

  return (
    <>
      <Aside
        className="header_aside-panel"
        visible={visible}
        withoutBodyScroll
        zIndex={410}
        isCloseable={false}
      >
        <PeopleSelector
          headerLabel="Add user to room"
          visible={visible}
          onBackClick={onClose}
          placeholder="Search users"
          zIndex={410}
          onAccept={onAddToRoom}
          existUsers={existUsers}
          isMultiSelect
          withSelectAll
          withSelectExistUsers
        />
      </Aside>
    </>
  );
};

export default inject(({ filesStore, dialogsStore, peopleStore, auth }) => {
  const { getRoomMembers, setRoomSecurity } = filesStore;
  const { inviteItems } = dialogsStore;
  const { inviteUsers } = peopleStore.usersStore;
  const { setUpdateRoomMembers } = auth.infoPanelStore;

  return {
    getRoomMembers,
    inviteItems,
    setRoomSecurity,
    inviteUsers,
    setUpdateRoomMembers,
  };
})(withTranslation(["Common"])(observer(AddUserToRoomPanel)));
