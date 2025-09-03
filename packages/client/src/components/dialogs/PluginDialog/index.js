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
import styled from "styled-components";
import { inject, observer } from "mobx-react";

import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Portal } from "@docspace/shared/components/portal";

import WrappedComponent from "SRC_DIR/helpers/plugins/WrappedComponent";
import { PluginComponents } from "SRC_DIR/helpers/plugins/enums";
import { messageActions } from "SRC_DIR/helpers/plugins/utils";
import { injectDefaultTheme } from "@docspace/shared/utils";

const StyledFullScreen = styled.div.attrs(injectDefaultTheme)`
  position: fixed;
  top: 0;
  // doesn't require mirroring for RTL
  left: 0;
  z-index: 500;
  background: ${(props) => props.theme.backgroundColor};

  width: 100%;
  height: 100%;
`;

const PluginDialog = ({
  isVisible,
  dialogHeader,
  dialogBody,
  dialogFooter,
  withoutBodyPadding = false,
  withoutHeaderMargin = false,
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

    messageActions({
      message,
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
    });
  };

  React.useEffect(() => {
    if (eventListeners) {
      eventListeners.forEach((e) => {
        const onAction = async (evt) => {
          const message = await e.onAction(evt);

          messageActions({
            message,
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
          });
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
    <ModalDialog
      visible={isVisible}
      onClose={onCloseAction}
      withoutPadding={withoutBodyPadding}
      withoutHeaderMargin={withoutHeaderMargin}
      {...rest}
    >
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
      {dialogFooterProps ? (
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
      ) : null}
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
