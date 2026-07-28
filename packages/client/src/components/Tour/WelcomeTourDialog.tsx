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
import { ReactSVG } from "react-svg";

import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";

import styles from "./WelcomeTourDialog.module.scss";

export type TourFeature = {
  icon: string;
  title: string;
  description: string;
};

type WelcomeTourDialogProps = {
  visible: boolean;
  title: string;
  features: TourFeature[];
  canTakeTour: boolean;
  onStart: () => void;
  onSkip: () => void;
};

/**
 * Shared welcome dialog shown before a section tour. Section hosts pass the
 * localized title and the list of feature cards; the primary "Take a tour"
 * button is hidden when the tour can't run (mobile).
 */
export default function WelcomeTourDialog({
  visible,
  title,
  features,
  canTakeTour,
  onStart,
  onSkip,
}: WelcomeTourDialogProps) {
  const { t } = useTranslation(["Common"]);

  return (
    <ModalDialog
      className={styles.wrapper}
      visible={visible}
      onClose={onSkip}
      autoMaxHeight
    >
      <ModalDialog.Header>{title}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.featuresList}>
          {features.map((feature) => (
            <div key={feature.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <ReactSVG src={feature.icon} />
              </div>
              <div className={styles.featureText}>
                <Text fontWeight={600} fontSize="13px">
                  {feature.title}
                </Text>
                <Text fontSize="12px" className={styles.featureDesc}>
                  {feature.description}
                </Text>
              </div>
            </div>
          ))}
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        {canTakeTour ? (
          <Button
            label={t("Common:WelcomeStartTour")}
            size={ButtonSize.normal}
            primary
            scale
            onClick={onStart}
          />
        ) : null}
        <Button
          label={t("Common:WelcomeStartUsing")}
          size={ButtonSize.normal}
          primary={!canTakeTour}
          scale
          onClick={onSkip}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
}
