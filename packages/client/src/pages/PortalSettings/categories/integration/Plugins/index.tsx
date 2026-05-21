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

import { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { SettingsStore } from "@docspace/shared/store/SettingsStore";

import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import PluginStore from "SRC_DIR/store/PluginStore";
import ClientLoadingStore from "SRC_DIR/store/ClientLoadingStore";

import Dropzone from "./sub-components/Dropzone";
import PluginItem from "./sub-components/PluginItem";
import EmptyScreen from "./sub-components/EmptyScreen";
import ListLoader from "./sub-components/ListLoader";
import UploadDescription from "./sub-components/UploadDescription";
import PluginCacheWarningDialog from "./sub-components/PluginCacheWarningDialog";
import usePluginUpload from "./hooks/usePluginUpload";

import styles from "./Plugins.module.scss";
import { PluginsProps } from "./Plugins.types";

const PluginPage = ({
  withUpload,

  pluginList,

  openSettingsDialog,
  updatePlugin,
  addPlugin,

  theme,
  isEmptyList,
  currentColorScheme,
  pluginsSdkUrl,

  showPortalSettingsLoader,
}: PluginsProps) => {
  const { t, ready } = useTranslation(["WebPlugins", "Common"]);

  const { onDrop, showCacheWarning, handleCloseCacheWarning } = usePluginUpload(
    { addPlugin },
  );

  useEffect(() => {
    setDocumentTitle(t("Common:Plugins"));
  }, [t]);

  return (
    <>
      {showPortalSettingsLoader ||
      (!isEmptyList && pluginList.length === 0) ||
      !ready ? (
        <div className={styles.container}>
          <ListLoader withUpload={withUpload} />
        </div>
      ) : isEmptyList ? (
        <div className={styles.emptyContainer}>
          <EmptyScreen
            t={t}
            theme={theme}
            onDrop={onDrop}
            withUpload={withUpload}
            pluginsSdkUrl={pluginsSdkUrl}
            currentColorScheme={currentColorScheme}
          />
        </div>
      ) : (
        <div className={styles.container}>
          {/* <Header
            t={t}
            currentColorScheme={currentColorScheme}
           
            withUpload={withUpload}
          /> */}
          {withUpload ? (
            <>
              <UploadDescription
                t={t}
                pluginsSdkUrl={pluginsSdkUrl}
                currentColorScheme={currentColorScheme}
              />
              <Dropzone
                onDrop={onDrop}
                isDisabled={!withUpload}
                isLoading={false}
                dataTestId="upload_plugin_dropzone"
              />
              <PluginCacheWarningDialog
                visible={showCacheWarning}
                onClose={handleCloseCacheWarning}
              />
            </>
          ) : null}
          <div className={styles.pluginListContainer}>
            {pluginList.map((plugin) => (
              <PluginItem
                key={`plugin-${plugin.name}-${plugin.version}`}
                openSettingsDialog={openSettingsDialog}
                updatePlugin={updatePlugin}
                theme={theme}
                dataTestId={`plugin_${plugin.name}`}
                {...plugin}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default inject(
  ({
    settingsStore,
    pluginStore,
    clientLoadingStore,
  }: {
    settingsStore: SettingsStore;
    pluginStore: PluginStore;
    clientLoadingStore: ClientLoadingStore;
  }) => {
    const { pluginOptions, currentColorScheme, theme, pluginsSdkUrl } =
      settingsStore;

    const { showPortalSettingsLoader } = clientLoadingStore;

    const withUpload = pluginOptions.upload;

    const {
      pluginList,
      updatePlugin,
      updatePlugins,
      setCurrentSettingsDialogPlugin,
      setSettingsPluginDialogVisible,

      addPlugin,

      isEmptyList,
    } = pluginStore;

    const openSettingsDialog = (pluginName: string) => {
      setSettingsPluginDialogVisible(true);
      setCurrentSettingsDialogPlugin({ pluginName });
    };

    return {
      withUpload,

      pluginList,

      updatePlugin,
      updatePlugins,

      openSettingsDialog,

      addPlugin,

      currentColorScheme,
      theme,
      isEmptyList,
      pluginsSdkUrl,

      showPortalSettingsLoader,
    };
  },
)(observer(PluginPage));
