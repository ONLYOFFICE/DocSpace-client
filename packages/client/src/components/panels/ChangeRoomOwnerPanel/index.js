// (c) Copyright Ascensio System SIA 2009-2025
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

import { useMemo } from "react";
import { inject, observer } from "mobx-react";
import styled, { css } from "styled-components";
import PeopleSelector from "@docspace/shared/selectors/People";
import { withTranslation } from "react-i18next";
import Filter from "@docspace/shared/api/people/filter";
import { EmployeeType, EmployeeStatus } from "@docspace/shared/enums";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";

const StyledChangeRoomOwner = styled.div`
  display: contents;

  .change-owner_people-selector {
    overflow: visible;
  }

  ${({ withFooterCheckbox }) =>
    withFooterCheckbox &&
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
    tReady,
    visible,
    setIsVisible,
    showBackButton,
    onOwnerChange,
    roomOwnerId,
    changeRoomOwner,
    userId,
    useModal = true,
    isAIAgent,
  } = props;

  const handleClosePanel = () => {
    const { onClose } = props;
    if (onClose) onClose();
    setIsVisible(false);
  };

  const onChangeRoomOwner = async (
    user,
    selectedAccess,
    newFooterInputValue,
    isChecked,
  ) => {
    if (showBackButton) {
      onOwnerChange && onOwnerChange(user[0]);
    } else {
      await changeRoomOwner(t, user[0]?.id, isChecked);
    }
    handleClosePanel();
  };

  const onBackClick = () => {
    handleClosePanel();
  };

  const filter = useMemo(() => {
    const newFilter = Filter.getDefault();
    newFilter.role = [EmployeeType.Admin, EmployeeType.RoomAdmin];
    newFilter.employeeStatus = EmployeeStatus.Active;
    return newFilter;
  }, []);

  const ownerIsCurrentUser = roomOwnerId === userId;

  const headerLabel = isAIAgent
    ? t("Files:ChangeTheAgentOwner")
    : t("Files:ChangeTheRoomOwner");

  const infoText = isAIAgent
    ? t("Files:ChangeAgentOwnerSelectorInfo", {
        productName: t("Common:ProductName"),
      })
    : t("CreateEditRoomDialog:PeopleSelectorInfo", {
        productName: t("Common:ProductName"),
      });

  const footerCheckboxLabel = isAIAgent
    ? t("Files:LeaveTheAgent")
    : t("Files:LeaveTheRoom");

  const selectorComponent = (
    <PeopleSelector
      withCancelButton
      onCancel={handleClosePanel}
      cancelButtonLabel=""
      disableSubmitButton={false}
      submitButtonLabel={showBackButton ? "" : t("Files:AssignOwner")}
      onSubmit={onChangeRoomOwner}
      withHeader
      headerProps={{
        onCloseClick: handleClosePanel,
        onBackClick,
        withoutBackButton: !showBackButton,
        headerLabel,
      }}
      filter={filter}
      withFooterCheckbox={!showBackButton ? ownerIsCurrentUser : null}
      footerCheckboxLabel={footerCheckboxLabel}
      isChecked={!showBackButton}
      withOutCurrentAuthorizedUser
      filterUserId={roomOwnerId}
      currentUserId={userId}
      disableDisabledUsers
      withInfo
      infoText={infoText}
      emptyScreenHeader={t("Common:NotFoundMembers")}
      emptyScreenDescription={infoText}
      className="change-owner_people-selector"
      data-test-id="change_owner_people_selector"
    />
  );

  return useModal ? (
    <ModalDialog
      isLoading={!tReady}
      visible={visible}
      onClose={handleClosePanel}
      displayType={ModalDialogType.aside}
      withoutPadding
    >
      <ModalDialog.Body>
        <StyledChangeRoomOwner
          withFooterCheckbox={!showBackButton ? ownerIsCurrentUser : null}
        >
          {selectorComponent}
        </StyledChangeRoomOwner>
      </ModalDialog.Body>
    </ModalDialog>
  ) : (
    selectorComponent
  );
};

export default inject(
  ({
    dialogsStore,
    filesStore,
    selectedFolderStore,
    filesActionsStore,
    userStore,
  }) => {
    const { changeRoomOwnerIsVisible, setChangeRoomOwnerIsVisible } =
      dialogsStore;
    const { selection, bufferSelection } = filesStore;

    const room = selection.length
      ? selection[0]
      : bufferSelection || selectedFolderStore;

    const { id } = userStore.user;

    return {
      visible: changeRoomOwnerIsVisible,
      setIsVisible: setChangeRoomOwnerIsVisible,
      roomOwnerId: room?.createdBy?.id,
      changeRoomOwner: filesActionsStore.changeRoomOwner,
      userId: id,
      isAIAgent: room?.isAIAgent,
    };
  },
)(
  observer(
    withTranslation(["Files", "CreateEditRoomDialog", "Common"])(
      ChangeRoomOwner,
    ),
  ),
);
