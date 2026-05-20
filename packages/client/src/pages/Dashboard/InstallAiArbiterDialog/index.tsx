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
import CatalogAiArbiterIcon from "@docspace/ui-kit/assets/icons/16/catalog.ai-arbiter.react.svg";
import AiAgentsLightIllustration from "PUBLIC_DIR/images/emptyview/empty.ai-agents.icon.light.svg";
import AiAgentsDarkIllustration from "PUBLIC_DIR/images/emptyview/empty.ai-agents.icon.dark.svg";

import {
  AI_ARBITER_INSTALL_STEPS,
  installAiArbiterModule,
  type AiArbiterInstallStepId,
} from "../installFlow";

import styles from "../InstallModuleDialog/InstallModuleDialog.module.scss";

type InstallAiArbiterDialogProps = {
  visible: boolean;
  onClose: () => void;
  onInstalled: () => void;
  installAiArbiter?: (roomId: number) => Promise<void>;
  uninstallAiArbiter?: () => Promise<void>;
};

type Phase = "confirm" | "installing" | "done" | "failed";

const InstallAiArbiterDialogComponent = ({
  visible,
  onClose,
  onInstalled,
  installAiArbiter,
  uninstallAiArbiter,
}: InstallAiArbiterDialogProps) => {
  const { t } = useTranslation(["Common"]);
  const { isBase } = useTheme();
  const [phase, setPhase] = React.useState<Phase>("confirm");
  const [stepIndex, setStepIndex] = React.useState(0);
  const abortRef = React.useRef<AbortController | null>(null);
  const cancelledRef = React.useRef(false);

  const handleInstallClick = React.useCallback(async () => {
    setPhase("installing");
    setStepIndex(0);

    abortRef.current = new AbortController();
    cancelledRef.current = false;

    try {
      const { roomId } = await installAiArbiterModule(
        (stepId) => {
          const idx = AI_ARBITER_INSTALL_STEPS.indexOf(stepId);
          if (idx >= 0) setStepIndex(idx);
        },
        abortRef.current.signal,
      );

      if (cancelledRef.current) return;

      await installAiArbiter?.(roomId);

      setStepIndex(AI_ARBITER_INSTALL_STEPS.length);
      setPhase("done");
    } catch (err) {
      if (cancelledRef.current) return;
      console.error("AI Arbiter install failed", err);
      setPhase("failed");
      toastr.error(t("Common:DashboardInstallFailed"));
    } finally {
      abortRef.current = null;
    }
  }, [installAiArbiter, t]);

  const handleCancelInstalling = React.useCallback(async () => {
    cancelledRef.current = true;
    abortRef.current?.abort();
    try {
      await uninstallAiArbiter?.();
    } catch (err) {
      console.error("AI Arbiter cleanup after cancel failed", err);
    }
    toastr.info(t("Common:DashboardInstallCancelled"));
    onClose();
  }, [onClose, uninstallAiArbiter, t]);

  React.useEffect(() => {
    if (!visible) {
      setPhase("confirm");
      setStepIndex(0);
    }
  }, [visible]);

  const inProgress = phase === "installing";
  const moduleTitle = t("Common:DashboardAIArbiterTitle");

  const stepLabels: Record<AiArbiterInstallStepId, string> = {
    "create-room": t("Common:DashboardArbiterInstallStepCreateRoom"),
    "invite-everyone": t("Common:DashboardArbiterInstallStepInviteEveryone"),
  };

  const stepDescriptions: Record<AiArbiterInstallStepId, string> = {
    "create-room": t("Common:DashboardArbiterInstallStepCreateRoomDescription"),
    "invite-everyone": t(
      "Common:DashboardArbiterInstallStepInviteEveryoneDescription",
    ),
  };

  const confirmBullets: {
    icon: typeof CatalogRoomsIcon;
    title: string;
    description: string;
  }[] = [
    {
      icon: CatalogRoomsIcon,
      title: t("Common:DashboardArbiterInstallBulletRoom"),
      description: t("Common:DashboardArbiterInstallBulletRoomDescription"),
    },
    {
      icon: PeopleIcon,
      title: t("Common:DashboardArbiterInstallBulletTeam"),
      description: t("Common:DashboardArbiterInstallBulletTeamDescription"),
    },
    {
      icon: CatalogAiArbiterIcon,
      title: t("Common:DashboardArbiterInstallBulletAI"),
      description: t("Common:DashboardArbiterInstallBulletAIDescription"),
    },
  ];

  const renderConfirmBody = () => (
    <div className={styles.confirmBody}>
      <div className={styles.heroIllustration} aria-hidden="true">
        {isBase ? (
          <AiAgentsLightIllustration />
        ) : (
          <AiAgentsDarkIllustration />
        )}
      </div>

      <Text as="p" className={styles.confirmText}>
        {t("Common:DashboardArbiterInstallConfirmIntro")}
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
        {AI_ARBITER_INSTALL_STEPS.map((id, idx) => {
          const state =
            idx < stepIndex ? "done" : idx === stepIndex ? "active" : "pending";
          const isLast = idx === AI_ARBITER_INSTALL_STEPS.length - 1;
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
                  {stepDescriptions[id]}
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

export const InstallAiArbiterDialog = inject<TStore>(({ appsStore }) => ({
  installAiArbiter: appsStore.installAiArbiter,
  uninstallAiArbiter: appsStore.uninstallAiArbiter,
}))(observer(InstallAiArbiterDialogComponent));

export default InstallAiArbiterDialog;
