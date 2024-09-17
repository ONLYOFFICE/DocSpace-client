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

import { useState } from "react";
import { inject, observer } from "mobx-react";
import styled, { css } from "styled-components";
import { Aside } from "@docspace/shared/components/aside";
import { Backdrop } from "@docspace/shared/components/backdrop";
import PeopleSelector from "@docspace/shared/selectors/People";
import { withTranslation } from "react-i18next";
import Filter from "@docspace/shared/api/people/filter";
import { EmployeeType } from "@docspace/shared/enums";
import { Portal } from "@docspace/shared/components/portal";

const StyledChangeRoomOwner = styled.div`
  display: contents;

  .change-owner_people-selector {
    overflow: visible;
  }

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
        background-color: ${(props) =>
          props.theme.filesPanels.aside.backgroundColor};
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

  const onChangeRoomOwner = async (
    user,
    selectedAccess,
    newFooterInputValue,
    isChecked,
  ) => {
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
  filter.role = [EmployeeType.Admin, EmployeeType.User];

  const asideComponent = (
    <StyledChangeRoomOwner showBackButton={showBackButton}>
      <Backdrop onClick={onClose} visible={visible} zIndex={320} isAside />
      <Aside
        currentDeviceType={currentDeviceType}
        className="header_aside-panel"
        visible={visible}
        onClose={onClose}
        withoutHeader
        withoutBodyScroll
      >
        <PeopleSelector
          withCancelButton
          cancelButtonLabel=""
          onCancel={onClose}
          onSubmit={onChangeRoomOwner}
          submitButtonLabel={
            showBackButton ? t("Common:SelectAction") : t("Files:AssignOwner")
          }
          disableSubmitButton={false}
          withHeader
          headerProps={{
            onCloseClick: onClose,
            onBackClick,
            withoutBackButton: !showBackButton,
            headerLabel: t("Files:ChangeTheRoomOwner"),
          }}
          filter={filter}
          isLoading={isLoading}
          withFooterCheckbox={!showBackButton}
          footerCheckboxLabel={t("Files:LeaveTheRoom")}
          isChecked={!showBackButton}
          withOutCurrentAuthorizedUser
          filterUserId={roomOwnerId}
          currentUserId={userId}
          disableDisabledUsers
          withInfo
          infoText={t("CreateEditRoomDialog:PeopleSelectorInfo", {
            productName: t("Common:ProductName"),
          })}
          emptyScreenHeader={t("Common:NotFoundUsers")}
          emptyScreenDescription={t("CreateEditRoomDialog:PeopleSelectorInfo", {
            productName: t("Common:ProductName"),
          })}
          className="change-owner_people-selector"
        />
      </Aside>
    </StyledChangeRoomOwner>
  );

  return <Portal visible={visible} element={asideComponent} />;
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
  },
)(
  observer(
    withTranslation(["Files", "CreateEditRoomDialog", "Common"])(
      ChangeRoomOwner,
    ),
  ),
);
