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

import DarkGeneralPngUrl from "PUBLIC_DIR/images/dark_general.png";
import { useState } from "react";
import { observer, inject } from "mobx-react";
import { Text } from "@docspace/ui-kit/components/text";
import { Link } from "@docspace/ui-kit/components/link";
import { Button } from "@docspace/ui-kit/components/button";
import { Loader } from "@docspace/ui-kit/components/loader";
import { Section } from "@docspace/ui-kit/components/section";
import SectionWrapper from "SRC_DIR/components/Section";
import { Trans, withTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { toastr } from "@docspace/ui-kit/components/toast";
import { checkProtocol } from "../../helpers/files-helpers";
import { getBrandName } from "@docspace/shared/constants/brands";

import styles from "./PrivateRoomsPage.module.scss";

const PrivacyPageComponent = ({ t, tReady, logoText, desktopUrl }) => {
  const [isDisabled, setIsDisabled] = useState(false);

  const location = useLocation();

  const onOpenEditorsPopup = async () => {
    setIsDisabled(true);
    checkProtocol(location.search.split("=")[1])
      .then(() => setIsDisabled(false))
      .catch(() => {
        setIsDisabled(false);
        toastr.info(
          t("PrivacyEditors", {
            OnlyofficeDesktopEditors: getBrandName("OnlyofficeDesktopEditors"),
          }),
        );
      });
  };

  return !tReady ? (
    <Loader className="pageLoader" type="rombs" size="40px" />
  ) : (
    <div className={styles.styledPrivacyPage}>
      <div className={styles.privacyRoomsAvatar}>
        <Link href="/">
          <img
            className={styles.privacyRoomsLogo}
            src={DarkGeneralPngUrl}
            width="320"
            height="181"
            alt="Logo"
          />
        </Link>
      </div>

      <div className={styles.privacyRoomsBody}>
        <Text
          textAlign="center"
          className={styles.privacyRoomsTextHeader}
          fontSize="38px"
        >
          {t("PrivacyHeader")}
        </Text>

        <Text as="div" textAlign="center" fontSize="20px" fontWeight={300}>
          <Trans
            t={t}
            i18nKey="PrivacyClick"
            ns="PrivacyPage"
            values={{
              OnlyofficeDesktopEditors: getBrandName("OnlyofficeDesktopEditors"),
            }}
            components={{
              1: <strong />,
            }}
          />
        </Text>

        <Text
          textAlign="center"
          className={styles.privacyRoomsTextDialog}
          fontSize="20px"
          fontWeight={300}
        >
          {t("PrivacyDialog")}.
        </Text>
        <Button
          onClick={onOpenEditorsPopup}
          size="medium"
          primary
          isDisabled={isDisabled}
          label={t("PrivacyButton", {
            OnlyofficeDesktopEditors: getBrandName("OnlyofficeDesktopEditors"),
          })}
        />

        <label className={styles.privacyRoomsTextSeparator} />

        <div className={styles.privacyRoomsInstall}>
          <Text
            className={styles.privacyRoomsInstallText}
            fontSize="16px"
            fontWeight={300}
          >
            {t("PrivacyEditors", {
              OnlyofficeDesktopEditors: getBrandName("OnlyofficeDesktopEditors"),
            })}
          </Text>
          <Link
            className={`${styles.privacyRoomsLink} ${styles.privacyRoomsInstallText}`}
            fontSize="16px"
            isHovered
            href={desktopUrl}
          >
            {t("PrivacyInstall")}
          </Link>
        </div>

        <Text
          as="div"
          fontSize="12px"
          textAlign="center"
          className={styles.privacyRoomsTextDescription}
        >
          <p>
            {t("PrivacyDescriptionEditors", {
              OnlyofficeDesktopEditors: getBrandName("OnlyofficeDesktopEditors"),
            })}
            .
          </p>
          <p>{t("PrivacyDescriptionConnect")}.</p>
        </Text>
      </div>
    </div>
  );
};

const PrivacyPageWrapper = withTranslation(["PrivacyPage"])(
  PrivacyPageComponent,
);

const PrivacyPage = (props) => {
  return (
    <SectionWrapper>
      <Section.SectionBody>
        <PrivacyPageWrapper {...props} />
      </Section.SectionBody>
    </SectionWrapper>
  );
};

export default inject(({ settingsStore }) => {
  const { logoText, desktopUrl } = settingsStore;

  return {
    logoText,
    desktopUrl,
  };
})(observer(PrivacyPage));
