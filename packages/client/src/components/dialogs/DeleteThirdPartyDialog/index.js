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

import React, { useState } from "react";
import { toastr } from "@docspace/shared/components/toast";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Button } from "@docspace/shared/components/button";

import { withTranslation } from "react-i18next";

import { inject, observer } from "mobx-react";
import { useNavigate, useLocation } from "react-router";
import FilesFilter from "@docspace/shared/api/files/filter";

const DeleteThirdPartyDialog = (props) => {
  const {
    t,
    tReady,
    visible,
    providers,
    removeItem,

    currentFolderId,

    deleteThirdParty,
    setThirdPartyProviders,
    setDeleteThirdPartyDialogVisible,
    isConnectionViaBackupModule,
    updateInfo,
    setConnectedThirdPartyAccount,
  } = props;

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
          updateInfo && updateInfo();
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

          filter.folder = currentFolderId;

          navigate(`${location.pathname}?${filter.toUrlParams()}`);
        } else {
          toastr.success(
            t("SuccessDeleteThirdParty", { service: removeItem.title }),
          );
        }
      })
      .catch((err) => toastr.error(err))
      .finally(() => {
        onClose();
        setIsLoading(false);
      });
  };

  return (
    <ModalDialog
      isLoading={!tReady}
      visible={visible}
      zIndex={310}
      onClose={onClose}
    >
      <ModalDialog.Header>{t("DisconnectCloudTitle")}</ModalDialog.Header>
      <ModalDialog.Body>
        {t("ThirdPartyDisconnectPrompt", {
          service: removeItem.title,
          account: removeItem.providerKey,
        })}
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          isLoading={isLoading}
          label={t("Common:OKButton")}
          size="normal"
          primary
          scale
          onClick={onDeleteThirdParty}
        />
        <Button
          isLoading={isLoading}
          label={t("Common:CancelButton")}
          size="normal"
          scale
          onClick={onClose}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(
  ({
    filesStore,
    filesSettingsStore,
    dialogsStore,
    selectedFolderStore,
    backup,
  }) => {
    const { providers, setThirdPartyProviders, deleteThirdParty } =
      filesSettingsStore.thirdPartyStore;
    const { setIsLoading } = filesStore;
    const {
      selectedThirdPartyAccount: backupConnectionItem,
      setConnectedThirdPartyAccount,
    } = backup;
    const {
      deleteThirdPartyDialogVisible: visible,
      setDeleteThirdPartyDialogVisible,
      removeItem: storeItem,
    } = dialogsStore;

    const removeItem = backupConnectionItem ?? storeItem;

    const { id } = selectedFolderStore;

    return {
      currentFolderId: id,

      setIsLoadingStore: setIsLoading,

      providers,
      visible,
      removeItem,

      setThirdPartyProviders,
      deleteThirdParty,
      setDeleteThirdPartyDialogVisible,
      setConnectedThirdPartyAccount,
    };
  },
)(
  withTranslation(["DeleteThirdPartyDialog", "Common", "Translations"])(
    observer(DeleteThirdPartyDialog),
  ),
);
