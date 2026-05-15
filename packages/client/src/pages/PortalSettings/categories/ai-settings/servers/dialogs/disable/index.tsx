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
import { toastr } from "@docspace/ui-kit/components/toast";
import { Text } from "@docspace/ui-kit/components/text";
import type { TServer } from "@docspace/shared/api/ai/types";
import type AISettingsStore from "SRC_DIR/store/portal-settings/AISettingsStore";
import { inject, observer } from "mobx-react";

type DisableDialogProps = {
  onClose: VoidFunction;
  serverId: TServer["id"];

  updateMCPStatus?: AISettingsStore["updateMCPStatus"];
};

const DisableDialogComponent = ({
  onClose,
  serverId,
  updateMCPStatus,
}: DisableDialogProps) => {
  const { t } = useTranslation(["AISettings", "Common", "OAuth"]);

  const [loading, setLoading] = React.useState(false);

  const onSubmitAction = async () => {
    setLoading(true);

    try {
      await updateMCPStatus?.(serverId, false);
      toastr.success(t("AISettings:ServerDisabledSuccess"));
    } catch (error) {
      console.error(error);
      toastr.error(error as string);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <ModalDialog visible displayType={ModalDialogType.modal} onClose={onClose}>
      <ModalDialog.Header>
        {t("AISettings:DisableMCPServer")}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <Text>
          <Trans t={t} i18nKey="DisableServerDescription" ns="AISettings" />
        </Text>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          primary
          size={ButtonSize.normal}
          label={t("Common:OKButton")}
          scale
          onClick={onSubmitAction}
          isLoading={loading}
          testId="disable-mcp-button"
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

export const DisableMCPDialog = inject(({ aiSettingsStore }: TStore) => {
  return {
    updateMCPStatus: aiSettingsStore.updateMCPStatus,
  };
})(observer(DisableDialogComponent));
