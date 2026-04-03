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

"use client";

import { useTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";

import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";

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
                autoPlay
                loop
                muted
                playsInline
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
        <Button
          label={t("Common:WelcomeStartTour", "Take a tour")}
          size={ButtonSize.normal}
          primary
          scale
          onClick={onStart}
        />
        <Button
          label={t("Common:WelcomeStartUsing", "Start using")}
          size={ButtonSize.normal}
          scale
          onClick={onSkip}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
}
