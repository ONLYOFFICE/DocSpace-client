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

import { useCallback, useEffect } from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { getCookie } from "@onlyoffice/apps-ui-kit/utils/cookie";
import { LANGUAGE } from "@docspace/shared/constants";

import { useStore } from "SRC_DIR/store/useStore";
import {
  getLocalizedText,
  getPersonalPluginRows,
} from "SRC_DIR/helpers/plugins/personal";
import Dropzone from "SRC_DIR/pages/PortalSettings/categories/integration/Plugins/sub-components/Dropzone";
import PluginItem from "SRC_DIR/pages/PortalSettings/categories/integration/Plugins/sub-components/PluginItem";
import PluginCacheWarningDialog from "SRC_DIR/pages/PortalSettings/categories/integration/Plugins/sub-components/PluginCacheWarningDialog";
import ListLoader from "SRC_DIR/pages/PortalSettings/categories/integration/Plugins/sub-components/ListLoader";
import usePluginUpload from "SRC_DIR/pages/PortalSettings/categories/integration/Plugins/hooks/usePluginUpload";
import pluginStyles from "SRC_DIR/pages/PortalSettings/categories/integration/Plugins/Plugins.module.scss";

import styles from "./plugins.module.scss";

const PersonalPlugins = () => {
  const { t } = useTranslation(["WebPlugins", "Common"]);

  const {
    personalPlugins,
    pluginList,
    addPlugin,
    updatePlugin,
    fetchPersonalPlugins,
    setSettingsPluginDialogVisible,
    setCurrentSettingsDialogPlugin,
    setDeletePluginDialogVisible,
    setDeletePluginDialogProps,
    checkPluginCompatibility,
    isLoaded,
    needPageReload,
  } = useStore("pluginStore");

  const { pluginOptions, theme, culture } = useStore("settingsStore");

  const language = (getCookie(LANGUAGE) || culture) as string;

  const addPersonalPlugin = useCallback(
    (data: FormData) => addPlugin(data, true),
    [addPlugin],
  );

  const { onDrop, showCacheWarning, handleCloseCacheWarning } = usePluginUpload(
    { addPlugin: addPersonalPlugin },
  );

  useEffect(() => {
    fetchPersonalPlugins();
  }, [fetchPersonalPlugins]);

  useEffect(() => {
    if (!needPageReload) return;

    return () => window.location.reload();
  }, [needPageReload]);

  const openSettingsDialog = (pluginName: string) => {
    setSettingsPluginDialogVisible(true);
    setCurrentSettingsDialogPlugin({ pluginName });
  };

  const openDeleteDialog = (pluginName: string) => {
    setDeletePluginDialogVisible(true);
    setDeletePluginDialogProps({ pluginName, personal: true });
  };

  const rows = getPersonalPluginRows(personalPlugins, pluginList);

  return (
    <div className={styles.wrapper}>
      <Text className={styles.description} lineHeight="20px">
        {t("WebPlugins:PersonalPluginsDescription")}
      </Text>

      {pluginOptions.upload ? (
        <>
          <Dropzone
            onDrop={onDrop}
            isDisabled={false}
            isLoading={false}
            dataTestId="upload_personal_plugin_dropzone"
          />
          <PluginCacheWarningDialog
            visible={showCacheWarning}
            onClose={handleCloseCacheWarning}
          />
        </>
      ) : null}

      {isLoaded ? (
        <div className={pluginStyles.pluginListContainer}>
          {rows.map(({ own, loaded, shadowedBy }) =>
            loaded ? (
              <PluginItem
                key={`plugin-${loaded.name}-${loaded.version}`}
                {...loaded}
                updatePlugin={updatePlugin}
                openSettingsDialog={openSettingsDialog}
                theme={theme}
                dataTestId={`personal_plugin_${loaded.name}`}
              />
            ) : (
              <PluginItem
                key={`plugin-${own.name}-${own.version}`}
                name={own.name}
                nameLocale={getLocalizedText(
                  own.nameLocale,
                  language,
                  own.name,
                )}
                version={own.version}
                compatible={checkPluginCompatibility(own.minDocSpaceVersion)}
                descriptionLocale={getLocalizedText(
                  own.descriptionLocale,
                  language,
                  own.description,
                )}
                enabled={own.enabled}
                image={own.image}
                url={own.url}
                theme={theme}
                shadowedBy={shadowedBy}
                onDelete={() => openDeleteDialog(own.name)}
                dataTestId={`personal_plugin_${own.name}`}
              />
            ),
          )}
        </div>
      ) : (
        <ListLoader withUpload={false} />
      )}
    </div>
  );
};

export default observer(PersonalPlugins);
