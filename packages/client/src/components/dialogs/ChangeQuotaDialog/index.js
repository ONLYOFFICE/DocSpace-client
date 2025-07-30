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

import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Button } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { QuotaForm } from "@docspace/shared/components/quota-form";

import StyledBodyContent from "./StyledComponent";

const ChangeQuotaDialog = (props) => {
  const {
    visible,
    onSaveClick,
    onCloseClick,
    onSetQuotaBytesSize,
    isError,
    isLoading,
    initialSize,
    size,
  } = props;
  const { t } = useTranslation("Common");
  return (
    <ModalDialog visible={visible} onClose={onCloseClick}>
      <ModalDialog.Header>{t("Common:ChangeQuota")}</ModalDialog.Header>
      <ModalDialog.Body>
        <StyledBodyContent>
          <Text noSelect>{t("Common:SetQuotaStorageLimit")}</Text>
          <QuotaForm
            onSetQuotaBytesSize={onSetQuotaBytesSize}
            isLoading={isLoading}
            isError={isError}
            initialSize={initialSize}
            isAutoFocussed
          />
        </StyledBodyContent>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          label={t("Common:OKButton")}
          size="normal"
          primary
          onClick={onSaveClick}
          isLoading={isLoading}
          isDisabled={initialSize == size || size.trim() === ""}
          scale
        />
        <Button
          label={t("Common:CancelButton")}
          size="normal"
          onClick={onCloseClick}
          isDisabled={isLoading}
          scale
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(({ dialogsStore }) => {
  const { changeQuotaDialogVisible, setChangeQuotaDialogVisible } =
    dialogsStore;

  return {
    changeQuotaDialogVisible,
    setChangeQuotaDialogVisible,
  };
})(observer(ChangeQuotaDialog));
