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
import { Trans, useTranslation } from "react-i18next";

import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Text } from "@docspace/ui-kit/components/text";

type TModel = {
  id: string;
  title: string;
};

type DisableModelDialogProps = {
  model: TModel;
  isLoading: boolean;
  onConfirm: VoidFunction;
  onClose: VoidFunction;
};

const DisableModelDialog = ({
  model,
  isLoading,
  onConfirm,
  onClose,
}: DisableModelDialogProps) => {
  const { t } = useTranslation(["Common"]);

  return (
    <ModalDialog visible displayType={ModalDialogType.modal} onClose={onClose}>
      <ModalDialog.Header>{t("Common:DisableAIModel")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text>
          <Trans
            t={t}
            i18nKey="DisableAIModelDescription"
            ns="Common"
            values={{ model: model.title }}
            components={{ 1: <strong /> }}
          />
        </Text>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          primary
          size={ButtonSize.normal}
          label={t("Common:Disable")}
          scale
          onClick={onConfirm}
          isLoading={isLoading}
          testId="disable-ai-model-button"
        />
        <Button
          size={ButtonSize.normal}
          label={t("Common:CancelButton")}
          scale
          onClick={onClose}
          isDisabled={isLoading}
          testId="disable-ai-model-cancel-button"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

/**
 * Turning a model off takes it away from every user of the workspace, so it is
 * confirmed first; turning one back on is harmless and stays instant.
 */
export const useDisableModelConfirmation = (
  setAvailability?: (modelId: string, enabled: boolean) => Promise<void>,
) => {
  const [pendingModel, setPendingModel] = React.useState<TModel | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const requestToggle = React.useCallback(
    (model: TModel, enabled: boolean) => {
      if (enabled) {
        void setAvailability?.(model.id, true);
        return;
      }

      setPendingModel(model);
    },
    [setAvailability],
  );

  const onClose = React.useCallback(() => {
    if (isLoading) return;

    setPendingModel(null);
  }, [isLoading]);

  const onConfirm = React.useCallback(async () => {
    if (!pendingModel) return;

    setIsLoading(true);

    try {
      await setAvailability?.(pendingModel.id, false);
    } finally {
      setIsLoading(false);
      setPendingModel(null);
    }
  }, [pendingModel, setAvailability]);

  const disableModelDialog = pendingModel ? (
    <DisableModelDialog
      model={pendingModel}
      isLoading={isLoading}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  ) : null;

  return { requestToggle, disableModelDialog };
};

export default DisableModelDialog;
