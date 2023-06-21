import React, { useState, useEffect, useCallback } from "react";
import ModalDialog from "@docspace/components/modal-dialog";
import Button from "@docspace/components/button";
import FillingRoleSelector from "@docspace/components/filling-role-selector";
import InviteUserForRolePanel from "../InviteUserForRolePanel";
import Aside from "@docspace/components/aside";
import StartFillingPanelLoader from "@docspace/common/components/Loaders/StartFillingPanelLoader";
import toastr from "@docspace/components/toast/toastr";
import { Trans } from "react-i18next";
import Link from "@docspace/components/link";
import i18n from "./i18n";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import styled from "styled-components";

const StyledModalDialog = styled(ModalDialog)`
  .modal-body {
    padding-left: 0;
    padding-right: 0;
  }

  .scroll-body {
    padding-right: 0 !important;
  }

  .row {
    padding: 0 16px;
  }

  .list-header {
    padding: 8px 16px;
  }

  .tooltip {
    margin: 8px 16px;
  }
`;

const StyledLink = styled(Link)`
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: rgba(82, 153, 224, 1);
`;

const everyoneRole = 1;
const StartFillingPanel = ({
  startFillingPanelVisible,
  setStartFillingPanelVisible,
  isVisible,
  getRolesUsersForFillingForm,
  setRolesUsersForFillingForm,
  fileId = 4,
  formHref = "http://192.168.0.102:8092/doceditor?fileId=4",
  roomId = 10,
  roomTitle = "accountant's room",
  theme,
  getRoomMembers,
  tReady,
}) => {
  const t = i18n.getFixedT(null, ["StartFillingPanel", "Common"]);

  const [visibleInviteUserForRolePanel, setVisibleInviteUserForRolePanel] =
    useState(false);
  const [visibleTooltip, setVisibleTooltip] = useState(true);
  const [addUserToRoomVisible, setAddUserToRoomVisible] = useState(false);

  const [members, setMembers] = useState([]);
  const [currentRole, setCurrentRole] = useState("");
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);

  const [isDisabledStart, setIsDisabledStart] = useState(true);
  const [isShowLoader, setIsShowLoader] = useState(true);
  const [isLoadingFetchMembers, setIsLoadingFetchMembers] = useState(false);

  useEffect(() => {
    getRolesUsersForFillingForm(fileId)
      .then((roles) => {
        setRoles(roles);
      })
      .catch((e) => console.log(e));
  }, []);

  useEffect(() => {
    setIsShowLoader(!tReady || !roles.length);
  }, [tReady, roles.length]);

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

  const fetchMembers = () => {
    setIsLoadingFetchMembers(true);
    getRoomMembers(roomId)
      .then((res) => {
        const data = res.filter(
          (m) => m.sharedTo.email || m.sharedTo.displayName
        );
        let inRoomMembers = [];
        data.map((fetchedMember) => {
          const member = {
            label: fetchedMember.sharedTo.displayName,
            ...fetchedMember.sharedTo,
          };
          if (member.activationStatus !== 2) inRoomMembers.push(member);
        });
        setMembers(inRoomMembers);
      })
      .catch((e) => console.log(e))
      .finally(() => setIsLoadingFetchMembers(false));
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
    if (!members.length) fetchMembers();
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

  const text = t("StartFillingPanel:ToastrText");

  const toastrStart = (
    <>
      <Trans ns="StartFillingPanel" i18nKey="ToastrSuccess" text={text}>
        {{ text }}
        {{ roomTitle }}
      </Trans>
      <StyledLink noHover target="_blank" href={formHref}>
        {t("StartFillingPanel:GoToForm")}
      </StyledLink>
    </>
  );

  const onStart = () => {
    const idMembers = members.map((member) => member.id);
    const idUsersRoles = [];

    idUsersRoles.push({ id: everyoneRole, userId: idMembers });
    users.map((user) => {
      idUsersRoles.push({ id: user.roleId, userId: [user.id] });
    });

    setRolesUsersForFillingForm(fileId, idUsersRoles)
      .then(() => {
        toastr.success(toastrStart);
        onClose();
      })
      .catch((e) => {
        console.log("e", e);
      });
  };

  if (visibleInviteUserForRolePanel) {
    return (
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
        theme={theme}
        isLoadingFetchMembers={isLoadingFetchMembers}
        roomId={roomId}
      />
    );
  }

  return (
    <>
      <Aside visible={startFillingPanelVisible} zIndex={310}>
        {isShowLoader ? (
          <StartFillingPanelLoader
            onClose={onClose}
            isCloseable={!visibleInviteUserForRolePanel}
            visible={startFillingPanelVisible}
          />
        ) : (
          <StyledModalDialog
            displayType="aside"
            visible={startFillingPanelVisible}
            withFooterBorder
            onClose={onClose}
            isCloseable={!visibleInviteUserForRolePanel}
          >
            <ModalDialog.Header>
              {t("StartFillingPanel:StartFilling")}
            </ModalDialog.Header>
            <ModalDialog.Body>
              <FillingRoleSelector
                roles={roles}
                users={users}
                descriptionEveryone={t("StartFillingPanel:DescriptionEveryone")}
                descriptionTooltip={t("StartFillingPanel:DescriptionTooltip")}
                titleTooltip={t("StartFillingPanel:TitleTooltip")}
                listHeader={t("StartFillingPanel:ListHeader")}
                visibleTooltip={visibleTooltip}
                onAddUser={onAddUser}
                onRemoveUser={onRemoveUser}
                onCloseTooltip={onCloseTooltip}
              />
            </ModalDialog.Body>
            <ModalDialog.Footer>
              <Button
                label={t("Common:Start")}
                size="normal"
                isDisabled={isDisabledStart}
                onClick={onStart}
                primary
                scale
              />
              <Button
                label={t("Common:CancelButton")}
                onClick={onClose}
                size="normal"
                scale
              />
            </ModalDialog.Footer>
          </StyledModalDialog>
        )}
      </Aside>
    </>
  );
};

export default inject(({ auth, dialogsStore, filesStore }) => {
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
    theme: auth.settingsStore.theme,
  };
})(
  withTranslation(["Common", "StartFillingPanel"])(observer(StartFillingPanel))
);
