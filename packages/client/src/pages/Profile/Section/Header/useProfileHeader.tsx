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

import { useTranslation } from "react-i18next";
import { useCallback, useState } from "react";
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

  const onChangePasswordClick = useCallback(() => {
    const email = profile?.email;
    setDialogData?.({ email });
    setChangePasswordVisible?.(true);
  }, [profile, setDialogData, setChangePasswordVisible]);

  const onChangeEmailClick = useCallback(() => {
    setDialogData?.(profile);
    setChangeEmailVisible?.(true);
  }, [profile, setDialogData, setChangeEmailVisible]);

  const onChangeNameClick = useCallback(() => {
    setChangeNameVisible(true);
  }, [setChangeNameVisible]);

  const onEditPhotoClick = useCallback(() => {
    setChangeAvatarVisible(true);
  }, [setChangeAvatarVisible]);

  const onDeleteProfileClick = useCallback(() => {
    if (profile?.isOwner) {
      setDeleteOwnerProfileDialog(true);
    } else {
      setDeleteSelfProfileDialog(true);
    }
  }, [profile?.isOwner]);

  const getUserContextOptions = useCallback(() => {
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
        onClick: onEditPhotoClick,
        disabled: true,
        icon: ImageReactSvgUrl,
      },
      { key: "separator", isSeparator: true },
      {
        key: "delete-profile",
        label: t("PeopleTranslations:DeleteSelfProfile"),
        onClick: onDeleteProfileClick,
        disabled: false,
        icon: CatalogTrashReactSvgUrl,
      },
    ];

    return options;
  }, [
    t,
    onChangeNameClick,
    onChangeEmailClick,
    onChangePasswordClick,
    onEditPhotoClick,
    onDeleteProfileClick,
  ]);

  const onClickBack = useCallback(() => {
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
  }, [location, navigate, setIsLoading, userId]);

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
