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

import React, { useEffect, useState } from "react";
import { withTranslation } from "react-i18next";
import { inject } from "mobx-react";
import { Text } from "@docspace/ui-kit/components/text";
import { Button } from "@docspace/ui-kit/components/button";
import { toastr } from "@docspace/ui-kit/components/toast";
import { Link } from "@docspace/ui-kit/components/link";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import { sendSuspendPortalEmail } from "@docspace/shared/api/portal";
import { isDesktop } from "@docspace/shared/utils";
import { EmployeeActivationStatus } from "@docspace/shared/enums";
import { showEmailActivationToast } from "SRC_DIR/helpers/people-helpers";
import styles from "./StyledDeleteData.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

const PortalDeactivation = (props) => {
  const { t, tReady, owner, currentColorScheme, sendActivationLink } = props;
  const [isDesktopView, setIsDesktopView] = useState(false);

  const onCheckView = () => {
    if (isDesktop()) setIsDesktopView(true);
    else setIsDesktopView(false);
  };

  useEffect(() => {
    setDocumentTitle(
      t("PortalDeactivation", { productName: getBrandName("ProductName") }),
    );
    onCheckView();
    window.addEventListener("resize", onCheckView);
    return () => window.removeEventListener("resize", onCheckView);
  }, []);

  const onDeactivateClick = async () => {
    try {
      await sendSuspendPortalEmail();
      toastr.success(
        t("PortalDeletionEmailSended", { ownerEmail: owner.email }),
      );
    } catch (error) {
      toastr.error(error);
    }
  };

  const requestAgain = () => {
    sendActivationLink && sendActivationLink().then(showEmailActivationToast);
  };

  const notActivatedEmail =
    owner?.activationStatus === EmployeeActivationStatus.NotActivated;

  return (
    <div className={styles.mainContainer}>
      <Text fontSize="13px" className={styles.description}>
        {t("PortalDeactivationDescription")}
      </Text>
      <Text className={styles.helper}>
        {t("PortalDeactivationHelper", {
          productName: getBrandName("ProductName"),
        })}
      </Text>
      <div className={styles.buttonWrapper}>
        <Button
          className={`deactivate-button ${styles.button}`}
          label={t("Common:Deactivate")}
          primary
          size={isDesktopView ? "small" : "normal"}
          onClick={onDeactivateClick}
          isDisabled={notActivatedEmail}
          testId="request_deactivate_portal_button"
        />
        {notActivatedEmail && tReady ? (
          <Text fontSize="12px" fontWeight="600">
            {t("MainBar:ConfirmEmailHeader", {
              email: owner.email,
              productName: getBrandName("ProductName"),
            })}
            <Link
              className={styles.requestAgainLink}
              color={currentColorScheme?.main?.accent}
              fontSize="12px"
              fontWeight="400"
              onClick={requestAgain}
              testId="request_deactivate_portal_link"
            >
              {t("MainBar:RequestActivation")}
            </Link>
          </Text>
        ) : null}
      </div>
    </div>
  );
};

export default inject(({ settingsStore, userStore }) => {
  const { owner, currentColorScheme } = settingsStore;
  const { sendActivationLink } = userStore;

  return {
    owner,
    currentColorScheme,
    sendActivationLink,
  };
})(withTranslation(["Settings", "MainBar", "People"])(PortalDeactivation));
