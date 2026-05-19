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

import { FillingStatusPanel } from "@docspace/shared/dialogs/FillingStatusPanel";

import type { TFile } from "@docspace/shared/api/files/types";

import type { TUser } from "@docspace/shared/api/people/types";
import type { TTranslation } from "@docspace/shared/types";

export interface FillingStatusPanelWrapperProps {
  fillingStatusPanel: boolean;
  setFillingStatusPanelVisible: (visible: boolean) => void;
  file: TFile | null;
  user: TUser | null;
  setStopFillingDialogVisible: (visible: boolean, formId?: number) => void;
  onClickLinkFillForm: (item: TFile) => void;
  onDelete: (item: TFile, t: TTranslation) => void;
  onClickResetAndStartFilling: (item: TFile) => void;
}

const FillingStatusPanelWrapper = ({
  fillingStatusPanel,
  setFillingStatusPanelVisible,
  file,
  user,
  setStopFillingDialogVisible,
  onClickLinkFillForm,
  onDelete,
  onClickResetAndStartFilling,
}: FillingStatusPanelWrapperProps) => {
  const { t } = useTranslation(["Common"]);

  const onClose = () => {
    setFillingStatusPanelVisible(false);
  };

  const handleFill = (item: TFile) => {
    onClickLinkFillForm(item);
    onClose();
  };

  const handleStopFilling = (item: TFile) => {
    setStopFillingDialogVisible(true, item.id);
    onClose();
  };

  const handleDelete = (item: TFile) => {
    onDelete(item, t);
    onClose();
  };

  const handleResetFilling = (item: TFile) => {
    onClickResetAndStartFilling(item);
    onClose();
  };

  if (!file || !user || !fillingStatusPanel) return null;

  return (
    <FillingStatusPanel
      user={user}
      file={file}
      visible={fillingStatusPanel}
      onClose={onClose}
      onFill={handleFill}
      onStopFilling={handleStopFilling}
      onDelete={handleDelete}
      onResetFilling={handleResetFilling}
    />
  );
};

export default inject<TStore, React.FC, FillingStatusPanelWrapperProps>(
  ({ dialogsStore, filesStore, userStore, contextOptionsStore }) => {
    const {
      fillingStatusPanel,
      setFillingStatusPanelVisible,
      setStopFillingDialogVisible,
    } = dialogsStore;

    const { onClickLinkFillForm, onDelete, onClickResetAndStartFilling } =
      contextOptionsStore;

    const { user } = userStore;
    const { bufferSelection } = filesStore;

    const file = bufferSelection as TFile | null;

    return {
      fillingStatusPanel,
      setFillingStatusPanelVisible,
      file,
      user,
      setStopFillingDialogVisible,
      onClickLinkFillForm,
      onDelete,
      onClickResetAndStartFilling,
    };
  },
)(observer(FillingStatusPanelWrapper as React.FC));
