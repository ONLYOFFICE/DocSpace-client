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

import { inject, observer } from "mobx-react";
import { useEffect, useEffectEvent } from "react";
import { useTranslation } from "react-i18next";
import type {
  FilesSecurity,
  Security,
  TFilesSelector,
} from "@onlyoffice/docspace-plugin-sdk";

import FilesSelector from "@docspace/ui-kit/selectors/Files";
import {
  THeaderBackButton,
  TSelectorHeader,
} from "@docspace/ui-kit/components/selector";
import { FilesSelectorProps } from "@docspace/ui-kit/selectors/Files/FilesSelector.types";
import { isDesktop, isTablet } from "@docspace/shared/utils";
import { DeviceType, FolderType } from "@docspace/shared/enums";
import type { SdkFolderType } from "@docspace/ui-kit/selectors/Files/FilesSelector.types";

import PluginStore from "SRC_DIR/store/PluginStore";
import FilesSettingsStore from "SRC_DIR/store/FilesSettingsStore";
import SelectedFolderStore from "SRC_DIR/store/SelectedFolderStore";

type Props = {
  pluginSelectorProps: TFilesSelector;
  dispatchMessage: PluginStore["dispatchMessage"];
  pluginName: string;
} & Partial<InjectedProps>;

type InjectedProps = {
  getIcon: FilesSettingsStore["getIcon"];
  rootFolderType: SelectedFolderStore["rootFolderType"];
};

const PluginFilesSelector = ({
  pluginSelectorProps: selectorProps,
  dispatchMessage,
  getIcon,
  rootFolderType,
  pluginName,
}: Props) => {
  const { t } = useTranslation(["Common"]);

  const {
    withCreate,
    withCancelButton,
    withSearch,
    openRoot,
    currentFolderId,
    withBreadCrumbs,
    withFooterCheckbox,
    withFooterInput,
    footerCheckboxLabel,
    footerInputHeader,
    currentFooterInputValue,
    descriptionText,
    cancelButtonLabel,
    submitButtonLabel,
    isRoomsOnly,
    isMultiSelect,
    filterParam,
  } = selectorProps;

  const onLoadEvent = useEffectEvent(async () => {
    if (!selectorProps.onLoad) return;
    const message = await selectorProps.onLoad();
    dispatchMessage({ message, pluginName });
  });

  useEffect(() => {
    onLoadEvent();
  }, []);

  const onCancel = async () => {
    if (!selectorProps.onCancel) return;
    const message = await selectorProps.onCancel();
    dispatchMessage({ message, pluginName });
  };

  const onSubmit: FilesSelectorProps["onSubmit"] = async (
    selectedItemId,
    folderTitle,
    showMoveToPublicDialog,
    breadCrumbs,
    fileName,
    isChecked,
    selectedTreeNode,
    selectedFileInfo,
  ) => {
    if (!selectorProps.onSubmit) return;

    const message = await selectorProps.onSubmit({
      selectedItemId,
      folderTitle,
      fileName,
      selectedFileInfo: selectedFileInfo,
      breadCrumbs,
      isChecked,
    });
    dispatchMessage({ message, pluginName });
  };

  const onSelectItem: FilesSelectorProps["onSelectItem"] = async (item) => {
    if (!selectorProps.onSelect) return;
    const message = await selectorProps.onSelect(item.id);
    dispatchMessage({ message, pluginName });
  };

  const getIsDisabled: FilesSelectorProps["getIsDisabled"] = (
    isFirstLoad,
    isSelectedParentFolder,
    selectedItemId,
    selectedItemType,
    isRoot,
    selectedItemSecurity,
    selectedFileInfo,
  ) => {
    if (!selectorProps.getIsDisabled || selectedItemType === "agents")
      return false;

    const isDisabled = selectorProps.getIsDisabled({
      isFirstLoad,
      selectedItemId,
      selectedItemType,
      isRoot,
      selectedItemSecurity: selectedItemSecurity as
        | FilesSecurity
        | Security
        | undefined,
      selectedFileInfo,
    });

    return isDisabled;
  };

  const {
    onBackClick: onBackClickCb,
    withBackButton,
    label,
    isCloseable,
  } = selectorProps.headerProps || {};

  const onBackClick: THeaderBackButton["onBackClick"] = async () => {
    if (!onBackClickCb) return;
    const message = await onBackClickCb();
    dispatchMessage({ message, pluginName });
  };

  const headerBackButtonProps: THeaderBackButton = withBackButton
    ? {
        withoutBackButton: false,
        onBackClick,
        withoutBorder: false,
      }
    : {
        withoutBackButton: undefined,
        onBackClick: undefined,
        withoutBorder: undefined,
      };

  const headerProps: TSelectorHeader = selectorProps.withHeader
    ? {
        withHeader: true,
        headerProps: {
          headerLabel: label ?? t("Common:SelectFile"),
          isCloseable: isCloseable,
          onCloseClick: onCancel,
          ...headerBackButtonProps,
        },
      }
    : {};

  return (
    <FilesSelector
      isPanelVisible
      onCancel={onCancel}
      onSubmit={onSubmit}
      getIsDisabled={getIsDisabled}
      onSelectItem={onSelectItem}
      openRoot={openRoot}
      getIcon={getIcon!}
      withSearch={!!withSearch}
      withBreadCrumbs={!!withBreadCrumbs}
      withCancelButton={!!withCancelButton}
      cancelButtonLabel={cancelButtonLabel ?? t("Common:CancelButton")}
      submitButtonLabel={submitButtonLabel ?? t("Common:AddButton")}
      withCreate={!!withCreate}
      withFooterCheckbox={!!withFooterCheckbox}
      withFooterInput={!!withFooterInput}
      disabledItems={[]}
      isRoomsOnly={!!isRoomsOnly}
      isThirdParty={false}
      currentFolderId={currentFolderId ?? ""}
      footerCheckboxLabel={footerCheckboxLabel ?? ""}
      footerInputHeader={footerInputHeader ?? ""}
      currentFooterInputValue={currentFooterInputValue ?? ""}
      descriptionText={descriptionText ?? ""}
      currentDeviceType={
        isDesktop()
          ? DeviceType.desktop
          : isTablet()
            ? DeviceType.tablet
            : DeviceType.mobile
      }
      rootFolderType={
        (rootFolderType || FolderType.Rooms) as unknown as SdkFolderType
      }
      getFilesArchiveError={() => ""}
      isMultiSelect={!!isMultiSelect}
      renderInPortal
      {...headerProps}
      withoutBackButton={false}
      filterParam={filterParam}
    />
  );
};

export default inject<TStore>(({ filesSettingsStore, selectedFolderStore }) => {
  const { getIcon } = filesSettingsStore;
  const { rootFolderType } = selectedFolderStore;

  return {
    getIcon,
    rootFolderType,
  };
})(observer(PluginFilesSelector));
