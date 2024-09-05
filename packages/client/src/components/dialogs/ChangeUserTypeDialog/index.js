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

import React from "react";

import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { withTranslation, Trans } from "react-i18next";

const ChangeUserTypeDialog = ({
  t,
  visible,
  firstType,
  secondType,
  onCloseAction,
  onChangeUserType,
  isRequestRunning,
}) => {
  return (
    <ModalDialog
      visible={visible}
      onClose={onCloseAction}
      displayType="modal"
      autoMaxHeight
    >
      <ModalDialog.Header>{t("ChangeUserTypeHeader")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text>
          {firstType ? (
            <Trans
              i18nKey="ChangeUserTypeMessage"
              ns="ChangeUserTypeDialog"
              t={t}
            >
              Users with the <b>'{{ firstType }}'</b> type will be moved to{" "}
              <b>'{{ secondType }}'</b> type.
            </Trans>
          ) : (
            <Trans
              i18nKey="ChangeUserTypeMessageMulti"
              ns="ChangeUserTypeDialog"
              t={t}
            >
              The selected users will be moved to <b>'{{ secondType }}'</b>{" "}
              type.
            </Trans>
          )}{" "}
          {t("ChangeUserTypeMessageWarning", {
            productName: t("Common:ProductName"),
          })}
        </Text>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="change-user-type-modal_submit"
          label={t("ChangeUserTypeButton")}
          size="normal"
          scale
          primary
          onClick={onChangeUserType}
          isLoading={isRequestRunning}
          //isDisabled={!userIDs.length}
        />
        <Button
          id="change-user-type-modal_cancel"
          label={t("Common:CancelButton")}
          size="normal"
          scale
          onClick={onCloseAction}
          isDisabled={isRequestRunning}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default withTranslation(["ChangeUserTypeDialog", "People", "Common"])(
  ChangeUserTypeDialog,
);
