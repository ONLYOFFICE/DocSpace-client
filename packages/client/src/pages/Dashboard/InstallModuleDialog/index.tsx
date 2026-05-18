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

import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { toastr } from "@docspace/ui-kit/components/toast";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";

import CheckIcon from "@docspace/ui-kit/assets/check.react.svg";
import DangerIcon from "@docspace/ui-kit/assets/danger.toast.react.svg";
import InfoIcon from "@docspace/ui-kit/assets/info.outline.react.svg";
import CatalogRoomsIcon from "@docspace/ui-kit/assets/icons/16/catalog.rooms.react.svg";
import PeopleIcon from "@docspace/ui-kit/assets/icons/16/people.react.svg";
import TemplateIcon from "@docspace/ui-kit/assets/icons/16/catalog.documents.react.svg";
import FormRoomLightIllustration from "PUBLIC_DIR/images/emptyview/empty.form.room.light.svg";
import FormRoomDarkIllustration from "PUBLIC_DIR/images/emptyview/empty.form.room.dark.svg";

import {
  AI_FORMS_INSTALL_STEPS,
  installAiFormsModule,
  type AiFormsInstallStepId,
  type LibraryUploadProgress,
} from "../installFlow";

import styles from "./InstallModuleDialog.module.scss";

type InstallAiFormsDialogProps = {
  visible: boolean;
  onClose: () => void;
  onInstalled: () => void;
  installAiForms?: (roomId: number, libraryId?: number) => Promise<void>;
  uninstallAiForms?: () => Promise<void>;
  skipConfirm?: boolean;
};

type Phase = "confirm" | "installing" | "done" | "failed";

const InstallAiFormsDialogComponent = ({
  visible,
  onClose,
  onInstalled,
  installAiForms,
  uninstallAiForms,
  skipConfirm = false,
}: InstallAiFormsDialogProps) => {
  const { t } = useTranslation(["Common"]);
  const { isBase } = useTheme();
  const [phase, setPhase] = React.useState<Phase>(skipConfirm ? "installing" : "confirm");
  const [stepIndex, setStepIndex] = React.useState(0);
  const [libraryProgress, setLibraryProgress] =
    React.useState<LibraryUploadProgress | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);
  const cancelledRef = React.useRef(false);

  const handleInstallClick = React.useCallback(async () => {
    setPhase("installing");
    setStepIndex(0);
    setLibraryProgress(null);

    abortRef.current = new AbortController();
    cancelledRef.current = false;

    try {
      const { roomId, libraryId } = await installAiFormsModule(
        (stepId) => {
          const idx = AI_FORMS_INSTALL_STEPS.indexOf(stepId);
          if (idx >= 0) setStepIndex(idx);
        },
        (progress) => setLibraryProgress(progress),
        abortRef.current.signal,
      );

      if (cancelledRef.current) return;

      await installAiForms?.(roomId, libraryId);

      setStepIndex(AI_FORMS_INSTALL_STEPS.length);
      setPhase("done");
    } catch (err) {
      if (cancelledRef.current) return;
      console.error("AI Forms install failed", err);
      setPhase("failed");
      toastr.error(t("Common:DashboardInstallFailed"));
    } finally {
      abortRef.current = null;
    }
  }, [installAiForms, t]);

  const handleCancelInstalling = React.useCallback(async () => {
    cancelledRef.current = true;
    abortRef.current?.abort();
    try {
      await uninstallAiForms?.();
    } catch (err) {
      console.error("AI Forms cleanup after cancel failed", err);
    }
    toastr.info(t("Common:DashboardInstallCancelled"));
    onClose();
  }, [onClose, uninstallAiForms, t]);

  React.useEffect(() => {
    if (!visible) {
      setPhase(skipConfirm ? "installing" : "confirm");
      setStepIndex(0);
      setLibraryProgress(null);
    }
  }, [visible, skipConfirm]);

  React.useEffect(() => {
    if (visible && skipConfirm && phase === "installing") {
      handleInstallClick();
    }
  }, [visible, skipConfirm, phase, handleInstallClick]);

  const inProgress = phase === "installing";

  const moduleTitle = t("Common:DashboardAIFormsTitle");

  const stepLabels: Record<AiFormsInstallStepId, string> = {
    "create-room": t("Common:DashboardInstallStepCreateRoom"),
    "invite-everyone": t("Common:DashboardInstallStepInviteEveryone"),
    "create-blank-form": t("Common:DashboardInstallStepCreateBlankForm"),
    "upload-library": t("Common:DashboardInstallStepUploadLibrary"),
  };

  const stepDescriptions: Record<AiFormsInstallStepId, string> = {
    "create-room": t("Common:DashboardInstallStepCreateRoomDescription"),
    "invite-everyone": t("Common:DashboardInstallStepInviteEveryoneDescription"),
    "create-blank-form": t(
      "Common:DashboardInstallStepCreateBlankFormDescription",
    ),
    "upload-library": t("Common:DashboardInstallStepUploadLibraryDescription"),
  };

  const getStepDescription = (id: AiFormsInstallStepId): string => {
    if (id === "upload-library" && libraryProgress?.total) {
      const percent = Math.min(
        100,
        Math.floor((libraryProgress.uploaded / libraryProgress.total) * 100),
      );
      return t("Common:DashboardInstallStepUploadLibraryProgress", { percent });
    }
    return stepDescriptions[id];
  };

  const confirmBullets: {
    icon: typeof CatalogRoomsIcon;
    title: string;
    description: string;
  }[] = [
    {
      icon: CatalogRoomsIcon,
      title: t("Common:DashboardInstallBulletCreateRoom"),
      description: t("Common:DashboardInstallBulletCreateRoomDescription"),
    },
    {
      icon: PeopleIcon,
      title: t("Common:DashboardInstallBulletInvite"),
      description: t("Common:DashboardInstallBulletInviteDescription"),
    },
    {
      icon: TemplateIcon,
      title: t("Common:DashboardInstallBulletStarter"),
      description: t("Common:DashboardInstallBulletStarterDescription"),
    },
  ];

  const renderConfirmBody = () => (
    <div className={styles.confirmBody}>
      <div className={styles.heroIllustration} aria-hidden="true">
        {isBase ? <FormRoomLightIllustration /> : <FormRoomDarkIllustration />}
      </div>

      <Text as="p" className={styles.confirmText}>
        {t("Common:DashboardInstallConfirmIntro")}
      </Text>

      <ul className={styles.bulletList}>
        {confirmBullets.map(({ icon: Icon, title, description }) => (
          <li key={title} className={styles.bulletItem}>
            <span className={styles.bulletIconWrap} aria-hidden="true">
              <Icon className={styles.bulletIcon} />
            </span>
            <div className={styles.bulletTexts}>
              <Text as="span" className={styles.bulletTitle}>
                {title}
              </Text>
              <Text as="span" className={styles.bulletDescription}>
                {description}
              </Text>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderInstallingBody = () => (
    <div className={styles.installingBody}>
      <div className={styles.keepOpenCallout} role="status">
        <InfoIcon className={styles.keepOpenCalloutIcon} aria-hidden="true" />
        <span>{t("Common:DashboardInstallKeepOpen")}</span>
      </div>

      <ol className={styles.timeline}>
        {AI_FORMS_INSTALL_STEPS.map((id, idx) => {
          const state =
            idx < stepIndex ? "done" : idx === stepIndex ? "active" : "pending";
          const isLast = idx === AI_FORMS_INSTALL_STEPS.length - 1;
          return (
            <li key={id} className={styles.timelineItem} data-state={state}>
              {!isLast ? (
                <Text
                  className={styles.timelineConnector}
                  aria-hidden="true"
                  as="span"
                />
              ) : null}
              <Text
                className={styles.timelineDot}
                aria-hidden="true"
                as="span"
              >
                {state === "done" ? <CheckIcon /> : null}
              </Text>
              <div className={styles.timelineLabelWrap}>
                <Text className={styles.timelineLabel} as="span">
                  {stepLabels[id]}
                </Text>
                <Text className={styles.timelineCounter} as="span">
                  {getStepDescription(id)}
                </Text>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );

  const renderDoneBody = () => (
    <div className={styles.doneBody}>
      <div
        className={styles.heroBadge}
        data-status="success"
        aria-hidden="true"
      >
        <CheckIcon />
      </div>
      <div className={styles.heroText}>
        <Text as="p" className={styles.confirmText}>
          {t("Common:DashboardInstallDoneHint")}
        </Text>
      </div>
    </div>
  );

  const renderFailedBody = () => (
    <div className={styles.failedBody}>
      <div className={styles.heroBadge} data-status="error" aria-hidden="true">
        <DangerIcon />
      </div>
      <Text as="p" className={styles.error}>
        {t("Common:DashboardInstallFailed")}
      </Text>
    </div>
  );

  const renderFooter = () => {
    if (phase === "confirm") {
      return (
        <>
          <Button
            primary
            scale
            size={ButtonSize.normal}
            label={t("Common:Install")}
            onClick={handleInstallClick}
          />
          <Button
            scale
            size={ButtonSize.normal}
            label={t("Common:CancelButton")}
            onClick={onClose}
          />
        </>
      );
    }
    if (phase === "done") {
      return (
        <Button
          primary
          scale
          size={ButtonSize.normal}
          label={t("Common:Open")}
          onClick={onInstalled}
        />
      );
    }
    if (phase === "failed") {
      return (
        <Button
          primary
          scale
          size={ButtonSize.normal}
          label={t("Common:CloseButton")}
          onClick={onClose}
        />
      );
    }
    // installing
    return (
      <Button
        scale
        size={ButtonSize.normal}
        label={t("Common:CancelButton")}
        onClick={handleCancelInstalling}
      />
    );
  };

  const getHeader = () => {
    if (phase === "confirm")
      return t("Common:DashboardInstallConfirmTitle", { module: moduleTitle });
    if (phase === "done")
      return t("Common:DashboardInstallDoneTitle", { module: moduleTitle });
    return t("Common:DashboardInstallTitle", { module: moduleTitle });
  };

  const handleModalClose = inProgress ? handleCancelInstalling : onClose;

  return (
    <ModalDialog
      visible={visible}
      onClose={handleModalClose}
      isLarge
      autoMaxHeight
    >
      <ModalDialog.Header>{getHeader()}</ModalDialog.Header>
      <ModalDialog.Body>
        {phase === "confirm" ? renderConfirmBody() : null}
        {phase === "installing" ? renderInstallingBody() : null}
        {phase === "done" ? renderDoneBody() : null}
        {phase === "failed" ? renderFailedBody() : null}
      </ModalDialog.Body>
      <ModalDialog.Footer>{renderFooter()}</ModalDialog.Footer>
    </ModalDialog>
  );
};

export const InstallAiFormsDialog = inject<TStore>(({ appsStore }) => ({
  installAiForms: appsStore.installAiForms,
  uninstallAiForms: appsStore.uninstallAiForms,
}))(observer(InstallAiFormsDialogComponent));

export default InstallAiFormsDialog;
