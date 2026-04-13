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

import React, { useCallback } from "react";
import { Link, useLocation } from "react-router";
import { inject, observer } from "mobx-react";

import { DeviceType } from "@docspace/shared/enums";
import { AnimationEvents } from "@docspace/ui-kit/hooks/useAnimation";
import { ArticleItem } from "@docspace/ui-kit/components/article/item";

import type { IArticleNavigationItemClient } from "SRC_DIR/helpers/plugins/types";
import { Section } from "SRC_DIR/helpers/plugins/enums";
import { PLUGIN_SECTION_URL_PART } from "SRC_DIR/helpers/plugins/constants";
import type PluginStore from "SRC_DIR/store/PluginStore";

interface ArticleNavPluginItemProps {
  item: IArticleNavigationItemClient;
  showText?: boolean;
  toggleArticleOpen?: () => void;
  currentDeviceType?: string;
  section: Section;
  dispatchMessage?: PluginStore["dispatchMessage"];
}

const ArticleNavPluginItem: React.FC<ArticleNavPluginItemProps> = ({
  item,
  showText = true,
  toggleArticleOpen,
  currentDeviceType,
  section,
  dispatchMessage,
}) => {
  const { key, label, icon, pluginName, onClick } = item;
  const location = useLocation();

  const getLocationPath = () => {
    const path = `${PLUGIN_SECTION_URL_PART}${pluginName}/${key}`;

    switch (section) {
      case Section.Settings:
        return "/portal-settings".concat(path);
      case Section.Accounts:
        return `/accounts`.concat(path);
      default:
        return path;
    }
  };

  const path = getLocationPath();

  const isActive =
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const isMobileView = currentDeviceType === DeviceType.mobile;

  const onSelect = useCallback(async () => {
    if (onClick) {
      const message = await onClick();
      if (message) dispatchMessage?.({ message, pluginName });
    }

    if (!isMobileView) {
      if (isActive) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent(AnimationEvents.END_ANIMATION));
        }, 0);
      } else {
        window.dispatchEvent(
          new CustomEvent(AnimationEvents.ANIMATION_STARTED),
        );
      }
    }

    if (isMobileView) {
      toggleArticleOpen?.();
    }
  }, [
    onClick,
    dispatchMessage,
    pluginName,
    isMobileView,
    isActive,
    toggleArticleOpen,
  ]);

  return (
    <ArticleItem
      key={key}
      folderId={`plugin-nav-${pluginName}-${key}`}
      text={label}
      title={label}
      icon={icon}
      showText={showText}
      isActive={isActive}
      onClick={onSelect}
      linkData={{ path, state: {} }}
      LinkRouter={Link}
      withAnimation={!isMobileView}
    />
  );
};

export default inject(({ settingsStore, pluginStore }: TStore) => ({
  showText: settingsStore.showText,
  toggleArticleOpen: settingsStore.toggleArticleOpen,
  currentDeviceType: settingsStore.currentDeviceType,
  dispatchMessage: pluginStore?.dispatchMessage,
}))(observer(ArticleNavPluginItem));

