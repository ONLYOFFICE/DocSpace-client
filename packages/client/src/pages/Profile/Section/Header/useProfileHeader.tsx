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

import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useNavigate, useLocation } from "react-router";

import { checkDialogsOpen } from "@docspace/shared/utils/checkDialogsOpen";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import { RoomSearchArea } from "@docspace/shared/enums";
import { TUser } from "@docspace/shared/api/people/types";

import EmailReactSvgUrl from "PUBLIC_DIR/images/email.react.svg?url";
import SecurityReactSvgUrl from "PUBLIC_DIR/images/security.react.svg?url";
import ImageReactSvgUrl from "PUBLIC_DIR/images/image.react.svg?url";
import CatalogTrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.trash.react.svg?url";
import PencilReactSvgUrl from "PUBLIC_DIR/images/pencil.react.svg?url";

import {
  DeleteSelfProfileDialog,
  DeleteOwnerProfileDialog,
} from "SRC_DIR/components/dialogs";
import DialogStore from "SRC_DIR/store/contacts/DialogStore";
import TargetUserStore from "SRC_DIR/store/contacts/TargetUserStore";

type UseProfileHeaderProps = {
  profile: TUser;
  profileClicked: boolean;
  enabledHotkeys: boolean;

  setIsLoading?: VoidFunction;

  setDialogData: DialogStore["setDialogData"];
  setChangeEmailVisible: DialogStore["setChangeEmailVisible"];
  setChangePasswordVisible: TargetUserStore["setChangePasswordVisible"];
  setChangeAvatarVisible: TargetUserStore["setChangeAvatarVisible"];
  setChangeNameVisible: TargetUserStore["setChangeNameVisible"];
};

const useProfileHeader = ({
  profile,
  profileClicked,
  enabledHotkeys,

  setIsLoading,

  setDialogData,
  setChangeEmailVisible,
  setChangePasswordVisible,
  setChangeAvatarVisible,
  setChangeNameVisible,
}: UseProfileHeaderProps) => {
  const userId = profile?.id;

  const { t } = useTranslation(["Profile", "Common", "PeopleTranslations"]);

  const navigate = useNavigate();
  const location = useLocation();

  const isProfile = location.pathname.includes("profile");

  const [deleteSelfProfileDialog, setDeleteSelfProfileDialog] = useState(false);
  const [deleteOwnerProfileDialog, setDeleteOwnerProfileDialog] =
    useState(false);

  const onChangePasswordClick = () => {
    const email = profile?.email;
    setDialogData?.({ email });
    setChangePasswordVisible?.(true);
  };

  const onChangeEmailClick = () => {
    setDialogData?.(profile);
    setChangeEmailVisible?.(true);
  };

  const onChangeNameClick = () => {
    setChangeNameVisible(true);
  };

  const getUserContextOptions = () => {
    const options = [
      {
        key: "change-name",
        label: t("PeopleTranslations:NameChangeButton"),
        onClick: onChangeNameClick,
        disabled: false,
        icon: PencilReactSvgUrl,
      },
      {
        key: "change-email",
        label: t("PeopleTranslations:EmailChangeButton"),
        onClick: onChangeEmailClick,
        disabled: false,
        icon: EmailReactSvgUrl,
      },
      {
        key: "change-password",
        label: t("PeopleTranslations:PasswordChangeButton"),
        onClick: onChangePasswordClick,
        disabled: false,
        icon: SecurityReactSvgUrl,
      },
      {
        key: "edit-photo",
        label: t("Profile:EditPhoto"),
        onClick: () => setChangeAvatarVisible?.(true),
        disabled: true,
        icon: ImageReactSvgUrl,
      },
      { key: "separator", isSeparator: true },
      {
        key: "delete-profile",
        label: t("PeopleTranslations:DeleteSelfProfile"),
        onClick: () =>
          profile?.isOwner
            ? setDeleteOwnerProfileDialog(true)
            : setDeleteSelfProfileDialog(true),
        disabled: false,
        icon: CatalogTrashReactSvgUrl,
      },
    ];

    return options;
  };

  const onClickBack = () => {
    if (location?.state?.fromUrl && profileClicked) {
      navigate(location?.state?.fromUrl);

      return;
    }

    if (location.pathname.includes("portal-settings")) {
      navigate("/portal-settings/customization/general");

      return;
    }

    const roomsFilter = RoomsFilter.getDefault(userId, RoomSearchArea.Active);

    roomsFilter.searchArea = RoomSearchArea.Active;
    const urlParams = roomsFilter.toUrlParams(userId);
    const backUrl = `/rooms/shared/filter?${urlParams}`;

    setIsLoading?.();

    navigate(backUrl);
  };

  useHotkeys(
    "Backspace",
    (): boolean => {
      onClickBack();
      return false;
    },
    {
      filter: () => !checkDialogsOpen() && enabledHotkeys,
      filterPreventDefault: false,
    },
  );

  const profileDialogs = (
    <>
      {deleteSelfProfileDialog ? (
        <DeleteSelfProfileDialog
          visible={deleteSelfProfileDialog}
          onClose={() => setDeleteSelfProfileDialog(false)}
          email={profile?.email}
        />
      ) : null}

      {deleteOwnerProfileDialog ? (
        <DeleteOwnerProfileDialog
          visible={deleteOwnerProfileDialog}
          onClose={() => setDeleteOwnerProfileDialog(false)}
        />
      ) : null}
    </>
  );

  return {
    t,
    profileDialogs,
    isProfile,
    onClickBack,
    getUserContextOptions,
  };
};

export default useProfileHeader;
