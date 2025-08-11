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

import { inject, observer } from "mobx-react";

import { IconButton } from "@docspace/shared/components/icon-button";
import { ContextMenuButton } from "@docspace/shared/components/context-menu-button";
import { Heading } from "@docspace/shared/components/heading";
import { SectionHeaderSkeleton } from "@docspace/shared/skeletons/sections";

import ArrowPathReactSvgUrl from "PUBLIC_DIR/images/arrow.path.react.svg?url";
import VerticalDotsReactSvgUrl from "PUBLIC_DIR/images/icons/16/vertical-dots.react.svg?url";

import TariffBar from "SRC_DIR/components/TariffBar";

import { StyledHeader } from "./StyledHeader";
import useProfileHeader from "./useProfileHeader";

const Header = (props) => {
  const {
    isAdmin,
    isVisitor,
    isCollaborator,

    profile,
    setChangeEmailVisible,
    setChangePasswordVisible,
    setChangeAvatarVisible,

    setDialogData,

    profileClicked,

    showProfileLoader,
    setIsLoading,

    enabledHotkeys,
  } = props;

  const { t, profileDialogs, onClickBack, getUserContextOptions } =
    useProfileHeader({
      profile,
      profileClicked,
      enabledHotkeys,
      setDialogData,
      setChangeEmailVisible,
      setChangePasswordVisible,
      setChangeAvatarVisible,
      setIsLoading,
    });

  if (showProfileLoader) return <SectionHeaderSkeleton />;

  return (
    <StyledHeader
      showContextButton={
        (isAdmin && !profile?.isOwner) || (!profile?.isLDAP && !profile?.isSSO)
      }
      isVisitor={isVisitor || isCollaborator}
    >
      <IconButton
        iconName={ArrowPathReactSvgUrl}
        size="17"
        isFill
        onClick={onClickBack}
        className="arrow-button"
      />

      <div>
        <Heading className="header-headline" type="content">
          {t("Profile:MyProfile")}
        </Heading>
      </div>
      <div className="action-button">
        {(isAdmin && !profile?.isOwner) ||
        (!profile?.isLDAP && !profile?.isSSO) ? (
          <ContextMenuButton
            directionX="left"
            title={t("Common:Actions")}
            iconName={VerticalDotsReactSvgUrl}
            size={17}
            getData={getUserContextOptions}
            isDisabled={false}
            usePortal
          />
        ) : null}

        <div className="tariff-bar">
          <TariffBar />
        </div>
      </div>
      {profileDialogs}
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

    const { isVisitor, isCollaborator } = userStore.user;

    const { targetUserStore, dialogStore } = peopleStore;

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
)(observer(Header));
