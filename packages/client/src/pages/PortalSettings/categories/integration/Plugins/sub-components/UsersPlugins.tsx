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
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { Loader, LoaderTypes } from "@onlyoffice/apps-ui-kit/components/loader";
import { EmptyScreenContainer } from "@onlyoffice/apps-ui-kit/components/empty-screen-container";
import { useTheme } from "@onlyoffice/apps-ui-kit/context/ThemeContext";
import { getCookie } from "@onlyoffice/apps-ui-kit/utils/cookie";
import { LANGUAGE } from "@docspace/shared/constants";
import type { TMemberPlugin } from "@docspace/shared/api/plugins/types";

import EmptyScreenPluginsUrl from "PUBLIC_DIR/images/emptyview/empty.plugins.light.svg?url";
import EmptyScreenPluginsDarkUrl from "PUBLIC_DIR/images/emptyview/empty.plugins.dark.svg?url";

import { getLocalizedText } from "SRC_DIR/helpers/plugins/personal";
import { useStore } from "SRC_DIR/store/useStore";

import PersonalPluginsSwitch from "./PersonalPluginsSwitch";
import UsersPluginsList from "./UsersPluginsList";

import styles from "../Plugins.module.scss";

const UsersPlugins = () => {
  const { t } = useTranslation(["WebPlugins", "Common"]);
  const { isBase } = useTheme();

  const { pluginOptions } = useStore("settingsStore");
  const {
    usersPlugins,
    isUsersPluginsLoaded,
    fetchUsersPlugins,
    switchPersonalPlugins,
    updateUserPlugin,
    setDeletePluginDialogProps,
    setDeletePluginDialogVisible,
  } = useStore("pluginStore");

  const language = getCookie(LANGUAGE) || "en";

  useEffect(() => {
    fetchUsersPlugins();
  }, [fetchUsersPlugins]);

  const onSwitch = (plugin: TMemberPlugin, enabled: boolean) =>
    updateUserPlugin(plugin.createBy.id, plugin.name, enabled);

  const onDelete = (plugin: TMemberPlugin) => {
    setDeletePluginDialogProps({
      pluginName: plugin.name,
      userId: plugin.createBy?.id,
      userName: plugin.createBy?.displayName,
      pluginTitle: getLocalizedText(plugin.nameLocale, language, plugin.name),
    });
    setDeletePluginDialogVisible(true);
  };

  const list = !isUsersPluginsLoaded ? (
    <Loader type={LoaderTypes.track} size="20px" />
  ) : usersPlugins.length === 0 ? (
    <EmptyScreenContainer
      className={styles.emptyScreen}
      imageSrc={isBase ? EmptyScreenPluginsUrl : EmptyScreenPluginsDarkUrl}
      imageAlt={t("NoUsersPlugins")}
      headerText={t("NoUsersPlugins")}
      descriptionText={t("NoUsersPluginsDescription")}
      style={{ gridColumnGap: "39px" }}
    />
  ) : (
    <UsersPluginsList
      items={usersPlugins}
      language={language}
      onSwitch={onSwitch}
      onDelete={onDelete}
    />
  );

  return (
    <div className={styles.usersPlugins}>
      <PersonalPluginsSwitch
        isEnabled={pluginOptions.personal}
        onSwitch={switchPersonalPlugins}
      />
      <Text className={styles.usersPluginsDescription} lineHeight="20px">
        {t("UsersPluginsDescription")}
      </Text>
      {list}
    </div>
  );
};

export default observer(UsersPlugins);
