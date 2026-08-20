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

import type { ComponentType } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import type {
  IComboBoxItem,
  ICreateDialog,
} from "@onlyoffice/docspace-plugin-sdk";
import type { TTranslation } from "@docspace/shared/types";

import { getPluginFileTestIdPrefix } from "SRC_DIR/helpers/filesUtils";
import type { TMessageActionsParams } from "SRC_DIR/helpers/plugins/types";
import type PluginStore from "SRC_DIR/store/PluginStore";

import DialogComponent from "./sub-components/Dialog";

type TDialogProps = {
  t: TTranslation;
  visible: boolean;
  title: string;
  testIdPrefix?: string;
  startValue?: string;
  isCreateDialog?: boolean;
  isCreateDisabled?: boolean;
  extension?: string;
  errorText?: string;
  options?: IComboBoxItem[];
  selectedOption?: IComboBoxItem;
  onSave?: (e: unknown, value: string) => Promise<void>;
  onChange?: (value: string) => void;
  onSelect?: (option: IComboBoxItem) => void;
  onCancel?: (e?: unknown) => void;
  onClose?: (e?: unknown) => void;
};

const Dialog = DialogComponent as unknown as ComponentType<TDialogProps>;

type TCreatePluginFileProps = Omit<ICreateDialog, "onCancel" | "onClose"> & {
  pluginName: string;
  onCancel?: (e?: unknown) => void;
  onClose?: (e?: unknown) => void;
  updateCreatePluginFileProps?: TMessageActionsParams["updateCreateDialogProps"];
  dispatchMessage: PluginStore["dispatchMessage"];
};

const CreatePluginFile = ({
  visible,
  title,
  startValue,
  onSave,
  onChange,
  onError,
  onCancel,
  onClose,
  isCreateDialog,
  isCreateDisabled,
  isCloseAfterCreate = true,
  options,
  selectedOption,
  onSelect,
  extension,
  pluginName,
  errorText,
  isAutoFocusOnError,
  updateCreatePluginFileProps,
  dispatchMessage,
}: TCreatePluginFileProps) => {
  const { t } = useTranslation(["Translations", "Common", "Files"]);

  const onCloseAction = () => {
    onCancel?.();
    onClose?.();
  };

  const onSaveAction = async (e: unknown, value: string) => {
    if (!onSave) {
      onCloseAction();
      return;
    }

    try {
      const message = await onSave(e, value);

      dispatchMessage({
        message,
        pluginName,
        updateCreateDialogProps: updateCreatePluginFileProps,
      });

      if (isCloseAfterCreate) onCloseAction();
    } catch (error) {
      if (!onError) return;

      if (isAutoFocusOnError) {
        setTimeout(() => {
          document.getElementById("create-text-input")?.focus();
        }, 50);
      }

      const message = await onError(error);

      dispatchMessage({
        message,
        pluginName,
        updateCreateDialogProps: updateCreatePluginFileProps,
      });
    }
  };

  const onSelectAction = (option: IComboBoxItem) => {
    if (!onSelect) return;

    try {
      const message = onSelect(option);

      dispatchMessage({
        message,
        pluginName,
        updateCreateDialogProps: updateCreatePluginFileProps,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const onChangeAction = (value: string) => {
    if (!onChange) return;

    try {
      const message = onChange(value);

      dispatchMessage({
        message,
        pluginName,
        updateCreateDialogProps: updateCreatePluginFileProps,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog
      t={t}
      visible={visible}
      title={title}
      testIdPrefix={getPluginFileTestIdPrefix(extension)}
      startValue={startValue}
      onSave={onSaveAction}
      onChange={onChangeAction}
      onCancel={onCloseAction}
      onClose={onCloseAction}
      isCreateDialog={isCreateDialog}
      options={options}
      selectedOption={selectedOption}
      onSelect={onSelectAction}
      extension={extension}
      errorText={errorText}
      isCreateDisabled={isCreateDisabled}
    />
  );
};

export default inject(({ pluginStore }: TStore) => {
  const { dispatchMessage } = pluginStore;

  return { dispatchMessage };
})(observer(CreatePluginFile));
