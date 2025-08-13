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
import React from "react";
import { useTranslation } from "react-i18next";

import FormDataCollectionIcon from "PUBLIC_DIR/images/icons/32/form.data.collection.svg";
import RoleBasedFillingIcon from "PUBLIC_DIR/images/icons/32/role.based.filling.svg";
import ShareSvg from "PUBLIC_DIR/images/icons/32/share.svg";

import { ShareFormDialog as ShareFormDialogComponent } from "@docspace/shared/dialogs/share-form-dialog";

import type { TFile, TFilesSettings } from "@docspace/shared/api/files/types";
import { RoomsType, ShareAccessRights } from "@docspace/shared/enums";

import { addExternalLink, getExternalLinks } from "@docspace/shared/api/files";
import { copyDocumentShareLink } from "@docspace/shared/components/share/Share.helpers";
import { toastr } from "@docspace/shared/components/toast";
import { Nullable, TResolver } from "@docspace/shared/types";
import { ShareLinkService } from "@docspace/shared/services/share-link.service";

import { StartFillingSelectorDialogProps } from "@/types";

import StartFillingSelectorDialog from "./StartFillingSelectDialog";

type SubmitFn = StartFillingSelectorDialogProps["onSubmit"];

type ShareFormDialogProps = {
  file: TFile;
  createDefineRoomType: RoomsType;
  filesSettings: TFilesSettings;
  isVisibleStartFillingSelectDialog: boolean;
  onClose: () => void;
  onClickFormRoom: () => void;
  onClickVirtualDataRoom: () => void;
  headerLabelSFSDialog: string;
  onCloseStartFillingSelectDialog: () => void;
  onSubmitStartFillingSelectDialog: SubmitFn;
  getIsDisabledStartFillingSelectDialog: StartFillingSelectorDialogProps["getIsDisabled"];
  openChangeLinkTypeDialog: (
    promise: TResolver<
      Nullable<(res: string) => void>,
      Nullable<(rej: string) => void>
    >,
  ) => void;
};

const ShareFormDialog = ({
  file,
  filesSettings,
  onClose,
  onClickFormRoom,
  onClickVirtualDataRoom,
  headerLabelSFSDialog,
  getIsDisabledStartFillingSelectDialog,
  onCloseStartFillingSelectDialog,
  onSubmitStartFillingSelectDialog,
  isVisibleStartFillingSelectDialog,
  createDefineRoomType,
  openChangeLinkTypeDialog,
}: ShareFormDialogProps) => {
  const { t } = useTranslation("Common");

  const handleClose = () => {
    onClose();
    onCloseStartFillingSelectDialog();
  };

  const onSubmit: SubmitFn = async (...args) => {
    await onSubmitStartFillingSelectDialog(...args);
    handleClose();
  };

  const onClickShareFile = async () => {
    try {
      const res = await getExternalLinks(file.id);

      if (res.items.length === 0) {
        const link = await addExternalLink(
          file.id,
          ShareAccessRights.FormFilling,
          false,
          false,
        );
        return copyDocumentShareLink(link, t);
      }

      if (res.items.length >= 1) {
        const [link] = res.items;

        if (link.access !== ShareAccessRights.FormFilling) {
          handleClose();

          await new Promise<string>((resolve, reject) => {
            openChangeLinkTypeDialog({
              reject,
              resolve,
            });
          });

          const updatedLink = await ShareLinkService.editLink(file, {
            ...link,
            access: ShareAccessRights.FormFilling,
            sharedTo: {
              ...link.sharedTo,
              expirationDate: null,
            },
          });

          return copyDocumentShareLink(updatedLink, t);
        }

        return copyDocumentShareLink(link, t);
      }
    } catch (error) {
      if (error === "canceled") {
        return;
      }

      console.log(error);
      toastr.error(error as Error);
    } finally {
      handleClose();
    }
  };

  const cards = [
    {
      id: "quick-sharing",
      title: t("Common:QuickSharing"),
      description: t("Common:ShareTheOriginalFormForFillingOut"),
      buttonLabel: t("Common:Share"),
      onClick: onClickShareFile,
      icon: <ShareSvg />,
      disabled: !file.canShare,
    },
    {
      id: "form-room",
      title: t("Common:FormDataCollection"),
      description: t("Common:FormDataCollectionDescription"),
      buttonLabel: t("Common:ShareInTheRoom"),
      onClick: onClickFormRoom,
      icon: <FormDataCollectionIcon />,
    },
    {
      id: "virtual-data-room",
      title: t("Common:RoleBasedFilling"),
      description: t("Common:RoleBasedFillingDescription"),
      buttonLabel: t("Common:ShareInTheRoom"),
      onClick: onClickVirtualDataRoom,
      icon: <RoleBasedFillingIcon />,
    },
  ];

  return (
    <ShareFormDialogComponent
      visible
      withBorder
      cards={cards}
      onClose={handleClose}
      containerVisible={isVisibleStartFillingSelectDialog}
      title={t("Common:ShareToFillOut")}
      container={
        <StartFillingSelectorDialog
          isVisible
          fileInfo={file}
          onSubmit={onSubmit}
          filesSettings={filesSettings}
          header={{
            withoutBorder: false,
            onCloseClick: handleClose,
            withoutBackButton: false,
            headerLabel: headerLabelSFSDialog,
            onBackClick: onCloseStartFillingSelectDialog,
          }}
          onClose={handleClose}
          createDefineRoomType={createDefineRoomType}
          getIsDisabled={getIsDisabledStartFillingSelectDialog}
        />
      }
    />
  );
};

export default ShareFormDialog;
