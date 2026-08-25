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

import React from "react";
import { useTranslation } from "react-i18next";

import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Text } from "@docspace/ui-kit/components/text";
import { useStores } from "@docspace/ui-kit/ai-agent/providers";

import styles from "./TurnOffModelDialog.module.scss";

// Remembered per browser only — the backend has no place for this preference
// yet, so an admin who opted out still sees the dialog on another device.
const HIDE_CONFIRMATION_KEY = "aiModelTurnOffConfirmationHidden";

const isConfirmationHidden = () =>
  localStorage.getItem(HIDE_CONFIRMATION_KEY) === "true";

const hideConfirmation = () =>
  localStorage.setItem(HIDE_CONFIRMATION_KEY, "true");

type TModel = {
  id: string;
  title: string;
};

type TurnOffModelDialogProps = {
  model: TModel;
  isLoading: boolean;
  onConfirm: (dontShowAgain: boolean) => void;
  onClose: VoidFunction;
};

const TurnOffModelDialog = ({
  model,
  isLoading,
  onConfirm,
  onClose,
}: TurnOffModelDialogProps) => {
  const { t } = useTranslation(["Common"]);

  const [dontShowAgain, setDontShowAgain] = React.useState(false);

  return (
    <ModalDialog visible displayType={ModalDialogType.modal} onClose={onClose}>
      <ModalDialog.Header>
        {t("Common:TurnOffAIModelTitle", { model: model.title })}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.body}>
          <Text>{t("Common:TurnOffAIModelDescription")}</Text>
          <Text>{t("Common:TurnOffAIModelHint")}</Text>
          <Checkbox
            isChecked={dontShowAgain}
            onChange={() => setDontShowAgain((checked) => !checked)}
            label={t("Common:DontShowAgain")}
            isDisabled={isLoading}
            dataTestId="turn-off-ai-model-dont-show-again"
          />
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          primary
          size={ButtonSize.normal}
          label={t("Common:TurnOff")}
          scale
          onClick={() => onConfirm(dontShowAgain)}
          isLoading={isLoading}
          testId="turn-off-ai-model-button"
        />
        <Button
          size={ButtonSize.normal}
          label={t("Common:CancelButton")}
          scale
          onClick={onClose}
          isDisabled={isLoading}
          testId="turn-off-ai-model-cancel-button"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

/**
 * Turning a model off takes it away from every user of the workspace, so it is
 * confirmed first; turning one back on is harmless and stays instant. An admin
 * who ticked "Don't show again" skips straight to the request.
 */
export const useTurnOffModelConfirmation = (
  setAvailability?: (modelId: string, enabled: boolean) => Promise<void>,
) => {
  const [pendingModel, setPendingModel] = React.useState<TModel | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const { useProfilesStore } = useStores();
  const reloadProfiles = useProfilesStore((s) => s.reloadProfiles);

  // The chat library's profiles store is hydrated once per session, so a
  // restriction change here would otherwise stay invisible to every profile
  // picker (e.g. the New Agent dialog) until its next remount (Bug 83359).
  // Refresh it as soon as the restriction PUT has settled; the picker list
  // is cosmetic at this point, so a failed reload is not surfaced.
  const applyToggle = React.useCallback(
    async (modelId: string, enabled: boolean) => {
      try {
        await setAvailability?.(modelId, enabled);
      } finally {
        void reloadProfiles().catch(() => undefined);
      }
    },
    [setAvailability, reloadProfiles],
  );

  const requestToggle = React.useCallback(
    (model: TModel, enabled: boolean) => {
      if (enabled || isConfirmationHidden()) {
        void applyToggle(model.id, enabled);
        return;
      }

      setPendingModel(model);
    },
    [applyToggle],
  );

  const onClose = React.useCallback(() => {
    if (isLoading) return;

    setPendingModel(null);
  }, [isLoading]);

  const onConfirm = React.useCallback(
    async (dontShowAgain: boolean) => {
      if (!pendingModel) return;

      setIsLoading(true);

      try {
        await applyToggle(pendingModel.id, false);
        if (dontShowAgain) hideConfirmation();
      } finally {
        setIsLoading(false);
        setPendingModel(null);
      }
    },
    [pendingModel, applyToggle],
  );

  const turnOffModelDialog = pendingModel ? (
    <TurnOffModelDialog
      model={pendingModel}
      isLoading={isLoading}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  ) : null;

  return { requestToggle, turnOffModelDialog };
};

export default TurnOffModelDialog;
