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

"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";

import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { DeviceType } from "@docspace/shared/enums";

import useDeviceType from "@/hooks/useDeviceType";

import FormFileReactSvgUrl from "PUBLIC_DIR/images/form.file.react.svg?url";
import FormFillRectSvgUrl from "PUBLIC_DIR/images/form.fill.rect.svg?url";
import AiAgentsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.ai-agents.react.svg?url";
import DownloadReactSvgUrl from "PUBLIC_DIR/images/icons/16/download.react.svg?url";
import AiFormsTutorialUrl from "PUBLIC_DIR/images/aiforms.tutorial.mp4?url";

import styles from "./WelcomeTourDialog.module.scss";

type WelcomeTourDialogProps = {
  visible: boolean;
  onStart: () => void;
  onSkip: () => void;
};

const featureIcons = [
  FormFileReactSvgUrl,
  FormFillRectSvgUrl,
  AiAgentsReactSvgUrl,
  DownloadReactSvgUrl,
];

export default function WelcomeTourDialog({
  visible,
  onStart,
  onSkip,
}: WelcomeTourDialogProps) {
  const { t } = useTranslation(["Common"]);
  const { currentDeviceType } = useDeviceType();
  const canTakeTour = currentDeviceType !== DeviceType.mobile;

  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <ModalDialog visible={visible} onClose={onSkip} autoMaxHeight autoMaxWidth isLarge isHuge>
      <ModalDialog.Header>
        {t("Common:WelcomeToAIForms", "Welcome to AI Forms")}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.body}>
          <div className={styles.content}>
            <div className={styles.videoContainer}>
              <video
                className={styles.video}
                autoPlay={!reduceMotion}
                loop={!reduceMotion}
                muted
                playsInline
                preload="auto"
                controls={reduceMotion}
              >
                <source
                  src={AiFormsTutorialUrl}
                  type="video/mp4"
                />
              </video>
            </div>
            <div className={styles.featuresList}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <ReactSVG src={featureIcons[0]} />
                </div>
                <div className={styles.featureText}>
                  <Text fontWeight={600} fontSize="13px">{t("Common:WelcomeFeature1Title", "Smart Form Creation")}</Text>
                  <Text fontSize="12px" className={styles.featureDesc}>{t("Common:WelcomeFeature1", "Create PDF forms from templates or scratch")}</Text>
                </div>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <ReactSVG src={featureIcons[1]} />
                </div>
                <div className={styles.featureText}>
                  <Text fontWeight={600} fontSize="13px">{t("Common:WelcomeFeature2Title", "Real-time Tracking")}</Text>
                  <Text fontSize="12px" className={styles.featureDesc}>{t("Common:WelcomeFeature2", "Monitor progress and submissions instantly")}</Text>
                </div>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <ReactSVG src={featureIcons[2]} />
                </div>
                <div className={styles.featureText}>
                  <Text fontWeight={600} fontSize="13px">{t("Common:WelcomeFeature3Title", "AI Processing")}</Text>
                  <Text fontSize="12px" className={styles.featureDesc}>{t("Common:WelcomeFeature3", "Automatically analyze and process responses")}</Text>
                </div>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <ReactSVG src={featureIcons[3]} />
                </div>
                <div className={styles.featureText}>
                  <Text fontWeight={600} fontSize="13px">{t("Common:WelcomeFeature4Title", "Data Integration")}</Text>
                  <Text fontSize="12px" className={styles.featureDesc}>{t("Common:WelcomeFeature4", "Export results directly to your systems")}</Text>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        {canTakeTour && (
          <Button
            label={t("Common:WelcomeStartTour", "Take a tour")}
            size={ButtonSize.normal}
            primary
            scale
            onClick={onStart}
          />
        )}
        <Button
          label={t("Common:WelcomeStartUsing", "Start using")}
          size={ButtonSize.normal}
          primary={!canTakeTour}
          scale
          onClick={onSkip}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
}
