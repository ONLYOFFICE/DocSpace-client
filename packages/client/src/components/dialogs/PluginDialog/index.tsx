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
import type { BoxGroup } from "@onlyoffice/docspace-plugin-sdk";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Portal } from "@docspace/ui-kit/components/portal";

import WrappedComponent from "SRC_DIR/helpers/plugins/WrappedComponent";
import { PluginComponents } from "SRC_DIR/helpers/plugins/enums";
import PluginWrappedComponent from "SRC_DIR/components/plugins/PluginWrappedComponent";

import styles from "./PluginDialog.module.scss";
import type { PluginDialogProps } from "./PluginDialog.types";

const DISPLAY_TYPE_MAP: Partial<Record<string, ModalDialogType>> = {
  modal: ModalDialogType.modal,
  aside: ModalDialogType.aside,
};

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

  displayType,
  fullScreen,

  pluginName,

  reactPluginModalState,
  closeReactPluginModal,

  dispatchMessage,
  ...rest
}: PluginDialogProps) => {
  const [dialogHeaderProps, setDialogHeaderProps] =
    React.useState(dialogHeader);
  const [dialogBodyProps, setDialogBodyProps] = React.useState(dialogBody);
  const [dialogFooterProps, setDialogFooterProps] =
    React.useState(dialogFooter);

  const [modalRequestRunning, setModalRequestRunning] = React.useState(false);

  const onCloseAction = async () => {
    if (modalRequestRunning) return;
    const message = await onClose?.();

    dispatchMessage({ message, pluginName });
  };

  React.useEffect(() => {
    if (!eventListeners) return;

    const handlers = eventListeners.map((e) => {
      const onAction = async (event: Event) => {
        setModalRequestRunning(true);
        const message = await e.onAction(event);
        setModalRequestRunning(false);

        dispatchMessage({ message, pluginName });
      };

      window.addEventListener(e.name, onAction);

      return onAction;
    });

    return () => {
      eventListeners.forEach((e, index) => {
        window.removeEventListener(e.name, handlers[index]);
      });
    };
  }, [eventListeners, pluginName, dispatchMessage]);

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

  if (reactPluginModalState) {
    const {
      pluginName: rpName,
      component,
      options,
      currentFile,
    } = reactPluginModalState;
    const reactDisplayType =
      options?.displayType === "aside"
        ? ModalDialogType.aside
        : ModalDialogType.modal;

    const reactBody = (
      <PluginWrappedComponent
        pluginName={rpName}
        component={component}
        currentFile={currentFile}
      />
    );

    const reactDialog = options?.fullScreen ? (
      <div className={styles.fullScreen}>{reactBody}</div>
    ) : (
      <ModalDialog
        visible
        onClose={closeReactPluginModal}
        displayType={reactDisplayType}
        autoMaxWidth={options?.autoMaxWidth}
        autoMaxHeight={options?.autoMaxHeight}
        withoutPadding={options?.withoutBodyPadding}
        withoutHeaderMargin={options?.withoutHeaderMargin}
        withFooterBorder={options?.withFooterBorder}
      >
        {options?.dialogHeader ? (
          <ModalDialog.Header>{options.dialogHeader}</ModalDialog.Header>
        ) : null}
        <ModalDialog.Body>{reactBody}</ModalDialog.Body>
      </ModalDialog>
    );

    return <Portal element={reactDialog} appendTo={rootElement} visible />;
  }

  const body = dialogBodyProps ? (
    <WrappedComponent
      pluginName={pluginName}
      component={
        {
          component: PluginComponents.box,
          props: dialogBodyProps,
        } satisfies BoxGroup
      }
      setModalRequestRunning={setModalRequestRunning}
      modalRequestRunning={modalRequestRunning}
    />
  ) : null;

  const dialog = fullScreen ? (
    <div className={styles.fullScreen}>{body}</div>
  ) : (
    <ModalDialog
      visible={isVisible}
      onClose={onCloseAction}
      withoutPadding={withoutBodyPadding}
      withoutHeaderMargin={withoutHeaderMargin}
      displayType={displayType ? DISPLAY_TYPE_MAP[displayType] : undefined}
      dataTestId="plugin_modal"
      {...rest}
    >
      <ModalDialog.Header>{dialogHeaderProps}</ModalDialog.Header>
      <ModalDialog.Body>{body}</ModalDialog.Body>
      {dialogFooterProps ? (
        <ModalDialog.Footer>
          <WrappedComponent
            pluginName={pluginName}
            component={
              {
                component: PluginComponents.box,
                props: dialogFooterProps,
              } satisfies BoxGroup
            }
            setModalRequestRunning={setModalRequestRunning}
            modalRequestRunning={modalRequestRunning}
          />
        </ModalDialog.Footer>
      ) : null}
    </ModalDialog>
  );

  return <Portal element={dialog} appendTo={rootElement} visible={isVisible} />;
};

export default inject(({ pluginStore }: TStore) => {
  const {
    pluginDialogProps,
    dispatchMessage,
    reactPluginModalState,
    closeReactPluginModal,
  } = pluginStore;

  return {
    ...pluginDialogProps,
    dispatchMessage,
    reactPluginModalState,
    closeReactPluginModal,
  };
})(observer(PluginDialog));
