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

import CrossReactSvgUrl from "PUBLIC_DIR/images/icons/12/cross.react.svg?url";
import React from "react";
import { inject, observer } from "mobx-react";
import { ReactSVG } from "react-svg";
import { withTranslation } from "react-i18next";

import PeopleSelector from "@docspace/shared/selectors/People";

import Filter from "@docspace/shared/api/people/filter";

import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Avatar } from "@docspace/shared/components/avatar";
import { Text } from "@docspace/shared/components/text";
import { SelectorAddButton } from "@docspace/shared/components/selector-add-button";
import { Button } from "@docspace/shared/components/button";
import { Link } from "@docspace/shared/components/link";
import { toastr } from "@docspace/shared/components/toast";

import { EmployeeActivationStatus } from "@docspace/shared/enums";
import {
  StyledOwnerInfo,
  StyledPeopleSelectorInfo,
  StyledPeopleSelector,
  StyledAvailableList,
  StyledFooterWrapper,
  StyledSelectedOwnerContainer,
  StyledSelectedOwner,
} from "./StyledDialog";

const ChangePortalOwnerDialog = ({
  t,
  visible,
  onClose,

  sendOwnerChange,

  displayName,
  avatar,
  id,
  currentColorScheme,
}) => {
  const [selectorVisible, setSelectorVisible] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState(null);

  const onBackClick = () => {
    setSelectorVisible(false);
  };

  const onTogglePeopleSelector = () => {
    if (isLoading) return;
    setSelectedUser(null);
    setSelectorVisible((val) => !val);
  };

  const onAccept = (item) => {
    setSelectorVisible(false);
    setSelectedUser({ ...item[0] });
  };

  const onChangeAction = () => {
    setIsLoading(true);
    sendOwnerChange(selectedUser.id)
      .then(() => {
        onClose && onClose();
        toastr.success(
          t("Settings:ConfirmEmailSended", {
            ownerName: displayName,
          }),
        );
      })
      .catch((error) => {
        toastr.error(error?.response?.data?.error?.message);
        onClose && onClose();
      });
  };

  const onCloseAction = () => {
    if (isLoading) return;
    onClose && onClose();
  };

  const onClearSelectedItem = () => {
    if (isLoading) return;
    setSelectedUser(null);
  };

  const ownerRights = [
    t("DoTheSame"),
    t("AppointAdmin"),
    t("SetAccessRights"),
    t("ManagePortal", { productName: t("Common:ProductName") }),
    t("ManageUser"),
    t("ChangePortalOwner:ChangeOwner", {
      productName: t("Common:ProductName"),
    }),
    t("BackupPortal", { productName: t("Common:ProductName") }),
    t("DeactivateOrDeletePortal", { productName: t("Common:ProductName") }),
  ];

  const filter = React.useMemo(() => {
    const newFilter = new Filter();

    newFilter.employeeStatus = EmployeeActivationStatus.Activated;

    return newFilter;
  }, []);

  return (
    <ModalDialog
      displayType="aside"
      visible={visible}
      onClose={onCloseAction}
      withBodyScroll
      containerVisible={selectorVisible}
    >
      {selectorVisible ? (
        <ModalDialog.Container>
          <PeopleSelector
            withCancelButton
            cancelButtonLabel=""
            onCancel={onBackClick}
            excludeItems={[id]}
            submitButtonLabel=""
            disableSubmitButton={false}
            onSubmit={onAccept}
            withHeader
            headerProps={{
              onCloseClick: onCloseAction,
              onBackClick,
              withoutBackButton: false,
              headerLabel: "",
            }}
            currentUserId={id}
            disableDisabledUsers
            filter={filter}
            dataTestId="change_portal_owner_people_selector"
          />
        </ModalDialog.Container>
      ) : null}
      <ModalDialog.Header>{t("Translations:OwnerChange")}</ModalDialog.Header>
      <ModalDialog.Body>
        <StyledOwnerInfo>
          <Avatar className="avatar" role="owner" source={avatar} size="big" />
          <div className="info">
            <Text className="display-name" noSelect title={displayName}>
              {displayName}
            </Text>
            <Text className="status" noSelect title={t("Common:Owner")}>
              {t("Common:Owner")}
            </Text>
          </div>
        </StyledOwnerInfo>

        <StyledPeopleSelectorInfo>
          <Text className="new-owner" noSelect title={t("NewPortalOwner")}>
            {t("NewPortalOwner", { productName: t("Common:ProductName") })}
          </Text>
          <Text className="description" noSelect title={t("ChangeInstruction")}>
            {t("ChangeInstruction", { productName: t("Common:ProductName") })}
          </Text>
        </StyledPeopleSelectorInfo>

        {selectedUser ? (
          <StyledSelectedOwnerContainer>
            <StyledSelectedOwner currentColorScheme={currentColorScheme}>
              <Text className="text">{selectedUser.label}</Text>
              <ReactSVG
                className="cross-icon"
                onClick={onClearSelectedItem}
                src={CrossReactSvgUrl}
                data-testid="change_portal_owner_clear_selected_owner_button"
              />
            </StyledSelectedOwner>

            <Link
              type="action"
              isHovered
              fontWeight={600}
              onClick={onTogglePeopleSelector}
              dataTestId="change_portal_owner_change_user_link"
            >
              {t("ChangeUser")}
            </Link>
          </StyledSelectedOwnerContainer>
        ) : (
          <StyledPeopleSelector>
            <SelectorAddButton
              className="selector-add-button"
              onClick={onTogglePeopleSelector}
              label={t("Translations:ChooseFromList")}
              noSelect
              titleText={t("Translations:ChooseFromList")}
              testId="change_portal_owner_choose_from_list_button"
            />
          </StyledPeopleSelector>
        )}

        <StyledAvailableList>
          <Text className="list-header" noSelect title={t("PortalOwnerCan")}>
            {t("PortalOwnerCan", { productName: t("Common:ProductName") })}
          </Text>

          {ownerRights?.map((item) => (
            <Text key={item} className="list-item" noSelect title={item}>
              — {item};
            </Text>
          ))}
        </StyledAvailableList>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <StyledFooterWrapper>
          <Text className="info" noSelect>
            {t("Settings:AccessRightsChangeOwnerConfirmText")}
          </Text>
          <div className="button-wrapper">
            <Button
              tabIndex={5}
              label={t("Common:ChangeButton")}
              size="normal"
              primary
              scale
              isDisabled={!selectedUser}
              onClick={onChangeAction}
              isLoading={isLoading}
              testId="change_portal_owner_change_button"
            />
            <Button
              tabIndex={5}
              label={t("Common:CancelButton")}
              size="normal"
              scale
              onClick={onCloseAction}
              isDisabled={isLoading}
              testId="change_portal_owner_cancel_button"
            />
          </div>
        </StyledFooterWrapper>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(({ setup, userStore, settingsStore }) => {
  const { displayName, avatar, id } = userStore.user;
  const { currentColorScheme } = settingsStore;
  const { sendOwnerChange } = setup;

  return { displayName, avatar, id, sendOwnerChange, currentColorScheme };
})(
  withTranslation(["ChangePortalOwner", "Common", "Translations", "Settings"])(
    observer(ChangePortalOwnerDialog),
  ),
);
