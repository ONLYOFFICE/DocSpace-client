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

// (c) Copyright Ascensio System SIA 2009-2026
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
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { Text } from "@docspace/ui-kit/components/text";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { getBrandName } from "@docspace/shared/constants/brands";
import { DeviceType } from "@docspace/shared/enums";

import ChangePasswordDialog from "SRC_DIR/components/dialogs/ChangePasswordDialog";

import PencilReactSvgUrl from "PUBLIC_DIR/images/pencil.react.svg?url";
import CrossReactSvgUrl from "PUBLIC_DIR/images/icons/16/cross.react.svg?url";

import styles from "../Dashboard.module.scss";

export const PROFILE_CARD_HIDDEN_KEY = "dashboard_profile_card_hidden";

interface ProfileCardProps {
  portalName?: string;
  displayName?: string;
  email?: string;
  currentDeviceType?: DeviceType;
  isAdmin?: boolean;
  isOwner?: boolean;
}

const ProfileCardComponent = ({
  portalName = "",
  displayName = "",
  email = "",
  currentDeviceType,
  isAdmin = false,
  isOwner = false,
}: ProfileCardProps) => {
  const { t } = useTranslation(["SocialAuthWelcomeDialog", "Common"]);
  const navigate = useNavigate();

  const [hidden, setHidden] = React.useState(
    () => localStorage.getItem(PROFILE_CARD_HIDDEN_KEY) === "true",
  );
  const [changePasswordVisible, setChangePasswordVisible] =
    React.useState(false);

  // The card lets the user jump to portal settings (renaming, etc.),
  // which only admins and the owner can access — hide it for everyone else.
  if (!isAdmin && !isOwner) return null;

  if (hidden) return null;

  const handleClose = () => {
    localStorage.setItem(PROFILE_CARD_HIDDEN_KEY, "true");
    setHidden(true);
  };

  const handleEditPortalName = () => {
    // On desktop/tablet all customization sections live on a single page,
    // so we link to the portal-renaming anchor to scroll straight to it.
    // On mobile each section has its own route, where the anchor is moot.
    const isMobile = currentDeviceType === DeviceType.mobile;

    navigate(
      isMobile
        ? "/portal-settings/customization/general/portal-renaming"
        : "/portal-settings/customization/general#portal-renaming",
    );
  };

  return (
    <>
      {/* Anchor for the dashboard tour's first step. On the card's own root, so
          it is present exactly when the card is — the tour reads the DOM to
          decide whether that step exists at all, and this card is both
          admin-only and dismissable. */}
      <div data-tour-id="dashboard-profile" className={styles.profileCard}>
        <IconButton
          className={styles.profileCardClose}
          iconName={CrossReactSvgUrl}
          size={16}
          onClick={handleClose}
          title={t("Common:CloseButton")}
        />

        <Text as="p" className={styles.profileCardTitle}>
          {t("SocialAuthWelcomeDialog:YourProfileDetails")}
        </Text>

        <div className={styles.profileCardGrid}>
          <div className={styles.profileCardField}>
            <Text as="span" className={styles.profileCardLabel}>
              {t("SocialAuthWelcomeDialog:ProductNameDetail", {
                productName: getBrandName("ProductName"),
              })}
            </Text>
            <span className={styles.profileCardValueRow}>
              <Text as="span" className={styles.profileCardValue}>
                {portalName}
              </Text>
              <IconButton
                className={styles.profileCardEdit}
                iconName={PencilReactSvgUrl}
                size={12}
                onClick={handleEditPortalName}
                title={t("Common:EditButton")}
              />
            </span>
          </div>

          <div className={styles.profileCardField}>
            <Text as="span" className={styles.profileCardLabel}>
              {t("Common:Name")}
            </Text>
            <Text as="span" className={styles.profileCardValue}>
              {displayName}
            </Text>
          </div>

          <div className={styles.profileCardField}>
            <Text as="span" className={styles.profileCardLabel}>
              {t("Common:Email")}
            </Text>
            <Text as="span" className={styles.profileCardValue}>
              {email}
            </Text>
          </div>

          <div className={styles.profileCardField}>
            <Text as="span" className={styles.profileCardLabel}>
              {t("Common:Password")}
            </Text>
            <Link
              className={styles.profileCardLink}
              type={LinkType.action}
              onClick={() => setChangePasswordVisible(true)}
              color="accent"
              isHovered
            >
              {t("Common:SetPassword")}
            </Link>
          </div>
        </div>
      </div>

      {changePasswordVisible ? (
        <ChangePasswordDialog
          visible={changePasswordVisible}
          onClose={() => setChangePasswordVisible(false)}
          email={email}
        />
      ) : null}
    </>
  );
};

export const ProfileCard = inject<TStore>(({ userStore, settingsStore }) => ({
  displayName: userStore.user?.displayName,
  email: userStore.user?.email,
  portalName: settingsStore.tenantAlias,
  currentDeviceType: settingsStore.currentDeviceType,
  isAdmin: userStore.user?.isAdmin ?? false,
  isOwner: userStore.user?.isOwner ?? false,
}))(observer(ProfileCardComponent));

export default ProfileCard;

