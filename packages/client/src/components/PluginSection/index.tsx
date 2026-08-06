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

import { useEffect, useState, useCallback } from "react";
import { Navigate, useLocation, useParams } from "react-router";
import { inject, observer } from "mobx-react";

import type { IBox } from "@onlyoffice/docspace-plugin-sdk";

import WrappedComponent from "SRC_DIR/helpers/plugins/WrappedComponent";
import { PluginComponents } from "SRC_DIR/helpers/plugins/enums";
import { getPluginSectionByPath } from "SRC_DIR/helpers/plugins/navigation";
import type { IArticleNavigationItemClient } from "SRC_DIR/helpers/plugins/types";

import PluginStore from "SRC_DIR/store/PluginStore";
import type SelectedFolderStore from "SRC_DIR/store/SelectedFolderStore";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { AnimationEvents } from "@docspace/ui-kit/hooks/useAnimation";

type SetSelectedFolder = SelectedFolderStore["setSelectedFolder"];

interface PluginSectionContentProps {
  pluginName: string;
  item: IArticleNavigationItemClient;
  setSelectedFolder: SetSelectedFolder;
}

const PluginSectionContent = ({
  pluginName,
  item,
  setSelectedFolder,
}: PluginSectionContentProps) => {
  const [sectionProps, setSectionProps] = useState<IBox | null>(null);

  const onLoadAction = useCallback(async () => {
    try {
      if (!item?.onLoad) return;

      const res = await item.onLoad();

      const { section } = res;

      if (section) {
        setSectionProps({ ...section });
      }
    } finally {
      window.dispatchEvent(new CustomEvent(AnimationEvents.END_ANIMATION));
    }
  }, [item]);

  useEffect(() => {
    onLoadAction();
  }, [onLoadAction]);

  useEffect(() => {
    setSelectedFolder(null);
  }, [setSelectedFolder]);

  return (
    <WrappedComponent
      pluginName={pluginName}
      component={{
        component: PluginComponents.box,
        props: sectionProps ?? item.section,
      }}
      saveButton={undefined}
      setSaveButtonProps={undefined}
      setModalRequestRunning={undefined}
      modalRequestRunning={undefined}
    />
  );
};

interface PluginSectionProps {
  setSelectedFolder: SetSelectedFolder;
  articleNavigationItems?: PluginStore["articleNavigationItems"];
  enablePlugins: SettingsStore["enablePlugins"];
  arePluginsLoaded: boolean;
}

const PluginSection = ({
  articleNavigationItems,
  setSelectedFolder,
  enablePlugins,
  arePluginsLoaded,
}: PluginSectionProps) => {
  const { pathname } = useLocation();
  const { itemKey } = useParams<{ itemKey: string }>();

  if (!enablePlugins) return <Navigate to="/" replace />;

  if (!arePluginsLoaded) return null;

  const section = getPluginSectionByPath(pathname);
  const item = itemKey ? articleNavigationItems?.get(itemKey) : undefined;

  const isAllowed =
    !!item && !!section && (!item.appears || item.appears.includes(section));

  if (!isAllowed) return <Navigate to="/" replace />;

  return (
    <PluginSectionContent
      key={itemKey}
      pluginName={item.pluginName}
      item={item}
      setSelectedFolder={setSelectedFolder}
    />
  );
};

export const Component = inject(
  ({ pluginStore, selectedFolderStore, settingsStore }: TStore) => ({
    articleNavigationItems: pluginStore.articleNavigationItems,
    setSelectedFolder: selectedFolderStore.setSelectedFolder,
    enablePlugins: settingsStore.enablePlugins,
    arePluginsLoaded: pluginStore.isLoaded,
  }),
)(observer(PluginSection));
