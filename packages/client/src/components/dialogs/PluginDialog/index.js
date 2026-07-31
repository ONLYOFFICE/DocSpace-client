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

import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Portal } from "@docspace/ui-kit/components/portal";
import WrappedComponent from "SRC_DIR/helpers/plugins/WrappedComponent";
import { PluginComponents } from "SRC_DIR/helpers/plugins/enums";
import { messageActions } from "SRC_DIR/helpers/plugins/utils";
import styles from "./PluginDialog.module.scss";

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
          setModalRequestRunning(true);
          const message = await e.onAction(evt);
          setModalRequestRunning(false);

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
    <div className={styles.fullScreen}>
      <WrappedComponent
        pluginName={pluginName}
        component={{
          component: PluginComponents.box,
          props: dialogBodyProps,
        }}
        setModalRequestRunning={setModalRequestRunning}
        modalRequestRunning={modalRequestRunning}
      />
    </div>
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
          modalRequestRunning={modalRequestRunning}
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
            modalRequestRunning={modalRequestRunning}
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
