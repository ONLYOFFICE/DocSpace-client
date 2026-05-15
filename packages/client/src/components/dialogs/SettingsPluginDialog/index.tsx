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

import { useCallback, useEffect, useState } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";

import { PluginComponents } from "SRC_DIR/helpers/plugins/enums";
import WrappedComponent from "SRC_DIR/helpers/plugins/WrappedComponent";

import Header from "./sub-components/Header";
import Info from "./sub-components/Info";
import Footer from "./sub-components/Footer";
import { SettingsPluginDialogProps } from "./SettingsPluginDialog.types";

const SettingsPluginDialog = ({
  plugin,
  withDelete,

  pluginSettings,

  settingsPluginDialogVisible,

  onClose,
  onDelete,
  updatePlugin,
}: SettingsPluginDialogProps) => {
  const { t } = useTranslation(["WebPlugins", "Common", "Files", "People"]);

  const { saveButton, settings, onLoad } = pluginSettings ? pluginSettings : {};

  const [customSettingsProps, setCustomSettingsProps] = useState(settings);

  const [saveButtonProps, setSaveButtonProps] = useState(saveButton);

  const [modalRequestRunning, setModalRequestRunning] = useState(false);

  const onLoadAction = useCallback(async () => {
    if (!onLoad) return;
    const res = await onLoad();

    const { settings, saveButton } = res;

    setCustomSettingsProps(settings);
    if (saveButton)
      setSaveButtonProps({
        ...saveButton,
        props: { ...saveButton.props },
      });
  }, [onLoad]);

  useEffect(() => {
    onLoadAction();
  }, [onLoadAction]);

  const onCloseAction = () => {
    if (modalRequestRunning) return;
    onClose();
  };

  const onDeleteAction = () => {
    if (modalRequestRunning) return;
    onClose();

    onDelete();
  };

  if (!plugin) return null;

  return (
    <ModalDialog
      visible={settingsPluginDialogVisible}
      displayType={ModalDialogType.aside}
      onClose={onCloseAction}
      withBodyScroll
      dataTestId="settings-plugin-dialog"
    >
      <ModalDialog.Header>
        <Header t={t} name={plugin.nameLocale} />
      </ModalDialog.Header>
      <ModalDialog.Body>
        <div style={{ marginTop: "16px" }}>
          <WrappedComponent
            pluginName={plugin.name}
            component={{
              component: PluginComponents.box,
              props: customSettingsProps,
            }}
            saveButton={saveButtonProps}
            setSaveButtonProps={setSaveButtonProps}
            setModalRequestRunning={setModalRequestRunning}
            modalRequestRunning={modalRequestRunning}
          />
          <Info
            t={t}
            plugin={plugin}
            withDelete={withDelete}
            withSeparator={!!customSettingsProps?.children}
          />
          {withDelete ? (
            <Button
              label={t("DeletePlugin")}
              onClick={onDeleteAction}
              scale
              size={ButtonSize.normal}
              testId="settings_delete_plugin_button"
            />
          ) : null}
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Footer
          t={t}
          pluginName={plugin.name}
          saveButtonProps={saveButtonProps}
          setModalRequestRunning={setModalRequestRunning}
          onCloseAction={onCloseAction}
          modalRequestRunning={modalRequestRunning}
          updatePlugin={updatePlugin}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(({ settingsStore, pluginStore }: TStore) => {
  const {
    pluginList,
    settingsPluginDialogVisible,
    setSettingsPluginDialogVisible,
    currentSettingsDialogPlugin,
    setCurrentSettingsDialogPlugin,
    setDeletePluginDialogVisible,
    setDeletePluginDialogProps,
    updatePlugin,
  } = pluginStore;

  const { pluginOptions, standalone } = settingsStore;

  const currentSettingsDialog = currentSettingsDialogPlugin
    ? { ...currentSettingsDialogPlugin }
    : null;

  const pluginName = currentSettingsDialog?.pluginName;

  const plugin = pluginList.find((p) => p.name === pluginName);

  const withDelete = standalone
    ? pluginOptions.delete
    : pluginOptions.delete && !plugin?.system;

  const pluginSettings = plugin?.getAdminPluginSettings?.();

  const onClose = () => {
    setSettingsPluginDialogVisible(false);
    setCurrentSettingsDialogPlugin(null);
  };

  const onDelete = () => {
    setDeletePluginDialogVisible(true);
    setDeletePluginDialogProps(currentSettingsDialog);
  };

  return {
    plugin,
    withDelete,
    pluginSettings,
    settingsPluginDialogVisible,
    updatePlugin,

    onClose,
    onDelete,
  };
})(observer(SettingsPluginDialog));
