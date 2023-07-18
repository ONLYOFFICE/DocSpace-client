import React, { useState, useEffect, useCallback } from "react";
import ModalDialog from "@docspace/components/modal-dialog";
import Button from "@docspace/components/button";
import FillingRoleSelector from "@docspace/components/filling-role-selector";
import InviteUserForRolePanel from "../InviteUserForRolePanel";
import Aside from "@docspace/components/aside";
import toastr from "@docspace/components/toast/toastr";
import { Trans } from "react-i18next";
import Link from "@docspace/components/link";
import Loaders from "@docspace/common/components/Loaders";
import { size } from "@docspace/components/utils/device";
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

const StyledListLoader = styled.div`
  padding-left: 33px;

  .name {
    padding-left: 8px;
    padding-right: 28px;
    max-width: 284px;
  }

  .row-loader {
    display: flex;
    align-items: center;
    padding-bottom: 16px;
  }

  .row-with-remove {
    justify-content: space-between;
    align-items: center;
  }

  .avatar-with-role {
    display: flex;
    align-items: center;

    .name {
      padding-right: 12px;
    }
  }

  .avatar {
    min-width: 32px;
  }

  .checkbox {
    padding-right: 16px;
  }
`;

const StyledTooltipLoaders = styled.div`
  padding: 0 16px 15px 16px;
`;

const StyledListHeaderLoaders = styled.div`
  padding: 0 0 7px 16px;
`;

const everyoneRole = 1;
const StartFillingPanel = ({
  startFillingPanelVisible,
  setStartFillingPanelVisible,
  isVisible,
  getRolesUsersForFillingForm,
  setRolesUsersForFillingForm,
  fileId,
  formHref,
  theme,
  getRoomMembers,
  tReady,
  headerCancelButton,
  isCloseable,
  room,
  onCloseSelectRoomPanel,
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

  const [roomTitle, setRoomTitle] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    getRolesUsersForFillingForm(fileId)
      .then((roles) => {
        setRoles(roles);
      })
      .catch((e) => console.log(e));

    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  useEffect(() => {
    setIsShowLoader(!roles.length);
  }, [roles.length]);

  useEffect(() => {
    typeof isVisible === "boolean" && setStartFillingPanelVisible(isVisible);
  }, [isVisible]);

  useEffect(() => {
    setRoomTitle(room.title);
  }, [room]);

  useEffect(() => {
    const allRolesFilled = roles.length - everyoneRole === users.length;

    if (allRolesFilled) {
      setIsDisabledStart(false);
    } else {
      setIsDisabledStart(true);
    }
  }, [roles.length, users.length]);

  const checkWidth = () => {
    window.innerWidth <= size.smallTablet
      ? setIsMobileView(true)
      : setIsMobileView(false);
  };

  const fetchMembers = () => {
    setIsLoadingFetchMembers(true);
    getRoomMembers(room.id)
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
    const idUsersRoles = {};

    users.map((user) => {
      const idRole = user.roleId;
      const idUser = user.id;

      idUsersRoles[idRole] = idUser;
    });

    setRolesUsersForFillingForm(fileId, idUsersRoles)
      .then(() => {
        toastr.success(toastrStart);
        onClose();
        onCloseSelectRoomPanel && onCloseSelectRoomPanel();
      })
      .catch((e) => {
        console.log("e", e);
      });
  };

  const isCloseablePanel =
    typeof isCloseable === "boolean"
      ? isCloseable
      : !visibleInviteUserForRolePanel;

  const listLoader = (
    <StyledListLoader>
      <div className="row-loader">
        <Loaders.Circle
          className="avatar"
          x="16"
          y="16"
          width="32"
          height="32"
          radius="16"
        />
        <Loaders.Rectangle className="name" height="16px" />
      </div>
      <div className="row-loader">
        <Loaders.Circle
          className="avatar"
          x="16"
          y="16"
          width="32"
          height="32"
          radius="16"
        />
        <Loaders.Rectangle className="name" height="16px" />
      </div>
      <div className="row-loader row-with-remove">
        <div className="avatar-with-role">
          <Loaders.Circle
            className="avatar"
            x="16"
            y="16"
            width="32"
            height="32"
            radius="16"
          />
          <Loaders.Rectangle className="name" height="16px" />
        </div>

        <Loaders.Rectangle width="16" height="16" className="checkbox" />
      </div>
    </StyledListLoader>
  );

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
        roomId={room.id}
      />
    );
  }

  return (
    <Aside visible={startFillingPanelVisible} zIndex={310}>
      <StyledModalDialog
        displayType="aside"
        visible={startFillingPanelVisible}
        withFooterBorder
        onClose={onClose}
        isCloseable={isCloseablePanel}
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
            listLoader={listLoader}
            listHeaderLoader={
              <StyledListHeaderLoaders>
                <Loaders.Rectangle width="120px" height="16px" />
              </StyledListHeaderLoaders>
            }
            tooltipLoader={
              <StyledTooltipLoaders>
                <Loaders.Rectangle height={isMobileView ? "92px" : "76px"} />
              </StyledTooltipLoaders>
            }
            isShowLoader={isShowLoader}
            isLoadingText={!tReady}
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
            label={headerCancelButton || t("Common:CancelButton")}
            onClick={onClose}
            size="normal"
            scale
          />
        </ModalDialog.Footer>
      </StyledModalDialog>
    </Aside>
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
