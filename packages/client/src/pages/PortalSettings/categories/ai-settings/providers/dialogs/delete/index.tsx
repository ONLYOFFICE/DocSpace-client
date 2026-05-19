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
import { inject, observer } from "mobx-react";

import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { toastr } from "@docspace/ui-kit/components/toast";
import { Text } from "@docspace/ui-kit/components/text";
import type { TAiProvider } from "@docspace/shared/api/ai/types";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";

import type AISettingsStore from "SRC_DIR/store/portal-settings/AISettingsStore";

type Props = {
  providerId: TAiProvider["id"];
  deleteAIProvider?: AISettingsStore["deleteAIProvider"];
  getAIConfig?: SettingsStore["getAIConfig"];
  onClose: VoidFunction;
  showDefaultProviderWarning?: boolean;
};

const DeleteDialogComponent = ({
  providerId,
  deleteAIProvider,
  onClose,
  getAIConfig,
  showDefaultProviderWarning,
}: Props) => {
  const { t } = useTranslation(["Common", "AISettings"]);

  const [loading, setLoading] = React.useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);

      await deleteAIProvider?.(providerId);
      getAIConfig?.();

      toastr.success(
        t("AISettings:ProviderRemovedSuccess", {
          aiProvider: t("Common:AIProvider"),
        }),
      );
    } catch (error) {
      console.error(error);
      toastr.error(error as string);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const bodyText = showDefaultProviderWarning ? (
    <Trans
      t={t}
      i18nKey="AISettings:DeleteDefaultProviderDescription"
      values={{ aiProvider: t("Common:AIProvider") }}
      components={{
        1: (
          <strong
            key="default-provider-warning-strong"
            style={{ fontWeight: "600" }}
          />
        ),
      }}
    />
  ) : (
    t("AISettings:DeleteProviderDescription")
  );

  return (
    <ModalDialog visible displayType={ModalDialogType.modal} onClose={onClose}>
      <ModalDialog.Header>
        {t("AISettings:DeleteProvider", {
          aiProvider: t("Common:AIProvider"),
        })}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <Text>{bodyText}</Text>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          primary
          size={ButtonSize.normal}
          label={t("Common:Delete")}
          scale
          onClick={onSubmit}
          isLoading={loading}
          testId="delete-provider-button"
        />
        <Button
          size={ButtonSize.normal}
          label={t("Common:CancelButton")}
          scale
          onClick={onClose}
          isDisabled={loading}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export const DeleteAIProviderDialog = inject(
  ({ aiSettingsStore, settingsStore }: TStore) => {
    return {
      deleteAIProvider: aiSettingsStore.deleteAIProvider,
      getAIConfig: settingsStore.getAIConfig,
    };
  },
)(observer(DeleteDialogComponent));
