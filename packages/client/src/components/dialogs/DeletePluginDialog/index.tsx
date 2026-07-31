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
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { TData, toastr } from "@docspace/ui-kit/components/toast";
import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { TTranslation } from "@docspace/shared/types";
import { getBrandName } from "@docspace/shared/constants/brands";

type Props = {
  isVisible: boolean;
  onClose?: () => void;
  onDelete?: (t: TTranslation) => Promise<void>;
};

const DeletePluginDialog = (props: Props) => {
  const { t, ready } = useTranslation(["WebPlugins", "Common"]);
  const { isVisible, onClose, onDelete } = props;

  const [isRequestRunning, setIsRequestRunning] = React.useState(false);

  const onDeleteClick = async () => {
    try {
      setIsRequestRunning(true);
      await onDelete?.(t);

      setIsRequestRunning(true);
      onClose?.();
    } catch (error) {
      toastr.error(error as TData);
      onClose?.();
    }
  };

  return (
    <ModalDialog isLoading={!ready} visible={isVisible} onClose={onClose}>
      <ModalDialog.Header>{t("DeletePluginTitle")}</ModalDialog.Header>
      <ModalDialog.Body>
        {t("DeletePluginDescription", { productName: getBrandName("ProductName") })}
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          className="delete-button"
          key="DeletePortalBtn"
          label={t("Common:OKButton")}
          size={ButtonSize.normal}
          scale
          primary
          isLoading={isRequestRunning}
          testId="confirm_delete_plugin_button"
          onClick={onDeleteClick}
        />
        <Button
          className="cancel-button"
          key="CancelDeleteBtn"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          scale
          isDisabled={isRequestRunning}
          testId="cancel_delete_plugin_button"
          onClick={onClose}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject<TStore>(({ pluginStore }) => {
  const {
    deletePluginDialogProps,
    setDeletePluginDialogVisible,
    setDeletePluginDialogProps,
    uninstallPlugin,
  } = pluginStore;

  const onClose = () => {
    setDeletePluginDialogVisible(false);
    setDeletePluginDialogProps(null);
  };

  const { pluginName } = deletePluginDialogProps || {};

  const onDelete = async (t: TTranslation) => {
    if (!pluginName) return;

    await uninstallPlugin(pluginName, t);
  };

  return { onClose, onDelete };
})(observer(DeletePluginDialog));
