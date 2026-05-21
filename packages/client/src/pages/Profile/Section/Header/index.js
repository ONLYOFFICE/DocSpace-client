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

import { inject, observer } from "mobx-react";

import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { ContextMenuButton } from "@docspace/ui-kit/components/context-menu-button";
import { Heading } from "@docspace/ui-kit/components/heading";
import { SectionHeaderSkeleton } from "@docspace/shared/skeletons/sections";

import ArrowPathReactSvgUrl from "PUBLIC_DIR/images/arrow.path.react.svg?url";
import VerticalDotsReactSvgUrl from "PUBLIC_DIR/images/icons/16/vertical-dots.react.svg?url";

import TariffBar from "SRC_DIR/components/TariffBar";

import useProfileHeader from "./useProfileHeader";
import styles from "./header.module.scss";

const Header = (props) => {
  const {
    isAdmin,

    profile,
    setChangeEmailVisible,
    setChangePasswordVisible,
    setChangeAvatarVisible,
    setChangeNameVisible,

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
      setChangeNameVisible,
      setIsLoading,
    });

  if (showProfileLoader) return <SectionHeaderSkeleton />;

  return (
    <div className={styles.header}>
      <IconButton
        iconName={ArrowPathReactSvgUrl}
        size="17"
        isFill
        onClick={onClickBack}
        className={styles.arrowButton}
        dataTestId="header_arrow_back_icon_button"
      />

      <div>
        <Heading className={styles.headerHeadline} type="content">
          {t("Profile:MyProfile")}
        </Heading>
      </div>
      <div className={styles.actionButton}>
        {(isAdmin && !profile?.isOwner) ||
        (!profile?.isLDAP && !profile?.isSSO) ? (
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

        <div className={styles.tariffBar}>
          <TariffBar />
        </div>
      </div>
      {profileDialogs}
    </div>
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

    const {
      setChangePasswordVisible,
      setChangeAvatarVisible,
      setChangeNameVisible,
    } = targetUserStore;

    const { setDialogData, setChangeEmailVisible } = dialogStore;

    return {
      isAdmin,
      isVisitor,
      isCollaborator,

      setChangeEmailVisible,
      setChangePasswordVisible,
      setChangeAvatarVisible,
      setChangeNameVisible,

      setDialogData,

      showProfileLoader,
      profileClicked,
      enabledHotkeys:
        enabledHotkeys && !mediaViewerIsVisible && !showProfileLoader,
    };
  },
)(observer(Header));
