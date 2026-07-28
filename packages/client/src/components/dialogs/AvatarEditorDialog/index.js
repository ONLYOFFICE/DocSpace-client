/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { AvatarEditorDialog as AvatarEditorDialogUI } from "@docspace/ui-kit/components/avatar-editor-dialog";
import { toastr } from "@docspace/ui-kit/components/toast";

import { loadAvatar } from "@docspace/shared/api/people";
import { dataUrlToFile } from "@docspace/shared/utils/dataUrlToFile";

const AvatarEditorDialog = (props) => {
  const { t } = useTranslation([
    "Profile",
    "PeopleTranslations",
    "Common",
    "CreateEditRoomDialog",
    "Ldap",
  ]);

  const {
    visible,
    onClose,
    onSave,
    profile,
    updateCreatedAvatar,
    setHasAvatar,
    maxImageUploadSize,
    onChangeImage,
    image,
    onChangeFile,
    isProfileUpload,
    setPreview,
    dataTestId,
    isAIAgentsFolderRoot,
  } = props;

  const [isLoading, setIsLoading] = useState(false);

  const editorBorderRadius = isProfileUpload ? 400 : 110;

  const avatarTitle = isProfileUpload
    ? t("Ldap:LdapAvatar")
    : isAIAgentsFolderRoot
      ? t("RoomLogoCover:AgentCover")
      : t("Common:RoomCover");

  const onCloseModal = () => {
    onChangeImage({ x: 0.5, y: 0.5, zoom: 1, uploadedFile: null });
    setPreview && setPreview("");
    onClose && onClose();
  };

  const onSaveClick = async (img, preview) => {
    setIsLoading(true);

    const file = await dataUrlToFile(preview);

    const avatarData = new FormData();
    avatarData.append("file", file);
    avatarData.append("Autosave", true);

    try {
      const res = await loadAvatar(profile.id, avatarData);

      if (res.success) {
        res.data && updateCreatedAvatar(res.data);
        setHasAvatar(true);
        toastr.success(t("Common:ChangesSavedSuccessfully"));
      } else {
        throw new Error(t("Common:ErrorInternalServer"));
      }

      onClose();
    } catch (error) {
      console.error(error);
      toastr.error(error);
    } finally {
      onChangeImage({ x: 0.5, y: 0.5, zoom: 1, uploadedFile: null });
      setIsLoading(false);
    }
  };

  const onSaveAction = async (image, preview) => {
    setIsLoading(true);
    await onSave(image, preview);
    setIsLoading(false);
  };

  return (
    <AvatarEditorDialogUI
      t={t}
      visible={visible}
      title={avatarTitle}
      image={image}
      isLoading={isLoading}
      editorBorderRadius={editorBorderRadius}
      maxImageSize={maxImageUploadSize}
      dataTestId={dataTestId}
      onClose={onCloseModal}
      onSave={isProfileUpload ? onSaveClick : onSaveAction}
      onChangeImage={onChangeImage}
      onChangeFile={onChangeFile}
    />
  );
};

export default inject(
  ({ peopleStore, settingsStore, userStore, treeFoldersStore }) => {
    const { targetUserStore } = peopleStore;
    const { maxImageUploadSize } = settingsStore;

    const { user: profile } = userStore;

    const { updateCreatedAvatar, setHasAvatar } = targetUserStore;
    const { isAIAgentsFolderRoot } = treeFoldersStore;

    return {
      profile,
      setHasAvatar,
      updateCreatedAvatar,
      maxImageUploadSize,
      isAIAgentsFolderRoot,
    };
  },
)(observer(AvatarEditorDialog));

