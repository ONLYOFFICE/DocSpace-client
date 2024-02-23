import React from "react";
import { RoomsType } from "@docspace/shared/enums";

import WelComeDarkIcon from "PUBLIC_DIR/images/emptyview/welcome.dark.svg";
import WelComeLightIcon from "PUBLIC_DIR/images/emptyview/welcome.light.svg";

import CreateNewFormIcon from "PUBLIC_DIR/images/emptyview/create.new.form.svg";
import CreateFromFormIcon from "PUBLIC_DIR/images/emptyview/create.from.document.form.svg";
import InviteUserFormIcon from "PUBLIC_DIR/images/emptyview/invite.user.svg";

import type { Nullable } from "@docspace/shared/types";
import type { TRoomSecurity } from "@docspace/shared/api/rooms/types";
import type { TFolderSecurity } from "@docspace/shared/api/files/types";
import type { EmptyViewItemType } from "@docspace/shared/components/empty-view";

import { OptionActions } from "./EmptyViewContainer.types";

export const getDescription = (type: RoomsType): string => {
  switch (type) {
    case RoomsType.FormRoom:
      return "To start working in the “Form Filling Room”, add forms and invite participants.";
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

export const getTitle = (type: RoomsType): string => {
  switch (type) {
    case RoomsType.FormRoom:
      return "The created!";
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
      return isBaseTheme ? <WelComeLightIcon /> : <WelComeDarkIcon />;
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
        title: t("Create new forms"),
        description: t(
          "Start working in the room by creating a form. Try our PDF form editor.",
        ),
        icon: <CreateNewFormIcon />,
        key: "create-form",
        onClick: actions.onCreateDocumentForm,
      },
      {
        title: t("Create a form from a text document"),
        description: t(
          "Create a PDF form from the finished document by simply adding fields to fill in.",
        ),
        icon: <CreateFromFormIcon />,
        key: "create-form-form",
        onClick: actions.createFormFromFile,
      },
      {
        title: t("Invite users"),
        description: t(
          "Don't forget to add participants who will fill out the forms. All added PDF forms will be available to fill out.",
        ),
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
