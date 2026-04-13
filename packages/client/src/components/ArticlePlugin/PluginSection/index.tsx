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

import { useEffect, useState, useCallback } from "react";
import { Navigate, useParams } from "react-router";
import { inject, observer } from "mobx-react";

import type { IBox } from "@onlyoffice/docspace-plugin-sdk";

import WrappedComponent from "SRC_DIR/helpers/plugins/WrappedComponent";
import { PluginComponents } from "SRC_DIR/helpers/plugins/enums";

import PluginStore from "SRC_DIR/store/PluginStore";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { AnimationEvents } from "@docspace/ui-kit/hooks/useAnimation";

const ProtectedRoute = ({
  allowed,
  children,
}: {
  allowed: boolean;
  children: React.ReactNode;
}) => {
  if (!allowed) return <Navigate to="/" replace />;
  return <>{children}</>;
};

type TItem = NonNullable<
  ReturnType<NonNullable<PluginStore["articleNavigationItems"]>["get"]>
>;

interface PluginSectionContentProps {
  pluginName: string;
  item: TItem;
  setSelectedFolder: (folder: null) => void;
}

const PluginSection = ({
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
  setSelectedFolder: (folder: null) => void;
  articleNavigationItems?: PluginStore["articleNavigationItems"];
  enablePlugins: SettingsStore["enablePlugins"];
  isPluginsLoading: boolean;
  isArticleLoading: boolean;
  showPortalSettingsLoader: boolean;
  showArticleLoader: boolean;
}

const PluginSectionWrapper = ({
  articleNavigationItems,
  setSelectedFolder,
  enablePlugins,
  isPluginsLoading,
}: PluginSectionProps) => {
  const { pluginName, itemKey } = useParams<{
    pluginName: string;
    itemKey: string;
  }>();

  if (isPluginsLoading) return null;

  const item =
    pluginName && itemKey && articleNavigationItems
      ? articleNavigationItems.get(itemKey)
      : undefined;

  const isAllowed =
    enablePlugins &&
    !!pluginName &&
    !!itemKey &&
    !!articleNavigationItems &&
    !!item &&
    item.pluginName === pluginName;

  return (
    <ProtectedRoute allowed={isAllowed}>
      <PluginSection
        key={`${pluginName}-${itemKey}`}
        pluginName={pluginName!}
        item={item!}
        setSelectedFolder={setSelectedFolder}
      />
    </ProtectedRoute>
  );
};

export const Component = inject(
  ({ pluginStore, selectedFolderStore, settingsStore }: TStore) => ({
    articleNavigationItems: pluginStore.articleNavigationItems,
    setSelectedFolder: selectedFolderStore.setSelectedFolder,
    enablePlugins: settingsStore.enablePlugins,
    isPluginsLoading:
      !pluginStore.isEmptyList && pluginStore.pluginList.length === 0,
  }),
)(observer(PluginSectionWrapper));

