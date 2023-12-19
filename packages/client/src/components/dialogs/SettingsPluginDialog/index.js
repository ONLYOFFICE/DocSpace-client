import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import ModalDialog from "@docspace/components/modal-dialog";

import { PluginComponents } from "SRC_DIR/helpers/plugins/constants";
import WrappedComponent from "SRC_DIR/helpers/plugins/WrappedComponent";

import Header from "./sub-components/Header";
import Info from "./sub-components/Info";
import Footer from "./sub-components/Footer";
import Button from "@docspace/components/button";

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

  ...rest
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

  return (
    <ModalDialog
      visible={settingsPluginDialogVisible}
      displayType="aside"
      onClose={onCloseAction}
      withBodyScroll
      withFooterBorder
    >
      <ModalDialog.Header>
        <Header t={t} name={plugin?.name} />
      </ModalDialog.Header>
      <ModalDialog.Body>
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
        {withDelete && (
          <Button
            label={t("DeletePlugin")}
            onClick={onDeleteAction}
            scale
            size={"normal"}
          />
        )}
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

export default inject(({ auth, pluginStore }) => {
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

  const { pluginOptions } = auth.settingsStore;

  const { pluginName } = currentSettingsDialogPlugin;

  const plugin = pluginList.find((p) => p.name === pluginName);

  const withDelete = pluginOptions.delete && !plugin.system;

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
