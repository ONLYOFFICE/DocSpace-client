import { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import styled, { css } from "styled-components";
import { Aside } from "@docspace/shared/components/aside";
import { Backdrop } from "@docspace/shared/components/backdrop";
import PeopleSelector from "@docspace/shared/selectors/People";
import { withTranslation } from "react-i18next";
import Filter from "@docspace/shared/api/people/filter";
import { EmployeeType, DeviceType } from "@docspace/shared/enums";
import { Portal } from "@docspace/shared/components/portal";

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
    setRoomParams,
    currentDeviceType,
    roomOwnerId,
    changeRoomOwner,
    userId,
    updateInfoPanelSelection,
  } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(!showBackButton);

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

  const onChangeRoomOwner = async (user) => {
    if (showBackButton) {
      setRoomParams && setRoomParams(user[0]);
    } else {
      setIsLoading(true);

      await changeRoomOwner(t, user[0]?.id, isChecked);
      updateInfoPanelSelection();
      setIsLoading(false);
    }
    onClose();
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
          acceptButtonLabel={
            showBackButton ? t("Common:SelectAction") : t("Files:AssignOwner")
          }
          headerLabel={t("Files:ChangeTheRoomOwner")}
          filter={filter}
          isLoading={isLoading}
          withFooterCheckbox={!showBackButton}
          footerCheckboxLabel={t("Files:LeaveTheRoom")}
          isChecked={isChecked}
          setIsChecked={setIsChecked}
          withOutCurrentAuthorizedUser
          filterUserId={roomOwnerId}
          currentUserId={userId}
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
  ({
    settingsStore,
    dialogsStore,
    filesStore,
    selectedFolderStore,
    filesActionsStore,
    userStore,
    infoPanelStore,
  }) => {
    const {
      changeRoomOwnerIsVisible,
      setChangeRoomOwnerIsVisible,
      changeRoomOwnerData,
    } = dialogsStore;
    const { selection, bufferSelection } = filesStore;
    const { currentDeviceType } = settingsStore;
    const { updateInfoPanelSelection } = infoPanelStore;

    const room = selection.length
      ? selection[0]
      : bufferSelection
        ? bufferSelection
        : selectedFolderStore;

    const { id } = userStore.user;

    return {
      visible: changeRoomOwnerIsVisible,
      setIsVisible: setChangeRoomOwnerIsVisible,
      showBackButton: changeRoomOwnerData.showBackButton,
      setRoomParams: changeRoomOwnerData.setRoomParams,
      roomOwnerId: room?.createdBy?.id,
      currentDeviceType,
      changeRoomOwner: filesActionsStore.changeRoomOwner,
      userId: id,
      updateInfoPanelSelection,
    };
  }
)(observer(withTranslation(["Files"])(ChangeRoomOwner)));
