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

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";

import { toastr } from "@docspace/shared/components/toast";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/shared/components/button";

// import { inject, observer } from "mobx-react";

import FilesFilter from "@docspace/shared/api/files/filter";

import type { DeleteThirdPartyDialogProps } from "./DeleteThirdPartyDialog.types";

const DeleteThirdPartyDialog = ({
  visible,
  providers,
  removeItem,
  currentFolderId,
  isConnectionViaBackupModule,
  updateInfo,
  deleteThirdParty,
  setThirdPartyProviders,
  setDeleteThirdPartyDialogVisible,
  setConnectedThirdPartyAccount,
}: DeleteThirdPartyDialogProps) => {
  const { t, ready } = useTranslation([
    "DeleteThirdPartyDialog",
    "Common",
    "Translations",
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const onClose = () => setDeleteThirdPartyDialogVisible(false);

  const onDeleteThirdParty = () => {
    setIsLoading(true);

    if (isConnectionViaBackupModule) {
      deleteThirdParty(+removeItem.provider_id)
        .catch((err) => toastr.error(err))
        .finally(() => {
          setConnectedThirdPartyAccount(null);
          updateInfo?.();
          setIsLoading(false);
          onClose();
        });

      return;
    }

    const newProviders = providers.filter(
      (x) => x.provider_id !== removeItem.id,
    );

    deleteThirdParty(+removeItem.id)
      .then(() => {
        setThirdPartyProviders(newProviders);
        if (currentFolderId) {
          const filter = FilesFilter.getDefault();

          filter.folder = currentFolderId.toString();

          navigate(`${location.pathname}?${filter.toUrlParams()}`);
        } else {
          toastr.success(
            t("SuccessDeleteThirdParty", { service: removeItem.title }),
          );
        }
      })
      .catch((err: Error) => toastr.error(err))
      .finally(() => {
        onClose();
        setIsLoading(false);
      });
  };

  return (
    <ModalDialog
      zIndex={310}
      onClose={onClose}
      visible={visible}
      isLoading={!ready}
      displayType={ModalDialogType.modal}
    >
      <ModalDialog.Header>{t("DisconnectCloudTitle")}</ModalDialog.Header>
      <ModalDialog.Body>
        {t("DisconnectCloudMessage", {
          service: removeItem.title,
          account: removeItem.providerKey,
        })}
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          scale
          primary
          isLoading={isLoading}
          size={ButtonSize.normal}
          label={t("Common:OKButton")}
          onClick={onDeleteThirdParty}
        />
        <Button
          scale
          onClick={onClose}
          isLoading={isLoading}
          size={ButtonSize.normal}
          label={t("Common:CancelButton")}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default DeleteThirdPartyDialog;

// export default inject(
//   ({
//     filesStore,
//     filesSettingsStore,
//     dialogsStore,
//     selectedFolderStore,
//     backup,
//   }) => {
//     const { providers, setThirdPartyProviders, deleteThirdParty } =
//       filesSettingsStore.thirdPartyStore;
//     const { setIsLoading } = filesStore;
//     const {
//       selectedThirdPartyAccount: backupConnectionItem,
//       setConnectedThirdPartyAccount,
//     } = backup;
//     const {
//       deleteThirdPartyDialogVisible: visible,
//       setDeleteThirdPartyDialogVisible,
//       removeItem: storeItem,
//     } = dialogsStore;

//     const removeItem = backupConnectionItem ?? storeItem;

//     const { id } = selectedFolderStore;

//     return {
//       currentFolderId: id,

//       setIsLoadingStore: setIsLoading,

//       providers,
//       visible,
//       removeItem,

//       setThirdPartyProviders,
//       deleteThirdParty,
//       setDeleteThirdPartyDialogVisible,
//       setConnectedThirdPartyAccount,
//     };
//   },
// )(
//   withTranslation(["DeleteThirdPartyDialog", "Common", "Translations"])(
//     observer(DeleteThirdPartyDialog),
//   ),
// );
