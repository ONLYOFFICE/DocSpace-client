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
import { useTranslation } from "react-i18next";

import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { toastr } from "@docspace/ui-kit/components/toast";

import CheckIcon from "@docspace/ui-kit/assets/check.react.svg";
import DangerIcon from "@docspace/ui-kit/assets/danger.toast.react.svg";
import InfoIcon from "@docspace/ui-kit/assets/info.outline.react.svg";

import styles from "./InstallModuleDialog.module.scss";

export type InstallStep = {
  id: string;
  label: string;
  description: string;
};

type Phase = "confirm" | "installing" | "done" | "failed";

export type InstallModuleDialogProps = {
  visible: boolean;
  onClose: () => void;
  onInstalled: () => void;
  moduleTitle: string;
  confirmBody: React.ReactNode;
  doneHint: string;
  steps: InstallStep[];
  onInstall: (onStep: (id: string) => void, signal: AbortSignal) => Promise<void>;
  onCleanup: () => Promise<void>;
  skipConfirm?: boolean;
};

export const InstallModuleDialog = ({
  visible,
  onClose,
  onInstalled,
  moduleTitle,
  confirmBody,
  doneHint,
  steps,
  onInstall,
  onCleanup,
  skipConfirm = false,
}: InstallModuleDialogProps) => {
  const { t } = useTranslation(["Common"]);
  const [phase, setPhase] = React.useState<Phase>(
    skipConfirm ? "installing" : "confirm",
  );
  const [stepIndex, setStepIndex] = React.useState(0);
  const abortRef = React.useRef<AbortController | null>(null);
  const cancelledRef = React.useRef(false);
  // Keep a current-ref so handleInstallClick never needs steps in its deps.
  // steps only changes when libraryProgress updates descriptions — the IDs and
  // count are stable — so a stale closure would cause the skipConfirm effect
  // to re-fire on every progress tick and start duplicate installations.
  const stepsRef = React.useRef(steps);
  stepsRef.current = steps;

  const handleInstallClick = React.useCallback(async () => {
    setPhase("installing");
    setStepIndex(0);

    abortRef.current = new AbortController();
    cancelledRef.current = false;

    try {
      await onInstall(
        (id) => {
          const idx = stepsRef.current.findIndex((s) => s.id === id);
          if (idx >= 0) setStepIndex(idx);
        },
        abortRef.current.signal,
      );

      if (cancelledRef.current) return;

      setStepIndex(stepsRef.current.length);
      setPhase("done");
    } catch (err) {
      if (cancelledRef.current) return;
      console.error("Module install failed", err);
      setPhase("failed");
      toastr.error(t("Common:DashboardInstallFailed"));
    } finally {
      abortRef.current = null;
    }
  }, [onInstall, t]);

  const handleCancelInstalling = React.useCallback(async () => {
    cancelledRef.current = true;
    abortRef.current?.abort();
    try {
      await onCleanup();
    } catch (err) {
      console.error("Module cleanup after cancel failed", err);
    }
    toastr.info(t("Common:DashboardInstallCancelled"));
    onClose();
  }, [onClose, onCleanup, t]);

  React.useEffect(() => {
    if (!visible) {
      setPhase(skipConfirm ? "installing" : "confirm");
      setStepIndex(0);
    }
  }, [visible, skipConfirm]);

  React.useEffect(() => {
    if (visible && skipConfirm && phase === "installing") {
      handleInstallClick();
    }
  }, [visible, skipConfirm, phase, handleInstallClick]);

  const inProgress = phase === "installing";

  const renderInstallingBody = () => (
    <div className={styles.installingBody}>
      <div className={styles.keepOpenCallout} role="status">
        <InfoIcon className={styles.keepOpenCalloutIcon} aria-hidden="true" />
        <span>{t("Common:DashboardInstallKeepOpen")}</span>
      </div>

      <ol className={styles.timeline}>
        {steps.map(({ id, label, description }, idx) => {
          const state =
            idx < stepIndex ? "done" : idx === stepIndex ? "active" : "pending";
          const isLast = idx === steps.length - 1;
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
                  {label}
                </Text>
                <Text className={styles.timelineCounter} as="span">
                  {description}
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
      <div className={styles.heroBadge} data-status="success" aria-hidden="true">
        <CheckIcon />
      </div>
      <div className={styles.heroText}>
        <Text as="p" className={styles.confirmText}>
          {doneHint}
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
        {phase === "confirm" ? confirmBody : null}
        {phase === "installing" ? renderInstallingBody() : null}
        {phase === "done" ? renderDoneBody() : null}
        {phase === "failed" ? renderFailedBody() : null}
      </ModalDialog.Body>
      <ModalDialog.Footer>{renderFooter()}</ModalDialog.Footer>
    </ModalDialog>
  );
};

export default InstallModuleDialog;
