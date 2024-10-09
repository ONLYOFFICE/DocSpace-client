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
import styled from "styled-components";
import { useTranslation, Trans } from "react-i18next";
import { observer } from "mobx-react";

import { Button, ButtonSize } from "@docspace/shared/components/button";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { Link } from "@docspace/shared/components/link";
import { Text } from "@docspace/shared/components/text";
import { toUrlParams } from "@docspace/shared/utils/common";

import { useStore } from "SRC_DIR/store";

const StyledModalDialog = styled(ModalDialog)`
  .warning-text {
    color: ${(props) => props.theme.management.errorColor};
    margin-bottom: 8px;
  }
`;

const DeletePortalDialog = () => {
  const { spacesStore, settingsStore } = useStore();
  const { currentColorScheme } = settingsStore;

  const {
    currentPortal,
    deletePortalDialogVisible: visible,
    setDeletePortalDialogVisible,
  } = spacesStore;

  const { t } = useTranslation(["Management", "Settings", "Common"]);

  const { domain } = currentPortal;

  const onClose = () => setDeletePortalDialogVisible(false);

  const onDelete = () => {
    const protocol = window?.location?.protocol;
    const deletePortalData = encodeURIComponent(domain);
    return window.open(
      `${protocol}//${domain}/login?deletePortalData=${deletePortalData}`,
      "_self"
    );
  };

  return (
    <StyledModalDialog
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.modal}
      autoMaxHeight
    >
      <ModalDialog.Header>
        {t("Settings:DeletePortal", { productName: t("Common:ProductName") })}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <Text className="warning-text" fontSize="16px" fontWeight={700}>
          {t("Common:Warning")}!
        </Text>
        <Trans
          i18nKey="DeletePortalText"
          values={{
            docspaceAddress: domain,
          }}
          components={{
            1: <strong />,
          }}
        />
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          key="CreateButton"
          label={t("Common:ContinueButton")}
          size={ButtonSize.normal}
          scale
          primary
          onClick={onDelete}
        />
        <Button
          key="CancelButton"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          onClick={onClose}
          scale
        />
      </ModalDialog.Footer>
    </StyledModalDialog>
  );
};

export default observer(DeletePortalDialog);
