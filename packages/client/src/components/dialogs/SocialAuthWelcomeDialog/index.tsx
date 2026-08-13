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

import React, { useState } from "react";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import { withTranslation, WithTranslation, Trans } from "react-i18next";
import DialogsStore from "SRC_DIR/store/DialogsStore";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Badge } from "@docspace/ui-kit/components/badge";
import { Button } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { DeviceType } from "@docspace/shared/enums";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import WelcomeAuthSocial from "PUBLIC_DIR/images/welcome-social_auth.svg?url";
import WelcomeAuthSocialDark from "PUBLIC_DIR/images/welcome-social_auth_dark.svg?url";
import styles from "./SocialAuthWelcome.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

interface SocialAuthWelcomeDialogProps extends WithTranslation {
  visible: boolean;
  onClose: () => void;
  tenantAlias?: string;
  baseDomain?: string;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  currentDeviceType: DeviceType;
}

const SocialAuthWelcomeDialogComponent = ({
  t,
  visible,
  onClose,
  tenantAlias,
  baseDomain,
  user,
  currentDeviceType,
}: SocialAuthWelcomeDialogProps) => {
  const navigate = useNavigate();
  const { isBase } = useTheme();
  const [showDialog, setShowDialog] = useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);

  const imageRef = React.useRef<HTMLImageElement>(null);

  const handleImageLoaded = () => {
    if (!isLoaded) {
      setIsLoaded(true);
      if (imageRef.current) {
        setShowDialog(true);
      }
    }
  };

  const welcomeAuthSocialImage = isBase
    ? WelcomeAuthSocial
    : WelcomeAuthSocialDark;

  const onContinueClick = (): void => {
    onClose();
  };

  const onProfileClick = (): void => {
    onClose();
    navigate("/profile/login");
  };

  const onChangeDomainClick = (): void => {
    onClose();
    navigate("/portal-settings/customization/general/dns-settings");
  };

  if (!visible) return null;

  return (
    <ModalDialog
      className={styles.modalDialog}
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.modal}
      style={{
        opacity: showDialog ? 1 : 0,
        transition: "opacity 0.3s ease-in-out",
        visibility: showDialog ? "visible" : "hidden",
      }}
    >
      <ModalDialog.Header>
        {t("Common:EmptyRootRoomHeader", {
          organizationName: getBrandName("OrganizationName"),
				productName: getBrandName("ProductName"),
        })}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.bodyContent}>
          <div className="welcome-image">
            <img
              src={welcomeAuthSocialImage}
              className="welcome-auth-social-image"
              alt="auth-welcome-preview"
              onLoad={handleImageLoaded}
              ref={imageRef}
            />
          </div>

          <Text className="welcome-text" textAlign="center">
            {t("SocialAuthWelcomeDialog:ReviewAccountDetails")}
          </Text>

          <div className="account-details">
            <div className={`${styles.infoRow} welcome-product-name`}>
              <Text className="welcome-text">
                {t("SocialAuthWelcomeDialog:ProductNameDetail")}
              </Text>
              <Text fontWeight="600" truncate className="welcome-text">
                {baseDomain == "localhost"
                  ? `${baseDomain}`
                  : `${tenantAlias}.${baseDomain}`}
              </Text>
            </div>

            <div className={`${styles.infoRow} no-gap`}>
              <Text className="welcome-text" />
              <Link
                isHovered
                className="change-domain_link"
                type={LinkType.page}
                fontWeight={600}
                fontSize="13px"
                onClick={onChangeDomainClick}
              >
                {t("Common:ChangeButton")}
              </Link>
              <Badge
                className="paid-badge"
                fontWeight="700"
                backgroundColor={
                  isBase
                    ? globalColors.favoritesStatus
                    : globalColors.favoriteStatusDark
                }
                label={t("Common:Paid")}
                isPaidBadge
              />
            </div>

            <div className={styles.infoRow}>
              <Text className="welcome-text">{t("Common:Name")}</Text>
              <Text
                fontWeight="600"
                truncate
                className="welcome-text"
              >{`${user?.firstName} ${user?.lastName}`}</Text>
            </div>

            <div className={styles.infoRow}>
              <Text className="welcome-text">{t("Common:Email")}</Text>
              <Text fontWeight="600" truncate className="welcome-text">
                {user?.email}
              </Text>
            </div>

            <div className={styles.infoRow}>
              <Text className="welcome-text">
                {t("SocialAuthWelcomeDialog:GeneratedPassword")}
              </Text>
              <Text fontWeight="600" className="welcome-text">
                ********
              </Text>
            </div>

            <div className={`${styles.infoRow} no-gap`}>
              <Text className="welcome-text" />
              <Link
                isHovered
                className="change-profile_link"
                type={LinkType.page}
                fontWeight={600}
                fontSize="13px"
                onClick={onProfileClick}
              >
                {t("SocialAuthWelcomeDialog:ChangeData")}
              </Link>
            </div>
          </div>

          <Text textAlign="center" lineHeight="20px" className="welcome-text">
            {currentDeviceType === DeviceType.mobile ? (
              <Trans
                t={t}
                i18nKey="SocialAuthWelcomeDialog:ClickButtonBelow"
                ns="SocialAuthWelcomeDialog"
                components={{
                  br: <span style={{ display: "none" }} />,
                }}
              />
            ) : (
              <Trans
                t={t}
                i18nKey="SocialAuthWelcomeDialog:ClickButtonBelow"
                ns="SocialAuthWelcomeDialog"
              />
            )}
          </Text>
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="continue-to-docspace"
          className="auth-social-button"
          label={t("SocialAuthWelcomeDialog:ContinueToProduct")}
          primary
          onClick={onContinueClick}
          scale={currentDeviceType === DeviceType.mobile}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

const SocialAuthWelcomeDialog = withTranslation([
  "SocialAuthWelcomeDialog",
  "Common",
])(SocialAuthWelcomeDialogComponent);

export default inject(
  ({
    dialogsStore,
    settingsStore,
    userStore,
  }: {
    dialogsStore: DialogsStore;
    settingsStore: {
      tenantAlias: string;
      baseDomain: string;
      currentDeviceType: DeviceType;
    };
    userStore: {
      user: { firstName?: string; lastName?: string; email?: string };
    };
  }) => {
    const {
      socialAuthWelcomeDialogVisible: visible,
      setSocialAuthWelcomeDialogVisible: setVisible,
    } = dialogsStore;

    const { tenantAlias, baseDomain, currentDeviceType } = settingsStore;
    const { user } = userStore;

    return {
      visible,
      onClose: () => setVisible(false),
      tenantAlias,
      baseDomain,
      user,
      currentDeviceType,
    };
  },
)(observer(SocialAuthWelcomeDialog));
