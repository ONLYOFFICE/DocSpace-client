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
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { Button } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";

import ModalDialogContainer from "../ModalDialogContainer";

const LogoutAllSessionDialog = ({
  t,
  connections,
  displayName,
  visible,
  isLoading,
  onClose,
  onRemoveAllSessions,
  onRemoveAllExceptThis,
  isSeveralSelection,
  onLogoutAllSessions,
  onLogoutAllExceptThis,
}) => {
  const [isChecked, setIsChecked] = useState(false);

  const isProfile = location.pathname.includes("/profile");

  const onChangeCheckbox = () => {
    setIsChecked((prev) => !prev);
  };

  const onClickLogout = () => {
    const exceptId = connections[0]?.id;
    if (!isChecked) {
      onLogoutAllSessions(t);
      onClose();
    } else {
      onLogoutAllExceptThis(t, exceptId);
      onClose();
    }
  };

  const onClickRemove = () => {
    if (isChecked) {
      onRemoveAllSessions();
    } else {
      onRemoveAllExceptThis();
    }
  };

  const bodySubtitle =
    isSeveralSelection || isProfile
      ? t("Profile:LogoutDescription")
      : t("Profile:LogoutCurrentUserDescription", { displayName });

  const bodyText = !isSeveralSelection && (
    <>
      <Text style={{ margin: "15px 0px" }}>
        {t("Profile:DescriptionForSecurity")}
      </Text>
      <Checkbox
        style={{ display: "inline-flex" }}
        label={t("Profile:ChangePasswordAfterLoggingOut")}
        isChecked={isChecked}
        onChange={onChangeCheckbox}
      />
    </>
  );

  return (
    <ModalDialogContainer
      visible={visible}
      onClose={onClose}
      displayType="modal"
    >
      <ModalDialog.Header>
        {t("Profile:LogoutAllActiveConnections")}
      </ModalDialog.Header>
      <ModalDialog.Body>
        {bodySubtitle}
        {bodyText}
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          className="logout"
          key="Logout"
          label={t("Common:Logout")}
          size="normal"
          scale
          primary={true}
          onClick={isProfile ? onClickRemove : onClickLogout}
          isLoading={isLoading}
        />
        <Button
          className="cancel-button"
          key="CloseBtn"
          label={t("Common:CancelButton")}
          size="normal"
          scale
          onClick={onClose}
          isDisabled={isLoading}
        />
      </ModalDialog.Footer>
    </ModalDialogContainer>
  );
};

export default inject(({ peopleStore }) => {
  const { isSeveralSelection } = peopleStore.selectionStore;

  return {
    isSeveralSelection,
  };
})(observer(LogoutAllSessionDialog));
