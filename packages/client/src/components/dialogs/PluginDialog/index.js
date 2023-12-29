import React from "react";
import styled from "styled-components";
import { inject, observer } from "mobx-react";

import { ModalDialog, Portal } from "@docspace/shared/components";
import { Base } from "@docspace/shared/themes";

import WrappedComponent from "SRC_DIR/helpers/plugins/WrappedComponent";
import { PluginComponents } from "SRC_DIR/helpers/plugins/constants";
import { messageActions } from "SRC_DIR/helpers/plugins/utils";

const StyledFullScreen = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 500;
  background: ${(props) => props.theme.backgroundColor};

  width: 100%;
  height: 100%;
`;

StyledFullScreen.defaultProps = { theme: Base };

const PluginDialog = ({
  isVisible,
  dialogHeader,
  dialogBody,
  dialogFooter,
  onClose,
  onLoad,
  eventListeners,

  fullScreen,

  pluginName,

  setSettingsPluginDialogVisible,
  setCurrentSettingsDialogPlugin,
  updatePluginStatus,

  setPluginDialogVisible,
  setPluginDialogProps,

  updateContextMenuItems,
  updateInfoPanelItems,
  updateMainButtonItems,
  updateProfileMenuItems,
  updateEventListenerItems,
  updateFileItems,
  ...rest
}) => {
  const [dialogHeaderProps, setDialogHeaderProps] =
    React.useState(dialogHeader);
  const [dialogBodyProps, setDialogBodyProps] = React.useState(dialogBody);
  const [dialogFooterProps, setDialogFooterProps] =
    React.useState(dialogFooter);

  const [modalRequestRunning, setModalRequestRunning] = React.useState(false);

  const functionsRef = React.useRef([]);

  const onCloseAction = async () => {
    if (modalRequestRunning) return;
    const message = await onClose();

    messageActions(
      message,
      null,

      pluginName,

      setSettingsPluginDialogVisible,
      setCurrentSettingsDialogPlugin,
      updatePluginStatus,
      null,
      setPluginDialogVisible,
      setPluginDialogProps,

      updateContextMenuItems,
      updateInfoPanelItems,
      updateMainButtonItems,
      updateProfileMenuItems,
      updateEventListenerItems,
      updateFileItems
    );
  };

  React.useEffect(() => {
    if (eventListeners) {
      eventListeners.forEach((e) => {
        const onAction = async (evt) => {
          const message = await e.onAction(evt);

          messageActions(
            message,
            null,

            pluginName,

            setSettingsPluginDialogVisible,
            setCurrentSettingsDialogPlugin,
            updatePluginStatus,
            null,
            setPluginDialogVisible,
            setPluginDialogProps,

            updateContextMenuItems,
            updateInfoPanelItems,
            updateMainButtonItems,
            updateProfileMenuItems,
            updateEventListenerItems,
            updateFileItems
          );
        };

        functionsRef.current.push(onAction);

        window.addEventListener(e.name, onAction);
      });
    }

    return () => {
      if (eventListeners) {
        eventListeners.forEach((e, index) => {
          window.removeEventListener(e.name, functionsRef.current[index]);
        });
      }
    };
  }, []);

  const onLoadAction = React.useCallback(async () => {
    if (onLoad) {
      const res = await onLoad();
      setDialogHeaderProps(res.newDialogHeader);
      setDialogBodyProps(res.newDialogBody);
      setDialogFooterProps(res.newDialogFooter);
    }
  }, [onLoad]);

  React.useEffect(() => {
    onLoadAction();
  }, [onLoadAction]);

  const rootElement = document.getElementById("root");

  const dialog = fullScreen ? (
    <StyledFullScreen>
      <WrappedComponent
        pluginName={pluginName}
        component={{
          component: PluginComponents.box,
          props: dialogBodyProps,
        }}
        setModalRequestRunning={setModalRequestRunning}
      />
    </StyledFullScreen>
  ) : (
    <ModalDialog visible={isVisible} onClose={onCloseAction} {...rest}>
      <ModalDialog.Header>{dialogHeaderProps}</ModalDialog.Header>
      <ModalDialog.Body>
        <WrappedComponent
          pluginName={pluginName}
          component={{
            component: PluginComponents.box,
            props: dialogBodyProps,
          }}
          setModalRequestRunning={setModalRequestRunning}
        />
      </ModalDialog.Body>
      {dialogFooterProps && (
        <ModalDialog.Footer>
          <WrappedComponent
            pluginName={pluginName}
            component={{
              component: PluginComponents.box,
              props: dialogFooterProps,
            }}
            setModalRequestRunning={setModalRequestRunning}
          />
        </ModalDialog.Footer>
      )}
    </ModalDialog>
  );

  return <Portal element={dialog} appendTo={rootElement} visible={isVisible} />;
};

export default inject(({ pluginStore }) => {
  const {
    pluginDialogProps,
    setSettingsPluginDialogVisible,
    setCurrentSettingsDialogPlugin,
    updatePluginStatus,

    setPluginDialogVisible,
    setPluginDialogProps,

    updateContextMenuItems,
    updateInfoPanelItems,
    updateMainButtonItems,
    updateProfileMenuItems,
    updateEventListenerItems,
    updateFileItems,
  } = pluginStore;

  return {
    ...pluginDialogProps,
    setSettingsPluginDialogVisible,
    setCurrentSettingsDialogPlugin,
    updatePluginStatus,

    setPluginDialogVisible,
    setPluginDialogProps,

    updateContextMenuItems,
    updateInfoPanelItems,
    updateMainButtonItems,
    updateProfileMenuItems,
    updateEventListenerItems,
    updateFileItems,
  };
})(observer(PluginDialog));
