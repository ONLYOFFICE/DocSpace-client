import React from "react";
import { RoomsType, ShareAccessRights } from "@docspace/shared/enums";

import EmptyFormRoomDarkIcon from "PUBLIC_DIR/images/emptyview/empty.form.room.dark.svg";
import EmptyFormRoomLightIcon from "PUBLIC_DIR/images/emptyview/empty.form.room.light.svg";

import CreateNewFormIcon from "PUBLIC_DIR/images/emptyview/create.new.form.svg";
import CreateFromFormIcon from "PUBLIC_DIR/images/emptyview/create.from.document.form.svg";
import InviteUserFormIcon from "PUBLIC_DIR/images/emptyview/invite.user.svg";
import UploadPDFFormIcon from "PUBLIC_DIR/images/emptyview/upload.pdf.form.svg";
import UploadDevicePDFFormIcon from "PUBLIC_DIR/images/emptyview/upload.device.pdf.form.svg";

import type { Nullable, TTranslation } from "@docspace/shared/types";
import type { TRoomSecurity } from "@docspace/shared/api/rooms/types";
import type { TFolderSecurity } from "@docspace/shared/api/files/types";
import type { EmptyViewItemType } from "@docspace/shared/components/empty-view";
import { PORTAL } from "@docspace/shared/constants";

import type { OptionActions } from "./EmptyViewContainer.types";

export const getDescription = (
  type: RoomsType,
  t: TTranslation,
  access: Nullable<ShareAccessRights> | undefined,
): string => {
  const isFormFiller = access === ShareAccessRights.FormFilling;

  switch (type) {
    case RoomsType.FormRoom:
      if (isFormFiller) return t("EmptyView:FormFillerRoomEmptyDescription");
      return t("EmptyView:FormRoomEmptyDescription");
    case RoomsType.EditingRoom:
      return "";
    case RoomsType.PublicRoom:
      return "";
    case RoomsType.CustomRoom:
      return "";
    default:
      return "";
  }
};

export const getTitle = (
  type: RoomsType,
  t: TTranslation,
  access: Nullable<ShareAccessRights> | undefined,
): string => {
  const isFormFiller = access === ShareAccessRights.FormFilling;
  switch (type) {
    case RoomsType.FormRoom:
      if (isFormFiller) return t("EmptyView:FormFillerRoomEmptyTitle");
      return t("EmptyView:FormRoomEmptyTitle");
    case RoomsType.EditingRoom:
      return "";
    case RoomsType.PublicRoom:
      return "";
    case RoomsType.CustomRoom:
      return "";
    default:
      return "";
  }
};

export const getIcon = (type: RoomsType, isBaseTheme: boolean) => {
  switch (type) {
    case RoomsType.FormRoom:
      return isBaseTheme ? (
        <EmptyFormRoomLightIcon />
      ) : (
        <EmptyFormRoomDarkIcon />
      );
    case RoomsType.EditingRoom:
      return <div />;
    case RoomsType.PublicRoom:
      return <div />;
    case RoomsType.CustomRoom:
      return <div />;
    default:
      // eslint-disable-next-line react/jsx-no-useless-fragment
      return <></>;
  }
};

export const getOptions = (
  type: RoomsType,
  security: Nullable<TFolderSecurity | TRoomSecurity>,
  t: TTranslation,
  access: Nullable<ShareAccessRights> | undefined,
  actions: OptionActions,
): EmptyViewItemType[] => {
  const isFormFiller = access === ShareAccessRights.FormFilling;
  const powerUser = access === ShareAccessRights.Collaborator;

  const createNewForm = {
    title: t("EmptyView:CreateNewFormOptionTitle"),
    description: t("EmptyView:CreateNewFormOptionDescription"),
    icon: <CreateNewFormIcon />,
    key: "create-form",
    onClick: actions.onCreateDocumentForm,
    disabled: !security?.Create,
  };

  const uploadFromDocSpace = {
    title: t("EmptyView:UploadPDFFormOptionTitle"),
    description: t("EmptyView:UploadPDFFormOptionDescription", {
      portalName: PORTAL,
    }),
    icon: <UploadPDFFormIcon />,
    key: "upload-pdf-form",
    onClick: actions.uploadPDFForm,
    disabled: !security?.Create,
  };

  const uploadFromDevice = {
    title: t("EmptyView:UploadDevicePDFFormOptionTitle"),
    description: t("EmptyView:UploadDevicePDFFormOptionDescription"),
    icon: <UploadDevicePDFFormIcon />,
    key: "upload-device-pdf-form",
    onClick: () => actions.onUploadAction("pdf"),
    disabled: !powerUser || !security?.Create,
  };

  const createFormFromDocx = {
    title: t("EmptyView:CreateFormFromTextDocOptionTitle"),
    description: t("EmptyView:CreateFormFromTextDocOptionDescription"),
    icon: <CreateFromFormIcon />,
    key: "create-form-form",
    onClick: actions.createFormFromFile,
    disabled: !security?.Create,
  };

  const inviteUser = {
    title: t("EmptyView:InviteUsersOptionTitle"),
    description: t("EmptyView:InviteUsersOptionDescription"),
    icon: <InviteUserFormIcon />,
    key: "invite-users",
    onClick: actions.inviteUser,
    disabled: !security?.EditAccess,
  };

  switch (type) {
    case RoomsType.FormRoom:
      if (isFormFiller) return [];

      return [
        createNewForm,
        uploadFromDocSpace,
        createFormFromDocx,
        inviteUser,
        uploadFromDevice,
      ];
    case RoomsType.EditingRoom:
      return [];
    case RoomsType.PublicRoom:
      return [];
    case RoomsType.CustomRoom:
      return [];
    default:
      return [];
  }
};
