import React from "react";
import { RoomsType } from "@docspace/shared/enums";

import EmptyFormRoomDarkIcon from "PUBLIC_DIR/images/emptyview/empty.form.room.dark.svg";
import EmptyFormRoomLightIcon from "PUBLIC_DIR/images/emptyview/empty.form.room.light.svg";

import CreateNewFormIcon from "PUBLIC_DIR/images/emptyview/create.new.form.svg";
import CreateFromFormIcon from "PUBLIC_DIR/images/emptyview/create.from.document.form.svg";
import InviteUserFormIcon from "PUBLIC_DIR/images/emptyview/invite.user.svg";
import UploadPDFFormIcon from "PUBLIC_DIR/images/emptyview/upload.pdf.form.svg";

import type { Nullable, TTranslation } from "@docspace/shared/types";
import type { TRoomSecurity } from "@docspace/shared/api/rooms/types";
import type { TFolderSecurity } from "@docspace/shared/api/files/types";
import type { EmptyViewItemType } from "@docspace/shared/components/empty-view";

import { OptionActions } from "./EmptyViewContainer.types";

export const getDescription = (type: RoomsType, t: TTranslation): string => {
  switch (type) {
    case RoomsType.FormRoom:
      return t("FormRoomEmptyDescription");
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

export const getTitle = (type: RoomsType, t: TTranslation): string => {
  switch (type) {
    case RoomsType.FormRoom:
      return t("FormRoomEmptyTitle");
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
  t: (str: string) => string,
  actions: OptionActions,
) => {
  const Options: Record<RoomsType, EmptyViewItemType[]> = {
    [RoomsType.FormRoom]: [
      {
        title: t("CreateNewFormOptionTitle"),
        description: t("CreateNewFormOptionDescription"),
        icon: <CreateNewFormIcon />,
        key: "create-form",
        onClick: actions.onCreateDocumentForm,
      },
      {
        title: t("UploadPDFFormOptionTitle"),
        description: t("UploadPDFFormOptionDescription"),
        icon: <UploadPDFFormIcon />,
        key: "upload-pdf-form",
        onClick: actions.uploadPDFForm,
      },
      {
        title: t("CreateFormFromTextDocOptionTitle"),
        description: t("CreateFormFromTextDocOptionDescription"),
        icon: <CreateFromFormIcon />,
        key: "create-form-form",
        onClick: actions.createFormFromFile,
      },
      {
        title: t("InviteUsersOptionTitle"),
        description: t("InviteUsersOptionDescription"),
        icon: <InviteUserFormIcon />,
        key: "invite-users",
        onClick: actions.inviteUser,
        disabled: !security?.EditAccess,
      },
    ],
    [RoomsType.CustomRoom]: [],
    [RoomsType.EditingRoom]: [],
    [RoomsType.PublicRoom]: [],
  };

  return Options[type];
};
