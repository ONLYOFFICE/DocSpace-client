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

import { useState } from "react";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { Button } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";

const LogoutAllSessionDialog = ({
  t,
  visible,
  onClose,
  isLoading,
  onRemoveAllSessions,
  onRemoveAllExceptThis,
}) => {
  const [isChecked, setIsChecked] = useState(false);

  const onChangeCheckbox = () => {
    setIsChecked((prev) => !prev);
  };

  const onClickLogout = () => {
    isChecked ? onRemoveAllSessions() : onRemoveAllExceptThis();
  };

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      displayType="modal"
      autoMaxHeight
    >
      <ModalDialog.Header>{t("Common:LogoutButton")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text>{t("Profile:LogoutDescription")}</Text>
        <Text style={{ margin: "15px 0" }}>
          {t("Profile:DescriptionForSecurity")}
        </Text>
        <div
          style={{
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Checkbox
            className="change-password"
            isChecked={isChecked}
            onChange={onChangeCheckbox}
            label={t("Profile:ChangePasswordAfterLoggingOut")}
            testId="dialog_change_password_checkbox"
          />
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          className="logout"
          key="LogoutBtn"
          label={t("Profile:LogoutBtn")}
          size="normal"
          scale
          primary
          onClick={onClickLogout}
          isLoading={isLoading}
          testId="dialog_logout_button"
        />
        <Button
          className="cancel-button"
          key="CloseBtn"
          label={t("Common:CancelButton")}
          size="normal"
          scale
          onClick={onClose}
          isDisabled={isLoading}
          testId="dialog_cancel_button"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default LogoutAllSessionDialog;
