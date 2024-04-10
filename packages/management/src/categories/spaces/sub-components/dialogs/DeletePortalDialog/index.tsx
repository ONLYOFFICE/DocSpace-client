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
import ModalDialogContainer from "@docspace/client/src/components/dialogs/ModalDialogContainer";
import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";
import { useTranslation, Trans } from "react-i18next";
import { observer } from "mobx-react";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import tryRedirectTo from "@docspace/shared/utils/tryRedirectTo";
import { useStore } from "SRC_DIR/store";
import { Link } from "@docspace/shared/components/link";

const DeletePortalDialog = () => {
  const { spacesStore, settingsStore } = useStore();
  const { currentColorScheme } = settingsStore;

  const {
    currentPortal,
    deletePortalDialogVisible: visible,
    setDeletePortalDialogVisible,
  } = spacesStore;

  const { t } = useTranslation(["Management", "Common"]);

  const { owner, domain } = currentPortal;
  const { displayName, email } = owner;

  const onClose = () => setDeletePortalDialogVisible(false);

  const onDelete = () => {
    const protocol = window?.location?.protocol;
    return window.open(
      `${protocol}//${domain}/portal-settings/delete-data/deletion`,
      "_self"
    );
  };

  return (
    <ModalDialogContainer
      visible={visible}
      onClose={onClose}
      displayType="modal"
    >
      <ModalDialog.Header>{t("Common:Warning")}</ModalDialog.Header>
      <ModalDialog.Body className="">
        <Trans
          i18nKey="DeletePortalText"
          t={t}
          domain={domain}
          displayName={displayName}
          email={email}
        >
          Please note: only the owner is able to delete the selected DocSpace.
          The owner of <strong>{{ domain }}</strong> is{" "}
          <strong>{{ displayName }}</strong>{" "}
          <Link
            className="email-link"
            type="page"
            href={`mailto:${email}`}
            noHover
            color={currentColorScheme?.main?.accent}
            title={email}
          >
            {{ email }}{" "}
          </Link>
          . If you are not the owner, you will not be able to access the
          DocSpace deletion settings by clicking the DELETE button and will be
          redirected to the Rooms section.
        </Trans>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          key="CreateButton"
          label={t("Common:Delete")}
          size="normal"
          scale
          primary
          onClick={onDelete}
        />
        <Button
          key="CancelButton"
          label={t("Common:CancelButton")}
          size="normal"
          onClick={onClose}
          scale
        />
      </ModalDialog.Footer>
    </ModalDialogContainer>
  );
};

export default observer(DeletePortalDialog);
