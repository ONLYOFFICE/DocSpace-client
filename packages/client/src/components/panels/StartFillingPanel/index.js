import React, { useState, useEffect, useCallback } from "react";
import ModalDialog from "@docspace/components/modal-dialog";
import Button from "@docspace/components/button";
import FillingRoleSelector from "@docspace/components/filling-role-selector";
import InviteUserForRolePanel from "../InviteUserForRolePanel";
import Aside from "@docspace/components/aside";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

const everyoneRole = 1;
const StartFillingPanel = ({
  startFillingPanelVisible,
  setStartFillingPanelVisible,
  isVisible,
  getRolesUsersForFillingForm,
  setRolesUsersForFillingForm,
  fileId,
  roomId,
  getRoomMembers,
}) => {
  const [visibleInviteUserForRolePanel, setVisibleInviteUserForRolePanel] =
    useState(false);
  const [visibleTooltip, setVisibleTooltip] = useState(true);
  const [addUserToRoomVisible, setAddUserToRoomVisible] = useState(false);

  const [members, setMembers] = useState([]);
  const [currentRole, setCurrentRole] = useState("");
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);

  const [isDisabledStart, setIsDisabledStart] = useState(true);

  useEffect(() => {
    getRolesUsersForFillingForm(fileId)
      .then((roles) => {
        setRoles(roles);
      })
      .catch((e) => console.log(e));
  }, []);

  useEffect(() => {
    Boolean(isVisible) && setStartFillingPanelVisible(isVisible);
  }, [isVisible]);

  useEffect(() => {
    const allRolesFilled = roles.length - everyoneRole === users.length;

    if (allRolesFilled) {
      setIsDisabledStart(false);
    } else {
      setIsDisabledStart(true);
    }
  }, [roles.length, users.length]);

  const fetchMembers = async () => {
    let data = await getRoomMembers(roomId);

    data = data.filter((m) => m.sharedTo.email || m.sharedTo.displayName);
    let inRoomMembers = [];
    data.map((fetchedMember) => {
      const member = {
        label: fetchedMember.sharedTo.displayName,
        ...fetchedMember.sharedTo,
      };
      if (member.activationStatus !== 2) inRoomMembers.push(member);
    });
    setMembers(inRoomMembers);
  };

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
    fetchMembers();
    setVisibleInviteUserForRolePanel(true);
  };

  const onCloseInviteUserForRolePanel = () => {
    setVisibleInviteUserForRolePanel(false);
  };

  const onSelectUserForRole = (user) => {
    setUsers([
      ...users,
      {
        ...user,
        displayName: user.label,
        role: currentRole.title,
        roleId: currentRole.id,
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

  const onStart = () => {
    const idMembers = members.map((member) => member.id);
    const idUsersRoles = [];

    idUsersRoles.push({ id: everyoneRole, userId: idMembers });
    users.map((user) => {
      idUsersRoles.push({ id: user.roleId, userId: [user.id] });
    });

    setRolesUsersForFillingForm(4, idUsersRoles)
      .then(() => {
        //TODO: Add toast
      })
      .catch((e) => {
        console.log("e");
      });
  };

  if (!roles.length) return <div></div>;
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
              everyoneTranslation={"Everyone"}
              descriptionEveryone={
                "The form is available for filling for all room members"
              }
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
              isDisabled={isDisabledStart}
              onClick={onStart}
              primary
              scale
            />
            <Button
              id="shared_create-room-modal_cancel"
              tabIndex={5}
              label="Cancel"
              onClick={onClose}
              size="normal"
              scale
            />
          </ModalDialog.Footer>
        </ModalDialog>
      </Aside>

      {visibleInviteUserForRolePanel && (
        <InviteUserForRolePanel
          visible={visibleInviteUserForRolePanel}
          members={members}
          currentRole={currentRole}
          onClose={onClose}
          onSelectUserForRole={onSelectUserForRole}
          setVisibleInviteUserForRolePanel={setVisibleInviteUserForRolePanel}
          onCloseInviteUserForRolePanel={onCloseInviteUserForRolePanel}
          addUserToRoomVisible={addUserToRoomVisible}
          onOpenAddUserToRoom={onOpenAddUserToRoom}
          onCloseAddUserToRoom={onCloseAddUserToRoom}
          fetchMembers={fetchMembers}
        />
      )}
    </>
  );
};

export default inject(({ dialogsStore, filesStore }) => {
  const { startFillingPanelVisible, setStartFillingPanelVisible } =
    dialogsStore;
  const {
    getRolesUsersForFillingForm,
    setRolesUsersForFillingForm,
    getRoomMembers,
  } = filesStore;

  return {
    startFillingPanelVisible,
    setStartFillingPanelVisible,
    getRolesUsersForFillingForm,
    setRolesUsersForFillingForm,
    getRoomMembers,
  };
})(withTranslation(["Common"])(observer(StartFillingPanel)));
