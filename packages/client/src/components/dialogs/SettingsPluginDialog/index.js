// (c) Copyright Ascensio System SIA 2009-2025
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

import { Button } from "@docspace/shared/components/button";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";

import { PluginComponents } from "SRC_DIR/helpers/plugins/enums";
import WrappedComponent from "SRC_DIR/helpers/plugins/WrappedComponent";

import Header from "./sub-components/Header";
import Info from "./sub-components/Info";
import Footer from "./sub-components/Footer";

const SettingsPluginDialog = ({
  plugin,
  withDelete,
  onLoad,

  settings,
  saveButton,

  settingsPluginDialogVisible,

  onClose,
  onDelete,
  updatePlugin,
}) => {
  const { t } = useTranslation(["WebPlugins", "Common", "Files", "People"]);

  const [customSettingsProps, setCustomSettingsProps] =
    React.useState(settings);

  const [saveButtonProps, setSaveButtonProps] = React.useState(saveButton);

  const [modalRequestRunning, setModalRequestRunning] = React.useState(false);

  const onLoadAction = React.useCallback(async () => {
    if (!onLoad) return;
    const res = await onLoad();

    setCustomSettingsProps(res.settings);
    if (res.saveButton)
      setSaveButtonProps({
        ...res.saveButton,
        props: { ...res.saveButton, scale: true },
      });
  }, [onLoad]);

  React.useEffect(() => {
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
      displayType="aside"
      onClose={onCloseAction}
      withBodyScroll
    >
      <ModalDialog.Header>
        <Header t={t} name={plugin.name} />
      </ModalDialog.Header>
      <ModalDialog.Body>
        <div style={{ marginTop: "16px" }}>
          <WrappedComponent
            pluginName={plugin.name}
            component={{
              component: PluginComponents.box,
              props: customSettingsProps,
            }}
            saveButton={saveButton}
            setSaveButtonProps={setSaveButtonProps}
            setModalRequestRunning={setModalRequestRunning}
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
              size="normal"
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

export default inject(({ settingsStore, pluginStore }) => {
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

  const { pluginOptions } = settingsStore;

  const { pluginName } = currentSettingsDialogPlugin;

  const plugin = pluginList.find((p) => p.name === pluginName);

  const withDelete = pluginOptions.delete && !plugin?.system;

  const pluginSettings = plugin?.getAdminPluginSettings();

  const onClose = () => {
    setSettingsPluginDialogVisible(false);
    setCurrentSettingsDialogPlugin(null);
  };

  const onDelete = () => {
    setDeletePluginDialogVisible(true);
    setDeletePluginDialogProps({ pluginName });
  };

  return {
    plugin,
    withDelete,
    ...pluginSettings,
    settingsPluginDialogVisible,
    updatePlugin,

    onClose,
    onDelete,
  };
})(observer(SettingsPluginDialog));
