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

import EmailReactSvgUrl from "PUBLIC_DIR/images/email.react.svg?url";
import SecurityReactSvgUrl from "PUBLIC_DIR/images/security.react.svg?url";
import ImageReactSvgUrl from "PUBLIC_DIR/images/image.react.svg?url";
import CatalogTrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.trash.react.svg?url";
import ArrowPathReactSvgUrl from "PUBLIC_DIR/images/arrow.path.react.svg?url";
import VerticalDotsReactSvgUrl from "PUBLIC_DIR/images/icons/16/vertical-dots.react.svg?url";

import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { withTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router";
import { inject, observer } from "mobx-react";

import { IconButton } from "@docspace/shared/components/icon-button";
import { ContextMenuButton } from "@docspace/shared/components/context-menu-button";
import { Heading } from "@docspace/shared/components/heading";
import { SectionHeaderSkeleton } from "@docspace/shared/skeletons/sections";
import { checkDialogsOpen } from "@docspace/shared/utils/checkDialogsOpen";
import {
  DeleteSelfProfileDialog,
  DeleteOwnerProfileDialog,
} from "SRC_DIR/components/dialogs";

import RoomsFilter from "@docspace/shared/api/rooms/filter";
import { RoomSearchArea } from "@docspace/shared/enums";
import TariffBar from "SRC_DIR/components/TariffBar";
import { StyledHeader } from "./StyledHeader";

const Header = (props) => {
  const {
    t,

    isAdmin,
    isVisitor,
    isCollaborator,

    profile,
    isMe,
    setChangeEmailVisible,
    setChangePasswordVisible,
    setChangeAvatarVisible,

    setDialogData,

    profileClicked,

    showProfileLoader,
    setIsLoading,
    userId,
    enabledHotkeys,
  } = props;

  const navigate = useNavigate();
  const location = useLocation();

  const [deleteSelfProfileDialog, setDeleteSelfProfileDialog] = useState(false);
  const [deleteOwnerProfileDialog, setDeleteOwnerProfileDialog] =
    useState(false);

  const onChangePasswordClick = () => {
    const email = profile.email;
    setDialogData({ email });
    setChangePasswordVisible(true);
  };

  const onChangeEmailClick = () => {
    setDialogData(profile);
    setChangeEmailVisible(true);
  };

  const getUserContextOptions = () => {
    const options = [
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
        onClick: () => setChangeAvatarVisible(true),
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
      return navigate(location?.state?.fromUrl);
    }

    if (location.pathname.includes("portal-settings")) {
      return navigate("/portal-settings/customization/general");
    }

    const roomsFilter = RoomsFilter.getDefault(userId, RoomSearchArea.Active);

    roomsFilter.searchArea = RoomSearchArea.Active;
    const urlParams = roomsFilter.toUrlParams(userId);
    const backUrl = `/rooms/shared/filter?${urlParams}`;

    setIsLoading();

    navigate(backUrl);
    // setFilter(filter);
  };

  useHotkeys("Backspace", onClickBack, {
    filter: () => !checkDialogsOpen() && enabledHotkeys,
    filterPreventDefault: false,
  });

  if (showProfileLoader) return <SectionHeaderSkeleton />;

  return (
    <StyledHeader
      showContextButton={
        (isAdmin && !profile?.isOwner) ||
        (isMe && !profile?.isLDAP && !profile?.isSSO)
      }
      isVisitor={isVisitor || isCollaborator}
    >
      <IconButton
        iconName={ArrowPathReactSvgUrl}
        size="17"
        isFill
        onClick={onClickBack}
        className="arrow-button"
        dataTestId="header_arrow_back_icon_button"
      />

      <div>
        <Heading className="header-headline" type="content">
          {t("Profile:MyProfile")}
        </Heading>
      </div>
      <div className="action-button">
        {(isAdmin && !profile?.isOwner) ||
        (isMe && !profile?.isLDAP && !profile?.isSSO) ? (
          <ContextMenuButton
            directionX="right"
            title={t("Common:Actions")}
            iconName={VerticalDotsReactSvgUrl}
            size={17}
            getData={getUserContextOptions}
            isDisabled={false}
            usePortal
            testId="user_context_menu_button"
          />
        ) : null}

        <div className="tariff-bar">
          <TariffBar />
        </div>
      </div>

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
    </StyledHeader>
  );
};

export default inject(
  ({
    authStore,
    userStore,
    peopleStore,
    clientLoadingStore,
    profileActionsStore,
    filesStore,
    mediaViewerDataStore,
  }) => {
    const { isAdmin } = authStore;

    const { isVisitor, isCollaborator, user } = userStore.user;

    const { targetUserStore, dialogStore } = peopleStore;

    const { targetUser, isMe } = targetUserStore;

    const { showProfileLoader } = clientLoadingStore;

    const { profileClicked } = profileActionsStore;

    const { enabledHotkeys } = filesStore;
    const { visible: mediaViewerIsVisible } = mediaViewerDataStore;

    const { setChangePasswordVisible, setChangeAvatarVisible } =
      targetUserStore;

    const { setDialogData, setChangeEmailVisible } = dialogStore;

    return {
      isAdmin,
      isVisitor,
      isCollaborator,

      profile: targetUser,
      userId: user?.id,
      isMe,
      setChangeEmailVisible,
      setChangePasswordVisible,
      setChangeAvatarVisible,

      setDialogData,

      showProfileLoader,
      profileClicked,
      enabledHotkeys:
        enabledHotkeys && !mediaViewerIsVisible && !showProfileLoader,
    };
  },
)(
  observer(
    withTranslation(["Profile", "Common", "PeopleTranslations"])(Header),
  ),
);
