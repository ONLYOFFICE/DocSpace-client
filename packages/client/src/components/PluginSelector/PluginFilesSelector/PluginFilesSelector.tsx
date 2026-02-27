// (c) Copyright Ascensio System SIA 2009-2026
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

import { inject, observer } from "mobx-react";
import { useEffect, useEffectEvent } from "react";
import { useTranslation } from "react-i18next";
import type {
  FilesSecurity,
  Security,
  TFilesSelector,
} from "@onlyoffice/docspace-plugin-sdk";

import FilesSelector from "@docspace/ui-kit/selectors/Files";
import { TSelectorHeader } from "@docspace/ui-kit/components/selector";
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

  const headerProps: TSelectorHeader = selectorProps.withHeader
    ? {
        withHeader: true,
        headerProps: {
          headerLabel:
            selectorProps.headerProps?.label ?? t("Common:SelectFile"),
          isCloseable: selectorProps.headerProps?.isCloseable,
          onCloseClick: onCancel,
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
      withoutBackButton
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
