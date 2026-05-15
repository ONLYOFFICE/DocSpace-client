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
import { Trans, useTranslation } from "react-i18next";

import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { toastr } from "@docspace/ui-kit/components/toast";

import CheckIcon from "@docspace/ui-kit/assets/check.react.svg";
import DangerIcon from "@docspace/ui-kit/assets/danger.toast.react.svg";
import InfoIcon from "@docspace/ui-kit/assets/info.outline.react.svg";
import CatalogDocumentsIcon from "@docspace/ui-kit/assets/icons/16/catalog.documents.react.svg";

import {
  AI_FORMS_INSTALL_STEPS,
  AI_FORMS_ROOM_TITLE,
  installAiFormsModule,
  type AiFormsInstallStepId,
} from "../installFlow";

import styles from "./InstallModuleDialog.module.scss";

type InstallAiFormsDialogProps = {
  visible: boolean;
  onClose: () => void;
  onInstalled: () => void;
  installAiForms?: (roomId: number) => Promise<void>;
};

type Phase = "confirm" | "installing" | "done" | "failed";

const InstallAiFormsDialogComponent = ({
  visible,
  onClose,
  onInstalled,
  installAiForms,
}: InstallAiFormsDialogProps) => {
  const { t } = useTranslation(["Common"]);
  const [phase, setPhase] = React.useState<Phase>("confirm");
  const [stepIndex, setStepIndex] = React.useState(0);

  React.useEffect(() => {
    if (!visible) {
      setPhase("confirm");
      setStepIndex(0);
    }
  }, [visible]);

  const handleInstallClick = async () => {
    setPhase("installing");
    setStepIndex(0);

    try {
      const { roomId } = await installAiFormsModule((stepId) => {
        const idx = AI_FORMS_INSTALL_STEPS.indexOf(stepId);
        if (idx >= 0) setStepIndex(idx);
      });

      await installAiForms?.(roomId);

      setStepIndex(AI_FORMS_INSTALL_STEPS.length);
      setPhase("done");
    } catch (err) {
      console.error("AI Forms install failed", err);
      setPhase("failed");
      toastr.error(t("Common:DashboardInstallFailed"));
    }
  };

  const inProgress = phase === "installing";

  const moduleTitle = t("Common:DashboardAIFormsTitle");

  const stepLabels: Record<AiFormsInstallStepId, string> = {
    "create-room": t("Common:DashboardInstallStepCreateRoom"),
    "invite-everyone": t("Common:DashboardInstallStepInviteEveryone"),
    "create-blank-form": t("Common:DashboardInstallStepCreateBlankForm"),
  };

  const renderConfirmBody = () => (
    <div className={styles.confirmBody}>
      <div className={styles.heroBadge} aria-hidden="true">
        <CatalogDocumentsIcon />
      </div>

      <div className={styles.heroText}>
        <Text as="p" className={styles.confirmText}>
          {t("Common:DashboardAIFormsDescription")}
        </Text>
        <Text as="p" className={styles.confirmHint}>
          {t("Common:DashboardInstallConfirmHint")}
        </Text>
      </div>

      <ul className={styles.bulletList}>
        <li className={styles.bulletItem}>
          <CheckIcon aria-hidden="true" className={styles.bulletIcon} />
          <Text as="span" className={styles.bulletText}>
            <Trans
              t={t}
              i18nKey="Common:DashboardInstallBulletCreateRoom"
              values={{ room: AI_FORMS_ROOM_TITLE }}
              components={{ 1: <strong /> }}
            />
          </Text>
        </li>
        <li className={styles.bulletItem}>
          <CheckIcon aria-hidden="true" className={styles.bulletIcon} />
          <Text as="span" className={styles.bulletText}>
            {t("Common:DashboardInstallBulletInvite")}
          </Text>
        </li>
        <li className={styles.bulletItem}>
          <CheckIcon aria-hidden="true" className={styles.bulletIcon} />
          <Text as="span" className={styles.bulletText}>
            {t("Common:DashboardInstallBulletStarter")}
          </Text>
        </li>
      </ul>
    </div>
  );

  const renderInstallingBody = () => (
    <div className={styles.installingBody}>
      <div className={styles.heroText}>
        <Text as="p" className={styles.confirmHint}>
          {t("Common:DashboardInstallProcessingHint")}
        </Text>
      </div>

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
              <Text className={styles.timelineLabel} as="span">
                {stepLabels[id]}
              </Text>
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
        primary
        scale
        size={ButtonSize.normal}
        label={t("Common:CancelButton")}
        onClick={onClose}
        isDisabled
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

  return (
    <ModalDialog
      visible={visible}
      onClose={inProgress ? () => {} : onClose}
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
}))(observer(InstallAiFormsDialogComponent));

export default InstallAiFormsDialog;
