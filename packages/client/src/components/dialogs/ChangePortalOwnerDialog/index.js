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

import CrossReactSvgUrl from "PUBLIC_DIR/images/cross.react.svg?url";
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
            ownerName: selectedUser.label,
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
    t("ManagePortal"),
    t("ManageUser"),
    t("ChangePortalOwner:ChangeOwner"),
    t("BackupPortal"),
    t("DeactivateOrDeletePortal"),
  ];

  return (
    <ModalDialog
      displayType={"aside"}
      visible={visible}
      onClose={onCloseAction}
      withBodyScroll
      withFooterBorder
      containerVisible={selectorVisible}
    >
      {selectorVisible && (
        <ModalDialog.Container>
          <PeopleSelector
            withCancelButton
            cancelButtonLabel=""
            onCancel={onBackClick}
            excludeItems={[id]}
            submitButtonLabel={t("Common:SelectAction")}
            onSubmit={onAccept}
            disableSubmitButton={false}
            withHeader
            headerProps={{
              onBackClick,
              withoutBackButton: false,
              headerLabel: "",
            }}
            currentUserId={id}
            disableDisabledUsers
          />
        </ModalDialog.Container>
      )}
      <ModalDialog.Header>{t("Translations:OwnerChange")}</ModalDialog.Header>
      <ModalDialog.Body>
        <StyledOwnerInfo>
          <Avatar
            className="avatar"
            role={"owner"}
            source={avatar}
            size={"big"}
          />
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
            {t("NewPortalOwner")}
          </Text>
          <Text className="description" noSelect title={t("ChangeInstruction")}>
            {t("ChangeInstruction")}
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
              />
            </StyledSelectedOwner>

            <Link
              type={"action"}
              isHovered
              fontWeight={600}
              onClick={onTogglePeopleSelector}
            >
              {t("ChangeUser")}
            </Link>
          </StyledSelectedOwnerContainer>
        ) : (
          <StyledPeopleSelector>
            <SelectorAddButton
              className="selector-add-button"
              onClick={onTogglePeopleSelector}
            />
            <Text
              className="label"
              noSelect
              title={t("Translations:ChooseFromList")}
            >
              {t("Translations:ChooseFromList")}
            </Text>
          </StyledPeopleSelector>
        )}

        <StyledAvailableList>
          <Text className="list-header" noSelect title={t("PortalOwnerCan")}>
            {t("PortalOwnerCan")}
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
            />
            <Button
              tabIndex={5}
              label={t("Common:CancelButton")}
              size="normal"
              scale
              onClick={onCloseAction}
              isDisabled={isLoading}
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
  withTranslation([
    "ChangePortalOwner",
    "Common",
    "Translations",
    "ProfileAction",
    "Settings",
  ])(observer(ChangePortalOwnerDialog)),
);
