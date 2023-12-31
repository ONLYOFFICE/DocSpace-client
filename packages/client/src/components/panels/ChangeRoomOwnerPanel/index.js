import React, { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import styled, { css } from "styled-components";
import Aside from "@docspace/components/aside";
import Backdrop from "@docspace/components/backdrop";
import PeopleSelector from "@docspace/client/src/components/PeopleSelector";
import { withTranslation } from "react-i18next";
import Filter from "@docspace/common/api/people/filter";
import { EmployeeType, ShareAccessRights } from "@docspace/common/constants";
import toastr from "@docspace/components/toast/toastr";
import { DeviceType } from "@docspace/common/constants";
import Portal from "@docspace/components/portal";

const StyledChangeRoomOwner = styled.div`
  display: contents;

  ${({ showBackButton }) =>
    !showBackButton &&
    css`
      .arrow-button {
        display: none;
      }

      .selector_body {
        height: calc(((100% - 16px) - 111px) - 54px);
      }

      .selector_footer {
        height: 110px;
        min-height: 110px;
        max-height: 110px;
      }

      .selector_footer-checkbox {
        padding: 17px 0 1px 0;
      }
    `}
`;

const ChangeRoomOwner = (props) => {
  const {
    t,
    visible,
    setIsVisible,
    showBackButton,
    setRoomOwner,
    roomId,
    setFolder,
    updateRoomMemberRole,
    userId,
    isAdmin,
    setRoomParams,
    removeFiles,
    folders,
    setFolders,
    currentDeviceType,
    roomOwnerId,
    isRootFolder,
    setCreatedBy,
  } = props;

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.addEventListener("keyup", onKeyUp, false);

    return () => {
      document.removeEventListener("keyup", onKeyUp, false);
    };
  }, []);

  const onKeyUp = (e) => {
    if (e.keyCode === 27) onClose();
    if (e.keyCode === 13 || e.which === 13) onChangeRoomOwner();
  };

  const onLeaveRoom = () => {
    setIsLoading(true);
    updateRoomMemberRole(roomId, {
      invitations: [{ id: userId, access: ShareAccessRights.None }],
    })
      .then(() => {
        if (!isAdmin) removeFiles(null, [roomId]);
        else {
          const newFolders = folders;
          const folderIndex = newFolders.findIndex((r) => r.id === roomId);
          newFolders[folderIndex].inRoom = false;
          setFolders(newFolders);
        }
        toastr.success(t("Files:LeftAndAppointNewOwner"));
      })

      .finally(() => {
        onClose();
        setIsLoading(false);
      });
  };

  const onChangeRoomOwner = (user, isChecked) => {
    setIsLoading(true);

    setRoomOwner(user[0].id, [roomId])
      .then(async (res) => {
        if (isRootFolder) {
          setFolder(res[0]);
        } else {
          setCreatedBy(res[0].createdBy);
        }

        if (isChecked) await onLeaveRoom();
        else toastr.success(t("Files:AppointNewOwner"));
        setRoomParams && setRoomParams(res[0].createdBy);
      })
      .finally(() => {
        setIsLoading(false);
        onClose();
      });
  };

  const onClose = () => {
    setIsVisible(false);
  };

  const onBackClick = () => {
    onClose();
  };

  const filter = new Filter();
  filter.role = [EmployeeType.Admin, EmployeeType.User]; // 1(EmployeeType.User) - RoomAdmin | 3(EmployeeType.Admin) - DocSpaceAdmin

  const backClickProp = showBackButton ? { onBackClick } : {};

  const asideComponent = (
    <StyledChangeRoomOwner showBackButton={showBackButton}>
      <Backdrop
        onClick={onClose}
        visible={visible}
        zIndex={320}
        isAside={true}
      />
      <Aside
        currentDeviceType={currentDeviceType}
        className="header_aside-panel"
        visible={visible}
        onClose={onClose}
        withoutBodyScroll
      >
        <PeopleSelector
          withCancelButton
          {...backClickProp}
          onAccept={onChangeRoomOwner}
          onCancel={onClose}
          acceptButtonLabel={t("Files:AssignOwner")}
          headerLabel={t("Files:ChangeTheRoomOwner")}
          filter={filter}
          isLoading={isLoading}
          withFooterCheckbox={!showBackButton}
          footerCheckboxLabel={t("Files:LeaveTheRoom")}
          isChecked={!showBackButton}
          withOutCurrentAuthorizedUser
          filterUserId={roomOwnerId}
        />
      </Aside>
    </StyledChangeRoomOwner>
  );

  return currentDeviceType === DeviceType.mobile ? (
    <Portal visible={visible} element={asideComponent} />
  ) : (
    asideComponent
  );
};

export default inject(
  ({ auth, dialogsStore, filesStore, selectedFolderStore }) => {
    const {
      changeRoomOwnerIsVisible,
      setChangeRoomOwnerIsVisible,
      changeRoomOwnerData,
    } = dialogsStore;
    const { settingsStore } = auth;

    const { user } = auth.userStore;
    const {
      setRoomOwner,
      selection,
      bufferSelection,
      setFolder,
      updateRoomMemberRole,
      removeFiles,
      folders,
      setFolders,
    } = filesStore;

    const room = selection.length
      ? selection[0]
      : bufferSelection
      ? bufferSelection
      : selectedFolderStore;

    const { currentDeviceType } = settingsStore;

    return {
      visible: changeRoomOwnerIsVisible,
      setIsVisible: setChangeRoomOwnerIsVisible,
      showBackButton: changeRoomOwnerData.showBackButton,
      setRoomParams: changeRoomOwnerData.setRoomParams,
      setRoomOwner,
      userId: user.id,
      roomId: room.id,
      roomOwnerId: room?.createdBy?.id,
      isRootFolder: selectedFolderStore.isRootFolder,
      setCreatedBy: selectedFolderStore.setCreatedBy,
      setFolder,
      updateRoomMemberRole,
      isAdmin: user.isOwner || user.isAdmin,
      removeFiles,
      folders,
      setFolders,
      currentDeviceType,
    };
  }
)(observer(withTranslation(["Files"])(ChangeRoomOwner)));
