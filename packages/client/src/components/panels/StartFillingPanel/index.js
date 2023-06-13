import React, { useState, useCallback } from "react";
import ModalDialog from "@docspace/components/modal-dialog";
import Button from "@docspace/components/button";
import FillingRoleSelector from "@docspace/components/filling-role-selector";
import InviteUserForRolePanel from "../InviteUserForRolePanel";
import Aside from "@docspace/components/aside";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

const roles = [
  { id: 3, name: "Director", order: 3, color: "#BB85E7" },
  { id: 2, name: "Accountant", order: 2, color: "#70D3B0" },
  {
    id: 1,
    name: "Employee",
    order: 1,
    color: "#FBCC86",
    everyone: "@Everyone",
  },
];

const StartFillingPanel = ({
  startFillingPanelVisible,
  setStartFillingPanelVisible,
}) => {
  const [visibleInviteUserForRolePanel, setVisibleInviteUserForRolePanel] =
    useState(false);
  const [visibleTooltip, setVisibleTooltip] = useState(true);
  const [addUserToRoomVisible, setAddUserToRoomVisible] = useState(false);

  const [currentRole, setCurrentRole] = useState("");
  const [users, setUsers] = useState([]);

  const onAddUser = (role) => {
    setCurrentRole(role);
    onOpenInviteUserForRolePanel();
  };

  const onClose = () => {
    setStartFillingPanelVisible(false);
    onCloseInviteUserForRolePanel();
    setCurrentRole("");
  };

  const onOpenInviteUserForRolePanel = () => {
    setVisibleInviteUserForRolePanel(true);
  };

  const onCloseInviteUserForRolePanel = () => {
    setVisibleInviteUserForRolePanel(false);
  };

  const onSelectUserForRole = (user) => {
    // TODO: Field hasAvatar is not coming now, can remove it in FillingRoleSelector
    setUsers([
      ...users,
      {
        ...user,
        displayName: user.label,
        role: currentRole,
      },
    ]);

    onCloseInviteUserForRolePanel();
    setCurrentRole("");
  };

  const onRemoveUser = useCallback(
    (id) => {
      const filteredUsers = users.filter((user) => user.id !== id);
      setUsers(filteredUsers);
    },
    [users, setUsers]
  );

  const onCloseTooltip = () => {
    setVisibleTooltip(false);
  };

  const onOpenAddUserToRoom = () => {
    setAddUserToRoomVisible(true);
  };

  const onCloseAddUserToRoom = () => {
    setAddUserToRoomVisible(false);
  };

  return (
    <>
      <Aside
        className="start-filling"
        visible={startFillingPanelVisible}
        withoutBodyScroll
        zIndex={310}
      >
        <ModalDialog
          displayType="aside"
          withBodyScroll
          visible={startFillingPanelVisible}
          withFooterBorder
          onClose={onClose}
          isCloseable={!visibleInviteUserForRolePanel}
        >
          <ModalDialog.Header>Start Filling</ModalDialog.Header>

          <ModalDialog.Body>
            <FillingRoleSelector
              roles={roles}
              users={users}
              descriptionTooltip={
                "Forms filled by the users of the first role are passed over to the next roles in the list for filling the corresponding fields."
              }
              titleTooltip={"How it works"}
              listHeader={"Roles in this form"}
              visibleTooltip={visibleTooltip}
              onAddUser={onAddUser}
              onRemoveUser={onRemoveUser}
              onCloseTooltip={onCloseTooltip}
            />
          </ModalDialog.Body>

          <ModalDialog.Footer>
            <Button
              id="shared_create-room-modal_submit"
              tabIndex={5}
              label="Start"
              size="normal"
              primary
              scale
            />
            <Button
              id="shared_create-room-modal_cancel"
              tabIndex={5}
              label="Cancel"
              size="normal"
              scale
            />
          </ModalDialog.Footer>
        </ModalDialog>
      </Aside>

      {visibleInviteUserForRolePanel && (
        <InviteUserForRolePanel
          visible={visibleInviteUserForRolePanel}
          currentRole={currentRole}
          onClose={onClose}
          onSelectUserForRole={onSelectUserForRole}
          setVisibleInviteUserForRolePanel={setVisibleInviteUserForRolePanel}
          onCloseInviteUserForRolePanel={onCloseInviteUserForRolePanel}
          addUserToRoomVisible={addUserToRoomVisible}
          onOpenAddUserToRoom={onOpenAddUserToRoom}
          onCloseAddUserToRoom={onCloseAddUserToRoom}
        />
      )}
    </>
  );
};

export default inject(({ dialogsStore }) => {
  const { startFillingPanelVisible, setStartFillingPanelVisible } =
    dialogsStore;

  return { startFillingPanelVisible, setStartFillingPanelVisible };
})(withTranslation(["Common"])(observer(StartFillingPanel)));
