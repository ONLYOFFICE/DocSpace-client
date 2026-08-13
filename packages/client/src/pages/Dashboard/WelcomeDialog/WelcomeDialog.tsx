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

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { getBrandName } from "@docspace/shared/constants/brands";

import MascotIcon from "PUBLIC_DIR/images/emptyview/empty.desktop.only.svg";

import styles from "./WelcomeDialog.module.scss";

export type WelcomeDialogProps = {
  /** Fired by "Take a tour" — dismiss the welcome and start the tour. */
  onTakeTour: () => void;
  /** Fired by "Later", the close icon and Esc — dismiss without a tour. */
  onClose: () => void;
};

/**
 * The first thing a user sees on the dashboard.
 *
 * A single centered column — mascot, greeting, one short paragraph, two buttons —
 * rather than the two-column feature grid of `AppPromoDialog`. That one has a job
 * this doesn't: it introduces one app in enough detail to decide whether to open
 * it. Here the page behind the modal is the thing being introduced, and the tour
 * is what explains it, so anything more than a greeting competes with the tour it
 * is trying to start.
 *
 * Whether it is shown at all is `DashboardTourStore.isWelcomeSeen`; this
 * component is layout and copy, and both of its actions dismiss.
 */
const WelcomeDialog = ({ onTakeTour, onClose }: WelcomeDialogProps) => {
  const { t } = useTranslation(["DashboardTour", "Common"]);

  const productName = getBrandName("ProductName");

  return (
    <ModalDialog
      className={styles.dialog}
      visible
      onClose={onClose}
      displayType={ModalDialogType.modal}
      autoMaxHeight
    >
      <ModalDialog.Header>
        {t("DashboardTour:WelcomeDashboardTitle", { productName })}
      </ModalDialog.Header>

      <ModalDialog.Body>
        <div className={styles.body}>
          {/* Decorative: the greeting beside it already says what this is. */}
          <div className={styles.illustrationWrap} aria-hidden="true">
            <MascotIcon className={styles.illustration} />
          </div>

          <Text as="h3" className={styles.subtitle}>
            {t("DashboardTour:WelcomeDashboardSubtitle")}
          </Text>

          <Text as="p" className={styles.description}>
            {t("DashboardTour:WelcomeDescription")}
          </Text>
        </div>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Button
          primary
          size={ButtonSize.normal}
          label={t("Common:WelcomeStartTour")}
          onClick={onTakeTour}
          testId="dashboard-welcome-take-tour"
        />
        <Button
          size={ButtonSize.normal}
          label={t("DashboardTour:WelcomeLater")}
          onClick={onClose}
          testId="dashboard-welcome-later"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default WelcomeDialog;
