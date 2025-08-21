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
